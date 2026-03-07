# 02: 共有型定義 (app/shared/)

## 目的・ゴール

backend と frontend で共有するドメイン型、ユーティリティ、定数を `@video/shared` パッケージに定義する。Phase 1 で必要な全ての型を揃える。

## 依存関係

- 01-scaffold（package.json / tsconfig.json が必要）

## 既存コード

- `app/shared/src/types/asset.ts` — `Asset`, `AssetKind` 型 (実装済み)
- `app/shared/src/index.ts` — 上記の re-export (実装済み)

## 作成・変更するファイル一覧

| ファイル | 操作 | 内容 |
|---------|------|------|
| `app/shared/src/types/project.ts` | 新規 | Project, Sequence, Track, Clip, ExportPreset |
| `app/shared/src/types/job.ts` | 新規 | Job, JobStatus |
| `app/shared/src/types/api.ts` | 新規 | API リクエスト/レスポンス型 |
| `app/shared/src/utils/id.ts` | 新規 | ID 生成ユーティリティ |
| `app/shared/src/utils/constants.ts` | 新規 | マジックナンバーの定数化 |
| `app/shared/src/index.ts` | 変更 | 新規モジュールの re-export 追加 |

## 実装の詳細

### types/project.ts

```ts
import type { Asset } from "./asset";

export type Project = {
  id: string;
  name: string;
  createdAt: string;   // ISO 8601
  updatedAt: string;   // ISO 8601
  assets: Asset[];
  sequence: Sequence;
};

export type Sequence = {
  tracks: Track[];
};

export type Track = {
  id: string;
  kind: "video" | "audio" | "title";
  clips: Clip[];
};

export type Clip = {
  id: string;
  assetId: string;
  startMs: number;      // タイムライン上の開始位置
  durationMs: number;   // クリップの表示/再生時間
  inMs: number;         // 素材のトリムイン
  outMs: number;        // 素材のトリムアウト
};

export type ExportPreset = {
  width: number;
  height: number;
  fps: number;
  videoBitrate: string;
  audioBitrate: string;
};
```

### types/job.ts

```ts
export type JobStatus = "pending" | "processing" | "completed" | "failed";

export type Job = {
  id: string;
  projectId: string;
  assetId: string;
  status: JobStatus;
  progress: number;       // 0.0 - 1.0
  error?: string;
  createdAt: string;      // ISO 8601
  updatedAt: string;      // ISO 8601
};
```

### types/api.ts

```ts
import type { Project } from "./project";
import type { Asset } from "./asset";
import type { Job } from "./job";

// --- Projects ---
export type CreateProjectRequest = {
  name: string;
};

export type CreateProjectResponse = Project;

export type ListProjectsResponse = {
  projects: Project[];
};

export type GetProjectResponse = Project;

export type UpdateProjectRequest = Partial<Pick<Project, "name" | "sequence">>;

export type UpdateProjectResponse = Project;

// --- Assets ---
// Import は query params (projectId, filename) + raw body stream
export type ImportAssetResponse = {
  asset: Asset;
  jobId: string;
};

// --- Jobs ---
export type GetJobResponse = Job;
```

### utils/id.ts

```ts
export function generateId(): string {
  return crypto.randomUUID();
}
```

### utils/constants.ts

```ts
/** 画像素材のデフォルト表示時間 (ms) */
export const DEFAULT_IMAGE_DURATION_MS = 3000;

/** Proxy 動画の幅 (px) */
export const PROXY_WIDTH = 1280;

/** Proxy 動画の高さ (px) */
export const PROXY_HEIGHT = 720;

/** サムネイルの高さ (px) */
export const THUMBNAIL_HEIGHT = 360;

/** Job ポーリング間隔 (ms) */
export const JOB_POLL_INTERVAL_MS = 1000;
```

### index.ts（変更後）

```ts
// Types
export type { Asset, AssetKind } from "./types/asset";
export type { Project, Sequence, Track, Clip, ExportPreset } from "./types/project";
export type { Job, JobStatus } from "./types/job";
export type {
  CreateProjectRequest,
  CreateProjectResponse,
  ListProjectsResponse,
  GetProjectResponse,
  UpdateProjectRequest,
  UpdateProjectResponse,
  ImportAssetResponse,
  GetJobResponse,
} from "./types/api";

// Utils
export { generateId } from "./utils/id";

// Constants
export {
  DEFAULT_IMAGE_DURATION_MS,
  PROXY_WIDTH,
  PROXY_HEIGHT,
  THUMBNAIL_HEIGHT,
  JOB_POLL_INTERVAL_MS,
} from "./utils/constants";
```

## 完了条件

1. `tsc --noEmit` が shared パッケージで成功する
2. backend から `import type { Project, Job } from "@video/shared"` が解決できる
3. frontend から同様に import できる
4. `generateId()` が UUID v4 形式の文字列を返す
