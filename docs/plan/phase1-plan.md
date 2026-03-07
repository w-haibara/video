# Phase 1 実装計画: ローカル動画編集ソフト

## Context

iPhoneで撮影した写真・動画をブラウザで編集しMP4書き出しするローカル動画編集ソフトのPhase 1実装。ゼロからのスタートで、現在リポジトリにはdocs/（仕様書）とREADME.mdのみ。Phase 1のゴールは「素材をインポートしてサムネイル表示できる状態」。

---

## 1. プロジェクト構成

Bun workspacesによるシンプルなモノレポ。

```
package.json              # workspaces: ["app/frontend", "app/backend", "app/shared"]
tsconfig.json             # project references
.gitignore                # workspace/, node_modules/, dist/
app/
  shared/                 # @video/shared — 共有型定義
  backend/                # Bun server (port 3000)
  frontend/               # React + Vite (port 5173)
workspace/                # ランタイム生成、gitignore対象
```

### 開発時の構成

- `bun run --hot app/backend/src/index.ts` → port 3000
- `bunx vite` (frontend/) → port 5173
- Vite の `server.proxy` で `/api/*`, `/media/*` を localhost:3000 に転送
- `concurrently` で両方を `bun run dev` で一発起動

### shared パッケージ

- 生の .ts をそのままexport（ビルド不要）
- Bun も Vite も TypeScript を直接importできる
- 両パッケージから `"@video/shared": "workspace:*"` で参照

---

## 2. Backend 設計

### フレームワーク: Hono

Hono を全面的に利用。ルーティング、CORS、静的ファイル配信、エラーハンドリングをHonoで統一。

```
src/
  index.ts              # エントリ: FFmpegチェック, workspace初期化, Hono app を Bun.serve() に渡す
  app.ts                # Hono app 定義, ミドルウェア設定
  routes/
    projects.ts         # Hono Router — Project CRUD
    assets.ts           # Hono Router — Asset import
    jobs.ts             # Hono Router — Job status / retry
    media.ts            # Hono Router — 静的ファイル配信 (proxy, thumbnail)
  services/
    project-service.ts  # project.json の read/write, 一覧取得
    asset-service.ts    # ファイル保存, メタデータ抽出オーケストレーション
    ffmpeg.ts           # FFmpeg/ffprobe ラッパー (全て Bun.spawn + 引数配列)
    job-queue.ts        # インメモリ Job ストア + 逐次実行ランナー
  utils/
    paths.ts            # workspace パス解決, path traversal 防止
```

### Hono の活用箇所

- **ルーティング**: `app.get('/api/projects/:id', handler)` 等。サブルーターで routes/ を分離
- **CORS**: `cors()` ミドルウェア（`origin: 'http://localhost:5173'`）
- **静的ファイル配信**: `serveStatic()` ミドルウェア（proxy, thumbnail, export用）
- **エラーハンドリング**: `app.onError()` でグローバルエラーレスポンス
- **バリデーション**: Hono の `validator()` で必要に応じてリクエスト検証

### サーバー起動

```ts
// index.ts
import { Hono } from 'hono';
const app = new Hono();
// ... ミドルウェア、ルート設定
export default { port: 3000, hostname: '127.0.0.1', fetch: app.fetch };
```

Bun は `export default` でサーバーを起動できるため、`Bun.serve()` を明示的に呼ぶ必要がない。

### ファイルアップロード

大きなファイル（数GBの動画）に対応するため、ストリーム化する。

- `formData()` でメモリに全体を読み込む方式は使わない
- Hono ハンドラ内で `c.req.raw.body`（ReadableStream）を取得し、`Bun.write()` でディスクに直接ストリーミング書き込み
- multipart boundary のパースは手動で行うか、ストリーミング対応の multipart パーサーを利用
- フロントエンドからは `Content-Type: application/octet-stream` でファイル本体を直接送信し、`projectId` と `filename` はクエリパラメータまたはヘッダで渡す方式がシンプル

```ts
// 方式: raw body stream を直接ファイルに書き出す
app.post('/api/assets/import', async (c) => {
  const projectId = c.req.query('projectId');
  const filename = c.req.query('filename');
  const body = c.req.raw.body;
  const destPath = resolveWorkspacePath(projectId, 'assets', filename);
  await Bun.write(destPath, body); // ストリームをそのまま書き出し
  // ... メタデータ抽出、ジョブ登録
});
```

### FFmpeg ラッパー (`services/ffmpeg.ts`)

