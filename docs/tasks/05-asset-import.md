# 05: Asset Import API

## 目的・ゴール

ファイルアップロード → ディスク保存 → Job キュー登録 → パイプライン実行（probe → thumbnail → proxy/image-convert）の一連の流れを API として提供する。静的ファイル配信で生成済みの proxy/thumbnail をフロントエンドに返す。

## 依存関係

- 02-shared-types（Asset, Job, API 型）
- 03-backend-server（app.ts, paths.ts, project-service）
- 04-job-queue（job-queue.ts）
- 既存: pipeline/ 一式、services/asset-service.ts

## 既存コード

- `app/backend/src/pipeline/` — パイプライン全体（types, registry, runner, definitions, tools/ffmpeg, steps/）
- `app/backend/src/services/asset-service.ts` — `createImportTask()` のみ（Job task を組み立てる薄いアダプタ）

## 作成・変更するファイル一覧

| ファイル | 操作 | 内容 |
|---------|------|------|
| `app/backend/src/routes/assets.ts` | 新規 | POST /api/assets/import |
| `app/backend/src/routes/jobs.ts` | 新規 | GET /api/jobs/:id, POST /api/jobs/:id/retry |
| `app/backend/src/routes/media.ts` | 新規 | 静的ファイル配信 |
| `app/backend/src/services/asset-service.ts` | 変更 | ファイル保存 + Asset 生成 + Job 登録の統合 |
| `app/backend/src/app.ts` | 変更 | 新規ルートのマウント追加 |

## 実装の詳細

### routes/assets.ts

```ts
import { Hono } from "hono";
import { importAsset } from "../services/asset-service";

const assets = new Hono();

/**
 * POST /api/assets/import?projectId=xxx&filename=yyy
 *
 * Body: raw binary stream (application/octet-stream)
 * Response: { asset, jobId }
 */
assets.post("/import", async (c) => {
  const projectId = c.req.query("projectId");
  const filename = c.req.query("filename");
  if (!projectId || !filename) {
    return c.json({ error: "projectId and filename are required" }, 400);
  }

  const body = c.req.raw.body;
  if (!body) {
    return c.json({ error: "Request body is required" }, 400);
  }

  const result = await importAsset(projectId, filename, body);
  return c.json(result, 201);
});

export { assets };
```

### routes/jobs.ts

```ts
import { Hono } from "hono";
import { getJob, retry } from "../services/job-queue";

const jobsRouter = new Hono();

// GET /api/jobs/:id
jobsRouter.get("/:id", (c) => {
  const job = getJob(c.req.param("id"));
  if (!job) return c.json({ error: "Job not found" }, 404);
  return c.json(job);
});

// POST /api/jobs/:id/retry
jobsRouter.post("/:id/retry", (c) => {
  try {
    const job = retry(c.req.param("id"));
    return c.json(job);
  } catch (err) {
    return c.json({ error: (err as Error).message }, 400);
  }
});

export { jobsRouter };
```

### routes/media.ts

静的ファイル配信。proxy, thumbnail, assets をプロジェクト別に配信する。

```ts
import { Hono } from "hono";
import { resolveWorkspacePath } from "../utils/paths";

const media = new Hono();

/**
 * GET /media/projects/:projectId/:type/:filename
 * type: "proxy" | "thumbnails" | "assets"
 */
media.get("/projects/:projectId/:type/:filename", async (c) => {
  const { projectId, type, filename } = c.req.param();
  // type を制限してセキュリティ確保
  if (!["proxy", "thumbnails", "assets"].includes(type)) {
    return c.json({ error: "Invalid media type" }, 400);
  }
  const filePath = resolveWorkspacePath("projects", projectId, type, filename);
  const file = Bun.file(filePath);
  if (!(await file.exists())) {
    return c.json({ error: "File not found" }, 404);
  }
  return new Response(file);
});

export { media };
```

### services/asset-service.ts（変更後）

既存の `createImportTask` はそのまま保持し、新しい `importAsset` 関数を追加:

```ts
import type { Asset, ImportAssetResponse } from "@video/shared";
import { generateId } from "@video/shared";
import { assetsDir, projectDir } from "../utils/paths";
import { getProject, saveProject } from "./project-service";
import { enqueue } from "./job-queue";
import { createImportTask } from "./asset-service"; // 既存関数
import path from "node:path";

/** ファイル拡張子から AssetKind を判定 */
function detectKind(filename: string): Asset["kind"] {
  const ext = path.extname(filename).toLowerCase();
  if ([".mp4", ".mov", ".avi", ".mkv", ".webm"].includes(ext)) return "video";
  if ([".mp3", ".wav", ".aac", ".m4a", ".ogg"].includes(ext)) return "audio";
  return "image"; // jpg, jpeg, png, heic, webp, etc.
}

/**
 * ファイルをディスクに保存し、Asset を作成し、Job をキューに追加する。
 * POST /api/assets/import から呼ばれる。
 */
export async function importAsset(
  projectId: string,
  filename: string,
  body: ReadableStream<Uint8Array>,
): Promise<ImportAssetResponse> {
  // 1. ファイルをディスクに書き出し
  const destPath = path.join(assetsDir(projectId), filename);
  await Bun.write(destPath, body);

  // 2. Asset オブジェクト作成
  const asset: Asset = {
    id: generateId(),
    kind: detectKind(filename),
    originalPath: `assets/${filename}`,
  };

  // 3. project.json に Asset を追加
  const project = await getProject(projectId);
  project.assets.push(asset);
  await saveProject(project);

  // 4. パイプライン Job をキューに追加
  const task = createImportTask(projectId, projectDir(projectId), asset);
  const job = enqueue(projectId, asset.id, async (j) => {
    const updatedAsset = await task(j);
    // パイプライン完了後、project.json の asset を更新
    const proj = await getProject(projectId);
    const idx = proj.assets.findIndex((a) => a.id === asset.id);
    if (idx !== -1) {
      proj.assets[idx] = updatedAsset;
      await saveProject(proj);
    }
  });

  return { asset, jobId: job.id };
}
```

### app.ts（変更）

追加するルートマウント:

```ts
import { assets } from "./routes/assets";
import { jobsRouter } from "./routes/jobs";
import { media } from "./routes/media";

app.route("/api/assets", assets);
app.route("/api/jobs", jobsRouter);
app.route("/media", media);
```

## API まとめ

| メソッド | パス | 説明 |
|---------|------|------|
| POST | `/api/assets/import?projectId=xxx&filename=yyy` | ファイルインポート |
| GET | `/api/jobs/:id` | Job ステータス取得 |
| POST | `/api/jobs/:id/retry` | Job リトライ |
| GET | `/media/projects/:projectId/:type/:filename` | 静的ファイル配信 |

## 完了条件

1. curl でファイルをアップロードできる:
   ```bash
   curl -X POST "http://localhost:3000/api/assets/import?projectId=<id>&filename=test.jpg" \
     -H "Content-Type: application/octet-stream" \
     --data-binary @test.jpg
   ```
2. レスポンスに `{ asset: {...}, jobId: "..." }` が返る
3. `GET /api/jobs/:jobId` で Job のステータスを追跡できる
4. Job 完了後、`project.json` の asset に `thumbnailPath`, `proxyPath` 等が更新されている
5. `GET /media/projects/:id/thumbnails/<file>` でサムネイル画像が返る
6. `GET /media/projects/:id/proxy/<file>` でプロキシ動画が返る
7. 動画（.mp4）、画像（.jpg, .png）、HEIC でそれぞれ正しいパイプラインが実行される
