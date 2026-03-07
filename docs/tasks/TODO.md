# Task TODO List

## Overview

| # | Task | Status | Dependencies |
|---|------|--------|-------------|
| 01 | プロジェクトスキャフォールド | [x] Done | - |
| 02 | 共有型定義 (shared) | [ ] Not Started | 01 |
| 03 | Backend Hono サーバー + Project CRUD | [ ] Not Started | 01, 02 |
| 04 | Job キュー | [ ] Not Started | 02 |
| 05 | Asset Import API | [ ] Not Started | 02, 03, 04 |
| 06 | Backend テスト | [ ] Not Started | 03, 04, 05 |
| 07 | Frontend ホーム画面 | [ ] Not Started | 01, 02, 03 |
| 08 | Frontend エディタ画面 + アセットパネル | [ ] Not Started | 05, 07 |

## Tasks

### 01: プロジェクトスキャフォールド

- [x] ルート package.json (workspaces, dev/test スクリプト)
- [x] ルート tsconfig.json (project references)
- [x] .gitignore
- [x] app/shared/ パッケージ構成
- [x] app/backend/ パッケージ構成 + 最小 Hono サーバー
- [x] app/frontend/ パッケージ構成 + Vite + React セットアップ
- [x] `bun install` 成功
- [x] `bun run dev` で backend/frontend 同時起動

### 02: 共有型定義 (shared)

- [ ] types/project.ts (Project, Sequence, Track, Clip, ExportPreset)
- [ ] types/job.ts (Job, JobStatus)
- [ ] types/api.ts (API リクエスト/レスポンス型)
- [ ] utils/id.ts (generateId)
- [ ] utils/constants.ts (定数定義)
- [ ] index.ts re-export 更新
- [ ] backend/frontend から import 可能

### 03: Backend Hono サーバー + Project CRUD

- [ ] utils/paths.ts (workspace パス解決, path traversal 防止)
- [ ] services/project-service.ts (CRUD 操作)
- [ ] routes/projects.ts (Hono Router)
- [ ] app.ts (ミドルウェア, ルートマウント)
- [ ] index.ts (FFmpeg チェック, workspace 初期化)
- [ ] 全 CRUD エンドポイント動作確認

### 04: Job キュー

- [ ] services/job-queue.ts (インメモリキュー, 逐次実行)
- [ ] enqueue / getJob / retry 実装
- [ ] services/job-queue.test.ts
- [ ] テスト全パス

### 05: Asset Import API

- [ ] routes/assets.ts (POST /api/assets/import)
- [ ] routes/jobs.ts (GET /api/jobs/:id, POST /api/jobs/:id/retry)
- [ ] routes/media.ts (静的ファイル配信)
- [ ] services/asset-service.ts 更新 (importAsset 統合)
- [ ] app.ts ルートマウント追加
- [ ] ファイルアップロード → パイプライン実行のフルフロー動作確認

### 06: Backend テスト

- [ ] utils/paths.test.ts
- [ ] services/project-service.test.ts
- [ ] services/asset-service.test.ts
- [ ] routes/projects.test.ts
- [ ] routes/assets.test.ts
- [ ] routes/jobs.test.ts
- [ ] pipeline/tools/ffmpeg.test.ts (integration)
- [ ] pipeline/runner.test.ts
- [ ] テスト用素材 (test/fixtures/)
- [ ] `bun test` 全パス

### 07: Frontend ホーム画面

- [ ] main.tsx (React root, QueryClient, BrowserRouter)
- [ ] App.tsx (React Router ルート定義)
- [ ] api/client.ts (fetch ラッパー)
- [ ] api/projects.ts (useProjects, useProject, useCreateProject)
- [ ] pages/HomePage.tsx (プロジェクト一覧)
- [ ] components/ProjectCard.tsx
- [ ] components/CreateProjectDialog.tsx
- [ ] react-router-dom, @tanstack/react-query 追加
- [ ] ホーム画面表示 + プロジェクト作成動作確認

### 08: Frontend エディタ画面 + アセットパネル

- [ ] pages/EditorPage.tsx (3カラムレイアウト)
- [ ] components/EditorLayout.tsx (CSS Grid)
- [ ] components/AssetPanel.tsx (アセット一覧 + インポート)
- [ ] components/AssetThumbnail.tsx (サムネイル + Job 状態)
- [ ] components/JobProgress.tsx (プログレスバー)
- [ ] api/assets.ts (useImportAsset)
- [ ] api/jobs.ts (useJob + ポーリング)
- [ ] App.tsx ルート追加
- [ ] フルフロー確認: プロジェクト作成 → インポート → サムネイル表示