5つの関数:
- `checkInstalled()` — 起動時チェック
- `probeMetadata(input)` — ffprobe JSON出力をパース
- `generateThumbnail(input, output)` — JPEG 360p, 1フレーム
- `generateProxy(input, output, onProgress?)` — 720p/H.264/30fps
- `convertHeicToJpeg(input, output)` — HEIC→JPEG変換

すべて `Bun.spawn()` の引数配列で実行。シェル文字列結合は一切行わない。

### Job キュー (`services/job-queue.ts`)

- インメモリ Map で管理
- 逐次実行（FFmpegはCPUヘビーなので同時1ジョブ）。複数ファイル同時インポート時はキューイングされる。UIで全Jobの状態を表示
- ステータス: pending → processing → completed / failed
- retry: failed → pending に戻して再キュー
- インメモリなのでサーバー再起動（Hot reload含む）でJob状態は消失する。ただしファイル（proxy/thumbnail）はディスクに残り、project.json も有効なので実害はない

### Import ジョブのパイプライン

1. ファイルを `assets/` にコピー（同期的、POST /api/assets/import のレスポンス前）
2. ジョブをキューに追加（レスポンスで `{ asset, jobId }` を即時返却）
3. ジョブ実行: probe → thumbnail生成 → proxy生成（またはHEIC変換）
4. 各ステップ完了時に project.json を更新

### セキュリティ

- Hono の `export default` で `127.0.0.1:3000` にbind
- `paths.ts` で全パスを `path.resolve()` + workspace prefix チェック
- CORS: Hono `cors()` ミドルウェアで `http://localhost:5173` のみ許可

---

## 3. Frontend 設計

### 状態管理

- **TanStack Query**: サーバー状態（プロジェクト一覧、プロジェクトデータ、Job状態ポーリング）
- **React useState/useReducer**: ローカルUI状態
- Phase 1では Zustand/Redux 不要（Undo/RedoはPhase 2で導入）

### ルーティング

React Router v6:
- `/` → HomePage
- `/projects/:id` → EditorPage

### コンポーネント構成

```
src/
  main.tsx                     # React root + QueryClientProvider
  App.tsx                      # ルート定義
  api/
    client.ts                  # fetch ラッパー
    projects.ts                # useProjects(), useProject(id), useCreateProject()
    assets.ts                  # useImportAsset()
    jobs.ts                    # useJob(id) — refetchInterval: 1000ms, 完了で停止
  pages/
    HomePage.tsx               # プロジェクト一覧 + 新規作成
    EditorPage.tsx             # エディタシェル（左: asset, 中央: preview占位, 下: timeline占位）
  components/
    ProjectCard.tsx            # プロジェクト一覧の1項目
    CreateProjectDialog.tsx    # 名前入力 + 作成ボタン
    AssetPanel.tsx             # サムネイル一覧 + インポートボタン
    AssetThumbnail.tsx         # サムネイル画像 + Job状態オーバーレイ
    JobProgress.tsx            # プログレスバー / ステータス表示
    EditorLayout.tsx           # CSS gridコンテナ
```

### Job ポーリング

TanStack Query の `refetchInterval` を使用。completed/failed で自動停止。

### テスト方針

3層のテスト戦略。レイヤーごとに API の扱いを分離する。

#### Layer 1: コンポーネントテスト（Storybook + MSW）

API モックで高速に動作。CI でも FFmpeg 不要。

- 全コンポーネントに `.stories.tsx` を作成
- Props のバリエーション（loading, error, empty 等）を Story として網羅
- `@storybook/addon-interactions` + `@storybook/test` で `play` 関数にインタラクションテストを記述
- **MSW (Mock Service Worker)** で API レスポンスをモック
  - `msw` + `msw-storybook-addon` を使い、Story のデコレータで API モックを設定
  - モックハンドラは `src/mocks/handlers.ts` に集約し、Story 間で再利用

```
app/frontend/
  src/
    components/
      ProjectCard.tsx
      ProjectCard.stories.tsx     # Story + play 関数 + MSW モック
    mocks/
      handlers.ts                 # MSW ハンドラ（API モック定義）
      browser.ts                  # MSW ブラウザ用 setupWorker
  .storybook/
    main.ts
    preview.ts                    # MSW デコレータをグローバル適用
```

**実行方法**:
- `bun run storybook` — Storybook 起動（開発・ビジュアル確認）
- `bun run test:storybook` — `@storybook/test-runner` (Playwright) で全 Story の play 関数を実行

