# 06: Backend テスト

## 目的・ゴール

backend の各レイヤー（utils, services, routes, pipeline）のテストを作成し、品質を担保する。unit テスト（FFmpeg 不要）と integration テスト（FFmpeg 必要）を分離する。

## 依存関係

- 03-backend-server（project-service, paths.ts）
- 04-job-queue（job-queue.ts + テスト済み）
- 05-asset-import（routes, asset-service 統合）

## 作成するファイル一覧

| ファイル | 種別 | テスト対象 |
|---------|------|-----------|
| `app/backend/src/utils/paths.test.ts` | unit | path traversal 防止、パス解決 |
| `app/backend/src/services/project-service.test.ts` | unit | Project CRUD (一時ディレクトリ使用) |
| `app/backend/src/services/asset-service.test.ts` | unit | ファイル保存、kind 判定、Job 登録 (FFmpeg モック) |
| `app/backend/src/routes/projects.test.ts` | API | Hono app.request() で CRUD テスト |
| `app/backend/src/routes/assets.test.ts` | API | Import リクエスト (FFmpeg モック) |
| `app/backend/src/routes/jobs.test.ts` | API | Job ステータス取得、retry |
| `app/backend/src/pipeline/tools/ffmpeg.test.ts` | integration | FFmpeg 実行 (FFmpeg 必要) |
| `app/backend/src/pipeline/runner.test.ts` | unit | パイプライン実行順序、エラーハンドリング |
| `app/backend/test/fixtures/` | - | テスト用素材 (sample.mp4, sample.jpg, sample.heic) |

## 実装の詳細

### paths.test.ts

```ts
import { describe, test, expect } from "bun:test";
import { resolveWorkspacePath, projectDir, assetsDir } from "./paths";

describe("paths", () => {
  test("resolveWorkspacePath returns absolute path within workspace", () => {
    const p = resolveWorkspacePath("projects", "abc", "assets");
    expect(p).toContain("workspace/projects/abc/assets");
  });

  test("resolveWorkspacePath throws on path traversal", () => {
    expect(() => resolveWorkspacePath("../etc/passwd")).toThrow("Path traversal");
    expect(() => resolveWorkspacePath("projects", "..", "..", "etc")).toThrow("Path traversal");
  });

  test("projectDir returns correct path", () => {
    const p = projectDir("test-id");
    expect(p).toContain("workspace/projects/test-id");
  });
});
```

### project-service.test.ts

テスト方針: 一時ディレクトリを `WORKSPACE_ROOT` として使用。

```ts
import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

describe("project-service", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await mkdtemp(path.join(tmpdir(), "video-test-"));
    // WORKSPACE_ROOT を一時ディレクトリに差し替える方法を検討
    // 方法A: 環境変数 WORKSPACE_DIR
    // 方法B: DI で paths モジュールを差し替え
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  test("createProject creates directory and project.json", async () => {
    // ...
  });

  test("getProject reads project.json", async () => {
    // ...
  });

  test("listProjects returns all projects", async () => {
    // ...
  });

  test("updateProject updates name and updatedAt", async () => {
    // ...
  });

  test("deleteProject removes directory", async () => {
    // ...
  });
});
```

**設計上の注意**: `paths.ts` の `WORKSPACE_ROOT` をテスト時に差し替え可能にするため、環境変数 `WORKSPACE_DIR` を読む方式が推奨:

```ts
// paths.ts 冒頭
const WORKSPACE_ROOT = path.resolve(process.env.WORKSPACE_DIR ?? "workspace");
```

### asset-service.test.ts

```ts
describe("asset-service", () => {
  test("detectKind returns 'video' for .mp4", () => { /* ... */ });
  test("detectKind returns 'image' for .jpg", () => { /* ... */ });
  test("detectKind returns 'image' for .heic", () => { /* ... */ });
  test("detectKind returns 'audio' for .mp3", () => { /* ... */ });
  test("importAsset saves file and enqueues job", async () => {
    // FFmpeg をモックし、ファイル保存と Job 登録のみを検証
  });
});
```

### routes/projects.test.ts

Hono の `app.request()` を使って HTTP レベルのテスト:

```ts
import { describe, test, expect } from "bun:test";
import { app } from "../app";

describe("routes/projects", () => {
  test("POST /api/projects creates project", async () => {
    const res = await app.request("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "test project" }),
    });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.id).toBeDefined();
    expect(body.name).toBe("test project");
  });

  test("GET /api/projects returns list", async () => {
    const res = await app.request("/api/projects");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.projects).toBeInstanceOf(Array);
  });

  test("GET /api/projects/:id returns 404 for unknown", async () => {
    const res = await app.request("/api/projects/nonexistent");
    expect(res.status).toBe(500); // or 404 if error handling is specific
  });
});
```

### ffmpeg.test.ts (integration)

```ts
import { describe, test, expect } from "bun:test";
import { ffmpegTool } from "./ffmpeg";
import path from "node:path";

const FIXTURES = path.resolve(__dirname, "../../../test/fixtures");

describe("ffmpeg (integration)", () => {
  test("checkInstalled does not throw", async () => {
    await ffmpegTool.checkInstalled();
  });

  test("probe returns metadata for video", async () => {
    const result = await ffmpegTool.probe(path.join(FIXTURES, "sample.mp4"));
    expect(result.width).toBeGreaterThan(0);
    expect(result.height).toBeGreaterThan(0);
    expect(result.durationMs).toBeGreaterThan(0);
    expect(result.codec).toBeDefined();
  });

  test("generateThumbnail creates JPEG file", async () => {
    // ... tmpdir + output path + file exists check
  });

  test("generateProxy creates MP4 file", async () => {
    // ... tmpdir + output path + file exists check
  });
});
```

### runner.test.ts

```ts
describe("pipeline runner", () => {
  test("runs steps in order", async () => {
    // モックステップを登録、実行順を検証
  });

  test("skips steps where canHandle returns false", async () => {
    // ...
  });

  test("reports progress correctly", async () => {
    // onProgress コールバックの引数を検証
  });

  test("propagates step errors", async () => {
    // step.execute が throw → runPipeline も throw
  });
});
```

### テスト用素材

`app/backend/test/fixtures/` に以下を配置:

| ファイル | 用途 | サイズ目安 |
|---------|------|-----------|
| `sample.mp4` | 動画 probe/thumbnail/proxy テスト | 数秒、数百KB |
| `sample.jpg` | 画像 probe/thumbnail テスト | 数十KB |
| `sample.heic` | HEIC → JPEG 変換テスト | 数十KB |

## テストコマンド

```bash
# 全 backend テスト
bun test

# unit テストのみ（FFmpeg 不要）
bun test --grep "unit"

# integration テストのみ（FFmpeg 必要）
bun test --grep "integration"

# 特定ファイルのみ
bun test app/backend/src/utils/paths.test.ts
```

## 完了条件

1. `bun test` で全テストがパスする（FFmpeg がインストール済みの環境）
2. path traversal 防止が検証されている
3. Project CRUD の全操作がテストされている
4. Job ライフサイクル（pending → completed/failed → retry）がテストされている
5. FFmpeg integration テストでサムネイル/プロキシの生成が検証されている
6. Hono app.request() での API テストが動作する
