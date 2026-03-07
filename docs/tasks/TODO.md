# Task TODO List

## Overview

| # | Task | Status | Dependencies |
|---|------|--------|-------------|
| 01 | プロジェクトスキャフォールド | [x] Done | - |
| 02 | 共有型定義 (shared) | [x] Done | 01 |
| 03 | Backend Hono サーバー + Project CRUD | [x] Done | 01, 02 |
| 04 | Job キュー | [x] Done | 02 |
| 05 | Asset Import API | [x] Done | 02, 03, 04 |
| 06 | Backend テスト | [x] Done | 03, 04, 05 |
| 07 | Frontend ホーム画面 | [x] Done | 01, 02, 03 |
| 08 | Frontend エディタ画面 + アセットパネル | [x] Done | 05, 07 |
| 09 | タイムライン UI | [x] Done | 08 |
| 10 | タイムラインへのクリップ追加 | [ ] Todo | 09 |
| 11 | クリップ操作 (並べ替え・トリム) | [ ] Todo | 10 |
| 12 | プレビュープレーヤー | [ ] Todo | 10 |
| 13 | 自動保存 + Undo/Redo | [ ] Todo | 10 |
| 14 | Phase 2 テスト | [ ] Todo | 09, 10, 11, 12, 13 |

## Phase 1 Tasks

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

- [x] types/project.ts (Project, Sequence, Track, Clip, ExportPreset)
- [x] types/job.ts (Job, JobStatus)
- [x] types/api.ts (API リクエスト/レスポンス型)
- [x] utils/id.ts (generateId)
- [x] utils/constants.ts (定数定義)
- [x] index.ts re-export 更新
- [x] backend/frontend から import 可能

### 03: Backend Hono サーバー + Project CRUD

- [x] utils/paths.ts (workspace パス解決, path traversal 防止)
- [x] services/project-service.ts (CRUD 操作)
- [x] routes/projects.ts (Hono Router)
- [x] app.ts (ミドルウェア, ルートマウント)
- [x] index.ts (FFmpeg チェック, workspace 初期化)
- [x] 全 CRUD エンドポイント動作確認

### 04: Job キュー

- [x] services/job-queue.ts (インメモリキュー, 逐次実行)
- [x] enqueue / getJob / retry 実装
- [x] services/job-queue.test.ts
- [x] テスト全パス

### 05: Asset Import API

- [x] routes/assets.ts (POST /api/assets/import)
- [x] routes/jobs.ts (GET /api/jobs/:id, POST /api/jobs/:id/retry)
- [x] routes/media.ts (静的ファイル配信)
- [x] services/asset-service.ts 更新 (importAsset 統合)
- [x] app.ts ルートマウント追加
- [x] ファイルアップロード → パイプライン実行のフルフロー動作確認

### 06: Backend テスト

- [x] utils/paths.test.ts
- [x] services/project-service.test.ts
- [x] services/asset-service.test.ts
- [x] routes/projects.test.ts
- [x] routes/assets.test.ts
- [x] routes/jobs.test.ts
- [x] pipeline/tools/ffmpeg.test.ts (integration)
- [x] pipeline/runner.test.ts
- [x] テスト用素材 (test/fixtures/)
- [x] `bun test` 全パス

### 07: Frontend ホーム画面

- [x] main.tsx (React root, QueryClient, BrowserRouter)
- [x] App.tsx (React Router ルート定義)
- [x] api/client.ts (fetch ラッパー)
- [x] api/projects.ts (useProjects, useProject, useCreateProject)
- [x] pages/HomePage.tsx (プロジェクト一覧)
- [x] components/ProjectCard.tsx
- [x] components/CreateProjectDialog.tsx
- [x] react-router-dom, @tanstack/react-query 追加
- [x] ホーム画面表示 + プロジェクト作成動作確認

### 08: Frontend エディタ画面 + アセットパネル

- [x] pages/EditorPage.tsx (3カラムレイアウト)
- [x] components/EditorLayout.tsx (CSS Grid)
- [x] components/AssetPanel.tsx (アセット一覧 + インポート)
- [x] components/AssetThumbnail.tsx (サムネイル + Job 状態)
- [x] components/JobProgress.tsx (プログレスバー)
- [x] api/assets.ts (useImportAsset)
- [x] api/jobs.ts (useJob + ポーリング)
- [x] App.tsx ルート追加
- [x] フルフロー確認: プロジェクト作成 → インポート → サムネイル表示

## Phase 2 Tasks

### 09: タイムライン UI

- [x] components/Timeline.tsx (タイムラインコンテナ、トラック表示)
- [x] components/TimelineTrack.tsx (1トラック分の描画)
- [x] components/TimelineClip.tsx (クリップ矩形、サムネイル表示)
- [x] components/TimelineRuler.tsx (時間目盛り表示)
- [x] components/Playhead.tsx (再生ヘッド縦線)
- [x] hooks/useTimelineZoom.ts (ズームレベル管理、ms→px変換)
- [x] EditorPage にタイムライン組み込み (bottom スロット)
- [x] 空のタイムライン表示確認

### 10: タイムラインへのクリップ追加

- [ ] AssetPanel からタイムラインへのクリップ追加ボタン
- [ ] api/projects.ts に useUpdateProject 追加
- [ ] hooks/useProjectEditor.ts (project state 管理、クリップ追加/削除)
- [ ] 動画クリップ追加 (durationMs = sourceOutMs - sourceInMs)
- [ ] 静止画クリップ追加 (durationMs = DEFAULT_IMAGE_DURATION_MS)
- [ ] クリップ追加後のタイムライン表示確認

### 11: クリップ操作 (並べ替え・トリム)

- [ ] クリップのドラッグ並べ替え (同一トラック内)
- [ ] クリップのトリム (左右端のドラッグ)
- [ ] クリップの選択状態 UI
- [ ] クリップの削除 (Delete キー)
- [ ] インスペクターパネル (選択クリップの情報表示)

### 12: プレビュープレーヤー

- [ ] components/PreviewPlayer.tsx (proxy 動画の再生)
- [ ] 再生 / 一時停止ボタン
- [ ] シークバー (タイムライン playhead と連動)
- [ ] 現在の再生時間に基づくクリップ切り替え
- [ ] 静止画クリップのプレビュー表示
- [ ] EditorPage の center スロットに組み込み

### 13: 自動保存 + Undo/Redo

- [ ] hooks/useAutoSave.ts (debounce 付き PUT /api/projects/:id)
- [ ] hooks/useUndoRedo.ts (JSON スナップショットスタック)
- [ ] Ctrl+Z / Ctrl+Shift+Z キーバインド
- [ ] 保存状態インジケーター (保存中 / 保存済み)

### 14: Phase 2 テスト

- [ ] useProjectEditor フックのユニットテスト
- [ ] useUndoRedo フックのユニットテスト
- [ ] useAutoSave フックのユニットテスト
- [ ] タイムライン ms→px 変換のユニットテスト
- [ ] `bun test` 全パス