#### Layer 2: ユニットテスト（Vitest）

- hooks、ユーティリティ関数、API クライアントのテスト
- `bun run test:unit` で実行

#### Layer 3: E2E テスト（Playwright 直接 + 実サーバー）

実際の backend + FFmpeg を起動し、ブラウザでフルフローを検証。

- テスト用の小さなサンプル素材（数秒の動画、小さい画像）を `tests/fixtures/` に配置
- Playwright が backend + frontend を起動 → ブラウザ操作 → 結果検証
- テスト後に workspace をクリーンアップ

```
app/frontend/
  e2e/
    fixtures/
      sample.mp4                  # テスト用動画（数秒）
      sample.jpg                  # テスト用画像
    project-flow.spec.ts          # プロジェクト作成 → 素材インポート → サムネイル表示
    import-formats.spec.ts        # 各フォーマット（JPG, PNG, HEIC, MP4, MOV）のインポート
    job-progress.spec.ts          # Job 進捗表示・エラー・リトライ
  playwright.config.ts            # baseURL, webServer 設定（backend + frontend 自動起動）
```

**playwright.config.ts の webServer 設定**:
```ts
export default defineConfig({
  webServer: [
    {
      command: 'bun run --hot ../../app/backend/src/index.ts',
      port: 3000,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'bunx vite',
      port: 5173,
      reuseExistingServer: !process.env.CI,
    },
  ],
  use: { baseURL: 'http://localhost:5173' },
});
```

**実行方法**:
- `bun run test:e2e` — Playwright で E2E テスト実行（backend + frontend 自動起動）

#### テストコマンドまとめ

| コマンド | 内容 | API | FFmpeg必要 |
|----------|------|-----|-----------|
| `bun run storybook` | Storybook 起動 | MSW モック | 不要 |
| `bun run test:storybook` | Story play 関数を Playwright 実行 | MSW モック | 不要 |
| `bun run test:unit` | Vitest ユニットテスト | モック | 不要 |
| `bun run test:e2e` | Playwright フルフロー | 実サーバー | 必要 |
| `bun run test` | 全テスト実行 | — | 必要 |

---

## 4. 依存パッケージ

### Backend
- `hono` — Webフレームワーク（ルーティング、CORS、静的配信、エラーハンドリング）
- `@video/shared` (workspace)

### Frontend
- `react`, `react-dom` (v19)
- `react-router-dom` (v7)
- `@tanstack/react-query` (v5)
- `@vitejs/plugin-react`, `vite`, `vitest`, `typescript`
- `storybook`, `@storybook/react-vite`, `@storybook/test`, `@storybook/addon-interactions`
- `@storybook/test-runner` (Playwright ベースの Story テスト実行)
- `msw`, `msw-storybook-addon` (API モック)
- `@playwright/test` (E2E テスト)

### Root
- `concurrently`

---

## 5. 実装順序

各ステップが独立してテスト可能なチェックポイントになる。

### Step 1: スキャフォールド
- `package.json` x4, `tsconfig.json` x4, `.gitignore`, `vite.config.ts`, `index.html`
- `bun install`
- backend / frontend の起動確認

### Step 2: 共有型定義 (`app/shared/`)
- `types/project.ts` — Project, Asset, Sequence, Track, Clip, ExportPreset
- `types/job.ts` — Job
- `types/api.ts` — リクエスト/レスポンス型
- `utils/id.ts` — crypto.randomUUID()
- `utils/constants.ts` — DEFAULT_IMAGE_DURATION_MS=3000, PROXY_WIDTH=1280 等

### Step 3: Backend Hono app + Project CRUD
- `app.ts` — Hono app, cors(), onError(), ルートマウント
- `services/project-service.ts` — ディレクトリ作成, project.json 読み書き
- `routes/projects.ts` — Hono Router で POST/GET/GET:id/PUT/DELETE
- `utils/paths.ts` — パス解決 + traversal防止
- curl で動作確認

### Step 4: FFmpeg ラッパー
- `services/ffmpeg.ts` — 5関数
- テスト作成

### Step 5: Job キュー
- `services/job-queue.ts`
- テスト作成（ライフサイクル、retry）

### Step 6: Asset Import
- `services/asset-service.ts` — ファイル保存 + ジョブ登録
- `routes/assets.ts` — POST /api/assets/import, GET /api/assets/:id
- `routes/jobs.ts` — GET /api/jobs/:id, POST /api/jobs/:id/retry
- `routes/media.ts` — 静的ファイル配信
- curl で実ファイルアップロードのE2Eテスト

### Step 7: Frontend ホーム画面
- React Router, TanStack Query セットアップ
- API client + project hooks
- HomePage + ProjectCard + CreateProjectDialog

### Step 8: Frontend エディタ + アセットパネル
- EditorPage レイアウト
- AssetPanel (ファイル選択 + アップロード)
- AssetThumbnail (Job状態オーバーレイ)
- ブラウザでフルフロー確認: アップロード → 進捗 → サムネイル表示

---

## 6. 検証方法

### Backend テスト

`bun test` で実行。テストファイルは各モジュールと同階層に `*.test.ts` で配置。

```
app/backend/
  src/
    services/
      project-service.ts
      project-service.test.ts
      asset-service.ts
      asset-service.test.ts
      ffmpeg.ts
      ffmpeg.test.ts
      job-queue.ts
      job-queue.test.ts
    routes/
      projects.test.ts          # Hono app に対する HTTP レベルテスト
      assets.test.ts
      jobs.test.ts
    utils/
      paths.ts
      paths.test.ts
  test/
    fixtures/
      sample.mp4                # 数秒のテスト動画
      sample.jpg
      sample.heic
```

#### テスト分類

**Unit テスト（FFmpeg不要、高速）**:

| テスト対象 | 内容 | モック |
|-----------|------|--------|
| `paths.test.ts` | path traversal 防止、workspace 内パス解決 | なし |
| `job-queue.test.ts` | ジョブライフサイクル (pending→processing→completed/failed)、retry、逐次実行 | task 関数をモック |
| `project-service.test.ts` | project.json の CRUD、ディレクトリ作成、一覧取得 | 一時ディレクトリ使用 |
| `asset-service.test.ts` | ファイル保存、asset 種別判定、ジョブ登録 | FFmpeg をモック、一時ディレクトリ使用 |

**Integration テスト（FFmpeg必要）**:

| テスト対象 | 内容 | 前提 |
|-----------|------|------|
| `ffmpeg.test.ts` | checkInstalled、probeMetadata、generateThumbnail、generateProxy、convertHeicToJpeg | FFmpegインストール済み、test/fixtures/ の素材使用 |

**API テスト（Hono の `app.request()` を使用）**:

Hono はテスト用に `app.request()` メソッドを提供しており、実際にHTTPサーバーを起動せずにハンドラをテストできる。

| テスト対象 | 内容 | モック |
|-----------|------|--------|
| `routes/projects.test.ts` | Project CRUD の HTTP レスポンス（ステータスコード、JSON構造） | project-service をモックまたは一時ディレクトリ |
| `routes/assets.test.ts` | Import リクエスト → asset + jobId レスポンス | FFmpeg をモック |
| `routes/jobs.test.ts` | Job ステータス取得、retry | job-queue をモック |

#### テスト方針

- **FFmpegモック**: unit テストでは `Bun.spawn` をモックし、FFmpegの呼び出し引数が正しいことを検証。実際の変換結果は integration テストで検証
- **一時ディレクトリ**: ファイルI/Oを伴うテストは `tmpdir` を使い、テスト後にクリーンアップ
- **テストの独立性**: 各テストは自前の workspace を一時ディレクトリに作成し、他のテストに影響しない

```bash
bun test                         # 全 backend テスト
bun test --grep "unit"           # unit テストのみ（FFmpeg不要）
bun test --grep "integration"    # integration テストのみ（FFmpeg必要）
```

### Frontend テスト
```bash
bun run test:unit       # Vitest ユニットテスト
bun run storybook       # Storybook 起動（開発時）
bun run test:storybook  # Story play 関数を Playwright 実行（MSWモック、FFmpeg不要）
```

### E2E テスト
```bash
bun run test:e2e        # Playwright フルフロー（実サーバー自動起動、FFmpeg必要）
```
テストシナリオ:
1. プロジェクト作成 → 一覧に表示される
2. 素材インポート（JPG, PNG, MP4, MOV, HEIC）→ Job 進捗が表示される → サムネイルが表示される
3. Job 失敗 → エラー表示 → リトライ

### 全テスト一括
```bash
bun run test            # backend テスト + unit + storybook + e2e
```

### 前提条件
- FFmpeg / ffprobe がインストール済み
- Bun がインストール済み
