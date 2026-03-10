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
| 10 | タイムラインへのクリップ追加 | [x] Done | 09 |
| 11 | クリップ操作 (並べ替え・トリム) | [x] Done | 10 |
| 12 | プレビュープレーヤー | [x] Done | 10 |
| 13 | 自動保存 + Undo/Redo | [x] Done | 10 |
| 14 | Phase 2 テスト | [x] Done | 09, 10, 11, 12, 13 |
| 15 | Export API (Backend) | [x] Done | 05 |
| 16 | テロップ UI + タイムライン配置 | [x] Done | 11 |
| 17 | BGM 追加 UI | [x] Done | 11 |
| 18 | Export ダイアログ + ジョブログ | [x] Done | 15 |
| 19 | 回転補正 + クロップ UI | [x] Done | 11 |
| 20 | Phase 3 テスト | [x] Done | 15, 16, 17, 18, 19 |
| 21 | ホーム画面デザイン改善 | [x] Done | - |
| 22 | エディタ画面の余白除去とフルスクリーン化 | [x] Done | 21 |
| 23 | エディタ画面レイアウト再構成 | [x] Done | 22 |
| 24 | プレビュー再生のクリップ遷移修正 | [x] Done | 12 |
| 25 | プレビューのテキストオーバーレイ表示 | [x] Done | 16, 24 |
| 26 | プレイヘッドのドラッグシーク | [x] Done | 09 |
| 27 | 再生終了後の再再生で先頭から開始 | [x] Done | 24 |
| 28 | アセットインポートの信頼性改善 | [x] Done | 05 |
| 29 | アセット削除機能 | [x] Done | 05, 08 |
| 30 | タイムラインクリップの右クリックメニュー | [x] Done | 11 |
| 31 | シークバー専用行の追加 | [x] Done | 09, 26 |
| 32 | インスペクタでのトリムポイント編集 | [x] Done | 11, 19 |
| 33 | トリムハンドルの UX 改善 | [x] Done | 11 |
| 34 | トリム範囲のバリデーション強化 | [x] Done | 11 |
| 35 | 同一アセットの連続クリップ再生バグ修正 | [x] Done | 12, 24 |
| 36 | 異なるアセットの連続クリップ再生バグ修正 | [x] Done | 12, 24, 35 |
| 37 | エクスポート動画のブラウザ再生不可バグ修正 | [x] Done | 15 |
| 38 | Export モーダル簡素化: エクスポート→自動ダウンロード | [x] Done | 18, 37 |
| 39 | エディタ画面レイアウト大改修: プレビュー左固定 + 右ペインタブ化 | [x] Done | 23, 08 |
| 40 | 右ペインのタブ UI コンポーネント実装 | [x] Done | 39 |
| 41 | Inspector タブの優先表示とクリップ選択連動 | [x] Done | 40 |
| 42 | タイムラインの全幅レイアウト維持 | [x] Done | 39 |
| 43 | クリップ選択時のシーク移動とプレビュー表示 | [x] Done | 12, 24 |
| 44 | 選択クリップ範囲のみ再生 | [x] Done | 43 |
| 45 | 共有型に ProjectSettings を追加 | [x] Done | 02 |
| 46 | Settings タブの追加 | [x] Done | 40, 45 |
| 47 | タイムライン UI への動画時間制限の反映 | [x] Done | 45, 09, 10, 11 |
| 48 | テストの追加 | [x] Done | 45, 47 |
| 49 | 先頭から全体再生ボタンの追加 | [x] Done | 12, 44 |
| 50 | 同一トラック内のクリップ重なり防止 | [x] Done | 11, 47 |
| 51 | アセットインポート完了前のクリップ追加防止とサムネイル表示改善 | [x] Done | 05, 08 |
| 52 | Crop 初期値をアセットサイズに合わせる | [x] Done | 19 |
| 53 | クリップの位置・拡大縮小 UI とプレビュー対応 | [x] Done | 19, 52 |
| 54 | クリップ開始位置の数値入力 | [x] Done | 11, 50 |
| 55 | Undo/Redo UI を Inspector から分離してグローバル配置 | [x] Done | 13, 39 |
| 56 | TypeScript 暗黙 any 型エラーの修正 | [x] Done | 02 |
| 57 | エクスポートが project settings の動画時間を超過するバグ修正 | [x] Done | 15, 45 |
| 58 | 設定変更時の既存クリップ遡及トリム | [x] Done | 45, 47 |
| 59 | エクスポート時のクリップフリーズ・尺ずれバグ修正 | [x] Done | 15, 57 |
| 60 | Everforest Light テーマ定数ファイルの作成 | [x] Done | - |
| 61 | グローバル CSS・ページコンポーネントの色彩更新 | [x] Done | 60 |
| 62 | エディタ UI コンポーネントの色彩更新 | [x] Done | 60 |
| 63 | タイムライン・クリップコンポーネントの色彩更新 | [x] Done | 60 |
| 64 | プレビュー "No clip at playhead" 表示の全幅化 | [x] Done | 12 |
| 65 | エディタ画面からホームへの導線追加 | [x] Done | 07, 39 |
| 66 | ⏮ ボタンの動作変更: 先頭シークのみ（再生開始しない） | [x] Done | 12, 49 |
| 67 | Export タブ再設計: インライン操作化 + View Jobs 移動 | [x] Done | 18, 38, 40 |
| 68 | textDisabled ラベルの視認性改善（全 UI） | [x] Done | 60 |
| 69 | テーマシステム拡張: スペーシング・フォントサイズ・角丸の定数化 | [x] Done | 60 |
| 70 | ハードコード色のテーマ変数置換 | [x] Done | 69 |
| 71 | ボタンスタイルの統一 | [x] Done | 69 |
| 72 | 入力フィールド・見出し・ラベルスタイルの統一 | [x] Done | 69 |
| 73 | Storybook 導入 + 全コンポーネントの Story 定義 | [x] Done | - |
| 74 | Vitest ブラウザテスト導入 + 全 Story のテスト整備 | [x] Done | 73 |
| 75 | テーマフォントサイズの一段階拡大 | [x] Done | 69 |
| 76 | InspectorPanel セクションラベルの視認性改善 | [x] Done | 60 |
| 77 | 共有型に canvasWidth / canvasHeight を追加 | [x] Done | 02, 45 |
| 78 | Settings タブにキャンバスサイズ設定 UI を追加 | [x] Done | 46, 77 |
| 79 | プレビュープレーヤーのキャンバスサイズ対応 | [x] Done | 12, 77 |
| 80 | エクスポートのキャンバスサイズ対応 | [x] Done | 15, 77 |
| 81 | キャンバスサイズ機能のテスト・Story 更新 | [x] Done | 77, 78, 79, 80 |
| 82 | エクスポートへの clip.crop 反映 | [x] Done | 15, 19, 80 |
| 83 | エクスポート crop のテスト追加 | [x] Done | 82 |
| 84 | buildTransformFilter の scale > 1 pad エラー修正 | [x] Done | 15, 80, 82 |
| 85 | iPhone MOV 未対応コーデックストリームへの対策 | [x] Done | 15 |
| 86 | タスク 84・85 のテスト追加 | [x] Done | 84, 85 |
| 87 | プレビューの Crop 表示位置をエクスポートと一致させる | [x] Done | 12, 19, 82 |
| 88 | プレビューのテキストオーバーレイ位置をエクスポートと一致させる | [x] Done | 12, 25 |
| 89 | プレビュー・エクスポート一致性のテスト追加 | [x] Done | 87, 88 |
| 90 | プレビューのウィンドウ内フルスクリーン表示 | [x] Done | 12, 39 |
| 91 | プレビューの別ウィンドウ表示 | [x] Done | 90 |
| 92 | プレビュー拡大表示のテスト・Story 追加 | [x] Done | 90, 91 |
| 93 | TrackKind / AssetKind レジストリの導入 | [x] Done | 02 |
| 94 | Inspector パネルのエディタプラグインレジストリ化 | [x] Done | 93 |
| 95 | タイムラインクリップの外観レジストリ化 | [x] Done | 93 |
| 96 | プレビュープレーヤーの描画 Strategy 化 | [x] Done | 93 |
| 97 | sequence-ops のトラックルーティング Strategy 化 | [x] Done | 93 |
| 98 | アセット種別検出のプラグイン化 | [x] Done | 93 |
| 99 | エクスポートのトラック/アセットハンドラ Strategy 化 | [x] Done | 93 |
| 100 | プラグインシステムの基盤設計 | [x] Done | 93, 94, 95, 96, 97, 98, 99 |
| 101 | リファクタリング全体のテスト・Story 更新 | [x] Done | 94, 95, 96, 97, 98, 99 |
| 102 | エクスポートへの clip.transform.rotation 反映 | [x] Done | 15, 19, 99 |
| 103 | Rotation UI の改善: 自由入力 + 回転ボタン | [x] Done | 19, 102 |
| 104 | Rotation 改善のテスト・Story 更新 | [x] Done | 102, 103 |
| 105 | シークバーの画面下端延長 + トラック下部空白クリックシーク | [x] Done | 09, 26 |
| 106 | タスク 105 のテスト・Story 更新 | [x] Done | 105 |
| 107 | 共有型の拡張 — Clip.clipKind・Clip.blendMode 追加 + Track.kind 廃止 | [x] Done | 02, 93 |
| 108 | CompositeStrategy インターフェース設計 + CoverStrategy 実装 | [x] Done | 107 |
| 109 | ClipKind レジストリの導入と TrackKind レジストリの廃止 | [x] Done | 107, 93 |
| 110 | タイムライン UI の混在クリップ対応 | [x] Done | 109 |
| 111 | sequence-ops の混在トラック対応 | [x] Done | 109 |
| 112 | Inspector の clipKind ベース判定 + BlendModeEditor 追加 | [x] Done | 108, 109 |
| 113 | プレビューレンダラーのトラック間レイヤー合成対応 | [ ] TODO | 108, 109 |
| 114 | エクスポートのトラック間レイヤー合成対応 | [ ] TODO | 108, 109 |
| 115 | レイヤーモデル移行のテスト・Story 追加 | [ ] TODO | 110, 111, 112, 113, 114 |

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

- [x] AssetPanel からタイムラインへのクリップ追加ボタン
- [x] api/projects.ts に useUpdateProject 追加
- [x] hooks/useProjectEditor.ts (project state 管理、クリップ追加/削除)
- [x] 動画クリップ追加 (durationMs = sourceOutMs - sourceInMs)
- [x] 静止画クリップ追加 (durationMs = DEFAULT_IMAGE_DURATION_MS)
- [x] クリップ追加後のタイムライン表示確認

### 11: クリップ操作 (並べ替え・トリム)

- [x] クリップのドラッグ並べ替え (同一トラック内)
- [x] クリップのトリム (左右端のドラッグ)
- [x] クリップの選択状態 UI
- [x] クリップの削除 (Delete キー)
- [x] インスペクターパネル (選択クリップの情報表示)

### 12: プレビュープレーヤー

- [x] components/PreviewPlayer.tsx (proxy 動画の再生)
- [x] 再生 / 一時停止ボタン
- [x] シークバー (タイムライン playhead と連動)
- [x] 現在の再生時間に基づくクリップ切り替え
- [x] 静止画クリップのプレビュー表示
- [x] EditorPage の center スロットに組み込み

### 13: 自動保存 + Undo/Redo

- [x] hooks/useAutoSave.ts (debounce 付き PUT /api/projects/:id)
- [x] hooks/useUndoRedo.ts (JSON スナップショットスタック)
- [x] Ctrl+Z / Ctrl+Shift+Z キーバインド
- [x] 保存状態インジケーター (保存中 / 保存済み)

### 14: Phase 2 テスト

- [x] sequence-ops (addClip, removeClip, moveClip, trimClip) ユニットテスト (16 tests)
- [x] undo-redo (push, undo, redo, history limit) ユニットテスト (9 tests)
- [x] timeline-utils (msToPx, pxToMs, clampZoomIndex) ユニットテスト (6 tests)
- [x] 純粋ロジックを lib/ に抽出、hooks はラッパーに簡素化
- [x] `bun test` 新規31テスト全パス

## Phase 3 Tasks

### 15: Export API (Backend)

- [x] services/export-service.ts (project.json → FFmpeg filtergraph 組み立て)
- [x] クリップの trim / scale / rotate 処理
- [x] concat filter でクリップ結合
- [x] テロップ drawtext filter 生成
- [x] BGM amix 合成
- [x] routes/exports.ts (POST /api/projects/:id/export, GET /api/projects/:id/exports)
- [x] Export job 進捗 (FFmpeg stderr パース)
- [x] app.ts ルートマウント追加

### 16: テロップ UI + タイムライン配置

- [x] shared types 更新 (Clip.text, ClipText, ClipTransform, ClipCrop)
- [x] InspectorPanel にテキスト編集 UI (textarea, fontSize, color, bgColor)
- [x] タイムライン上のテキストトラック表示 (紫色クリップ)
- [x] テロップクリップの追加・削除 (+ Add Text ボタン)
- [x] InspectorPanel にテロップ編集 UI 追加
- [x] sequence-ops に addTextClip, updateClip 追加

### 17: BGM 追加 UI

- [x] BGM ファイルインポート (audio asset, 既存の import フローで対応)
- [x] タイムライン上の audio トラック表示 (緑色クリップ)
- [x] 音量スライダー (InspectorPanel, 0-100%)
- [x] BGM クリップの開始位置・長さ調整 (ドラッグ移動・トリム)

### 18: Export ダイアログ + ジョブログ

- [x] components/ExportDialog.tsx (ファイル名入力、エクスポート開始、進捗表示)
- [x] api/exports.ts (useExport, useExports hooks)
- [x] Export 進捗表示 (JobProgress 再利用)
- [x] pages/JobLogPage.tsx (全ジョブ一覧、ステータス、エラー詳細)
- [x] App.tsx ルート追加 (/projects/:id/jobs)
- [x] Export 済みファイルダウンロードリンク

### 19: 回転補正 + クロップ UI

- [x] InspectorPanel に回転コントロール (0/90/180/270)
- [x] shared types 更新 (Clip.transform.rotation) — 既存
- [x] InspectorPanel にクロップ入力 (x, y, width, height)
- [x] shared types 更新 (Clip.crop) — 既存
- [x] PreviewPlayer での回転・クロップ反映

### 20: Phase 3 テスト

- [x] export-service filtergraph 生成のユニットテスト (8 tests)
- [x] routes/exports.test.ts (4 tests)
- [x] テロップ sequence-ops のユニットテスト (4 tests)
- [x] 回転・クロップ操作のユニットテスト (7 tests)
- [x] `bun test` 全パス (97 pass, 5 ffmpeg integration skip)

## Phase 4 Tasks — UI/レイアウト改善

### 21: ホーム画面デザイン改善

現状: スタイル未適用の素の HTML。エディタ画面はダーク系だがホーム画面は白背景でデザインが統一されていない。

- [x] body/html にグローバル CSS リセット追加 (margin:0, padding:0, box-sizing, ダーク背景, フォント設定)
- [x] HomePage をダークテーマに統一 (背景 #111, テキスト #eee)
- [x] ヘッダーバー実装 (アプリ名 + "New Project" ボタン、背景 #1a1a1a、下線)
- [x] ProjectCard をカード UI に (背景 #1e1e1e, border-radius, hover エフェクト, padding)
- [x] プロジェクト一覧をグリッドレイアウトで表示 (repeat(auto-fill, minmax(280px, 1fr)))
- [x] 空状態 (No projects yet) の見た目改善
- [x] Loading / Error 状態のスタイル統一

### 22: エディタ画面の余白除去とフルスクリーン化

現状: body のデフォルト margin (8px) により外周に白い枠が表示されている。

- [x] グローバル CSS で body { margin: 0; padding: 0; overflow: hidden } を設定
- [x] html, body, #root に height: 100%; width: 100% を設定
- [x] EditorLayout の height: 100vh がビューポート全体を覆うことを確認

### 23: エディタ画面レイアウト再構成

現状: タイムラインが center 列のみに配置 (左パネル・右パネルの間)。プレビューとインスペクタの配置が見づらい。

目標レイアウト:
```
┌──────────┬─────────────────────┬──────────┐
│  Assets  │   Preview Player    │Inspector │
│  Panel   │                     │  Panel   │
│          │                     │          │
├──────────┴─────────────────────┴──────────┤
│              Timeline (左右いっぱい)        │
└───────────────────────────────────────────┘
```

- [x] EditorLayout の CSS Grid を再設計:
  - gridTemplateColumns: "240px 1fr 240px"
  - gridTemplateRows: "1fr 220px"
  - left (Assets): row 1, col 1
  - center (Preview): row 1, col 2
  - right (Inspector): row 1, col 3
  - bottom (Timeline): row 2, col 1〜3 (全幅)
- [x] left パネルを row 1 のみに変更 (現状 row 1-2 にまたがっている)
- [x] right パネルを row 1 のみに変更 (現状 row 1-2 にまたがっている)
- [x] bottom (Timeline) の gridColumn を "1 / -1" に変更して全幅表示
- [x] 各パネルの overflow 設定を調整 (左右: overflow-y auto, タイムライン: overflow-x auto)
- [x] ブラウザで表示確認: タイムラインが画面下部に左右いっぱい表示されること

## Phase 5 Tasks — プレビュー再生バグ修正

### 24: プレビュー再生のクリップ遷移修正

現状: 再生中にクリップの末尾に到達すると再生が停止し、次のクリップに遷移しない。

原因:
- `tick()` 内の `activeClip` がクロージャにキャプチャされており、クリップ境界を超えても更新されない
- 動画クリップ: video 要素の再生が終了すると `video.paused === true` になり、`onTimeUpdate` が呼ばれなくなる
- 静止画クリップ: `activeClip.asset.kind === "image"` の分岐で時間を進めているが、クリップの `startMs + durationMs` を超えた時点で次のレンダーで `activeClip` が `null` になり停止する

修正方針:
- [ ] `tick()` 内で現在時刻がクリップの終了時刻 (`clip.startMs + clip.durationMs`) を超えたかチェックする
- [ ] クリップ終了を検出したら、次のクリップの開始時刻に `onTimeUpdate` を進める
- [ ] 動画クリップの `ended` イベントを監視し、次クリップへの遷移をトリガーする
- [ ] `activeClip` を ref に保持してクロージャの陳腐化を防ぐ
- [ ] シーケンス全体の終端 (最後のクリップの末尾) に到達したら再生を停止する
- [ ] 複数クリップの連続再生が途切れないことを確認

### 25: プレビューのテキストオーバーレイ表示

現状: `findActiveClip()` が `track.kind !== "video"` で title トラックをスキップしているため、テロップ (テキストクリップ) がプレビューに一切表示されない。

修正方針:
- [ ] 現在時刻にアクティブなテキストクリップを検索する関数 `findActiveTextClips()` を追加
  - title トラックの全クリップを走査し、`timeMs >= clip.startMs && timeMs < clip.startMs + clip.durationMs` に該当するものを返す
- [ ] プレビュー領域に DOM オーバーレイレイヤーを追加 (position: absolute で映像の上に重ねる)
- [ ] テキストクリップの `clip.text` プロパティを使用してオーバーレイを描画:
  - `text.value`: テキスト内容
  - `text.fontSize`: フォントサイズ (デフォルト 48px)
  - `text.color`: テキスト色 (デフォルト #ffffff)
  - `text.backgroundColor`: 背景色 (デフォルト transparent)
  - `text.align`: テキスト配置 (デフォルト center)
- [ ] 複数のテキストクリップが同時にアクティブな場合、すべて重ねて表示する
- [ ] 再生中・スクラブ中の両方でテキストが正しく表示/非表示されることを確認

## Phase 6 Tasks — 操作性改善

### 26: プレイヘッドのドラッグシーク

現状: タイムラインルーラーのクリックでシークは可能だが、プレイヘッド (赤い縦線) は `pointerEvents: "none"` で操作できない。ルーラー上をドラッグしてのスクラブ操作もできない。

目標: プレイヘッドをドラッグ、またはルーラー上でマウスドラッグすることで、再生位置をスクラブできるようにする。ドラッグ中はプレビューがリアルタイムで更新される。

修正方針:
- [ ] Timeline.tsx のルーラー領域に `onMouseDown` ハンドラを追加
  - mousedown でシーク開始、mousemove で位置を更新、mouseup で終了
  - ドラッグ中は `onSeek(ms)` を継続的に呼び出してプレビューを更新
- [ ] ドラッグ中は `document` に mousemove/mouseup を登録 (ルーラー外にマウスが出ても追従)
- [ ] ドラッグ中のカーソルを `col-resize` に変更
- [ ] Playhead.tsx の `pointerEvents: "none"` は維持 (プレイヘッド自体ではなくルーラー側でドラッグを処理)
- [ ] ドラッグ中にプレビューが追従して更新されることを確認

### 27: 再生終了後の再再生で先頭から開始

現状: 再生がシーケンス末尾に到達すると `isPlaying` が `false` になるが、`currentTimeMs` は末尾のまま残る。再度 Play を押すと `curTime >= seqEnd` で即座に再停止し、何も起きない。

目標: 再生が終了した後に Play を押したら、先頭 (0ms) から再生を開始する。

修正方針:
- [ ] PreviewPlayer.tsx の再生開始ロジックを修正:
  - Play が押された時点で `currentTimeMs >= seqEnd` であれば、`onTimeUpdate(0)` を呼んで先頭にリセットしてから再生を開始
- [ ] `getSequenceEndMs()` は既存の関数を再利用
- [ ] 末尾以外の位置で一時停止→再開した場合は、従来通りその位置から再生を継続

## Phase 7 Tasks — インポート信頼性改善

### 28: アセットインポートの信頼性改善

現状: "+ Import" ボタンでファイルを選択してアップロードすると、ファイル自体は正常にサーバーに保存されるが、バックグラウンドの処理パイプライン (ffprobe による解析) が "JSON Parse error: Expected '}'" で失敗することがある。Bun の `Bun.spawn` でパイプ経由の stdout 読み取りが不完全になるケースがあり、ffprobe の JSON 出力が途中で切れる。

原因:
- `ffmpegTool.probe()` の `spawn()` 関数が `Bun.spawn` の stdout を `new Response(proc.stdout).text()` で読み取っている
- Bun のホットリロード (`bun run --hot`) 環境下やサーバー負荷時に、パイプの読み取りが不完全になり JSON が途中で切れる
- ffprobe 自体は正常に動作しており (exit code 0)、ファイルも正しく書き込まれている
- サーバーを再起動すると問題が解消される (一時的な状態の問題)

修正方針:

**A. ffprobe 出力読み取りの堅牢化** (`app/backend/src/pipeline/tools/ffmpeg.ts`)
- [ ] `probe()` に JSON パースのリトライロジックを追加 (最大 3 回)
  - JSON.parse が失敗した場合、ffprobe を再実行して再試行
  - リトライ間に短い待機 (100ms) を入れる
- [ ] `spawn()` 関数の stdout 読み取りを手動チャンク読み取りに変更
  - `new Response(proc.stdout).text()` の代わりに ReadableStream を直接 chunk ごとに読む
  - 全チャンクを結合してから文字列化する (パイプバッファの不完全読み取りを防止)

**B. 失敗時のリトライ UI** (`app/frontend/src/components/AssetThumbnail.tsx`)
- [ ] "Failed" オーバーレイにリトライボタンを追加
  - `POST /api/jobs/:id/retry` を呼び出す
  - リトライ後は再びポーリングでジョブ状態を監視
- [ ] AssetPanel に `jobId` を失敗アセットにも紐づけて表示する (現在はセッション中のインポートのみ追跡)

**C. エラーメッセージの改善**
- [ ] JSON パース失敗時にエラーメッセージに詳細情報を含める (stdout 長、先頭 200 文字)
- [ ] AssetThumbnail の "Failed" オーバーレイにエラー詳細のツールチップを追加

### 29: アセット削除機能

現状: インポートしたアセットを削除する手段がない。バックエンドにアセット削除 API が存在せず、フロントエンドにも削除 UI がない。

修正方針:

**A. バックエンド: アセット削除 API** (`app/backend/src`)
- [ ] `services/asset-service.ts` に `deleteAsset(projectId, assetId)` を追加
  - `project.assets` から該当アセットを除去
  - アセットのファイルを削除 (`assets/`, `thumbnails/`, `proxies/` 内の関連ファイル)
  - `saveProject()` でプロジェクト JSON を更新
- [ ] `routes/assets.ts` に `DELETE /api/assets/:assetId?projectId=xxx` を追加
  - projectId, assetId を受け取りバリデーション
  - `deleteAsset()` を呼び出して 200 を返す

**B. フロントエンド: アセット削除 UI** (`app/frontend/src`)
- [ ] `api/assets.ts` に `useDeleteAsset(projectId)` mutation を追加
  - `DELETE /api/assets/:assetId?projectId=xxx` を呼び出す
  - `onSuccess` で `queryClient.invalidateQueries` でプロジェクトを再取得
- [ ] `AssetThumbnail.tsx` に削除ボタンを追加
  - サムネイル右上の "+" ボタンの隣に "×" ボタンを配置
  - クリック時に確認なしで即削除 (Undo/Redo で復元は非対応)
- [ ] `AssetPanel.tsx` に `onDeleteAsset` prop を追加し、EditorPage から `useDeleteAsset` を渡す
- [ ] タイムラインで使用中のアセットは削除ボタンをグレーアウトまたは非表示にする

### 30: タイムラインクリップの右クリックメニュー

現状: タイムライン上のクリップを削除するには、クリップを選択して Delete キーを押す必要がある。右クリックメニューがなく、直感的な操作ができない。

修正方針:

**A. コンテキストメニューコンポーネント** (`app/frontend/src/components`)
- [ ] `ContextMenu.tsx` を新規作成
  - `items: { label: string; onClick: () => void; disabled?: boolean }[]` を受け取る
  - `position: { x: number; y: number }` で表示位置を指定
  - メニュー外クリックまたは Escape キーで閉じる
  - ダークテーマ (背景 #2a2a2a, ボーダー #555, テキスト #ccc)

**B. TimelineClip に右クリックハンドラを追加** (`app/frontend/src/components/TimelineClip.tsx`)
- [ ] `onContextMenu` prop を追加 (`(clipId: string, position: {x: number, y: number}) => void`)
- [ ] クリップの `div` に `onContextMenu` イベントを追加
  - `e.preventDefault()` でブラウザデフォルトメニューを抑制
  - クリップを選択状態にする
  - 親コンポーネントに位置情報を通知

**C. Timeline にコンテキストメニュー状態管理を追加** (`app/frontend/src/components/Timeline.tsx`)
- [ ] `contextMenu` state を追加: `{ clipId: string; x: number; y: number } | null`
- [ ] TimelineTrack → TimelineClip に `onContextMenu` を伝播
- [ ] メニュー項目:
  - 「削除」: `onDeleteClip(clipId)` を呼び出す
  - 将来の拡張用に「複製」等も追加可能
- [ ] メニュー外クリックで閉じる
- [ ] `ContextMenu` コンポーネントを条件付きレンダリング

### 31: シークバー専用行の追加

現状: タイムラインのシーク操作はルーラー (時間目盛り) 上でのマウスドラッグで行う。しかしルーラーは高さ 24px と狭く、トラック (V, T) の上に位置しているため操作しにくい。

目標: ルーラーとトラックの間にシークバー専用の行 (高さ 16px 程度) を追加し、そこでもドラッグシークを行えるようにする。プレイヘッドの三角形マーカーがこの行に位置する。

修正方針:

**A. シークバー行の追加** (`app/frontend/src/components/Timeline.tsx`)
- [ ] ルーラーとトラックの間に新しい div を追加
  - 高さ: 16px
  - 背景: #252525 (トラックラベルと同系色)
  - 左端 32px: トラックラベル列と揃えるためのパディング
  - カーソル: `col-resize`
- [ ] この行にも `onMouseDown` でドラッグシークハンドラ (`handleRulerMouseDown`) を適用
  - 既存の `seekFromMouseEvent` を再利用

**B. Playhead の表示範囲調整** (`app/frontend/src/components/Timeline.tsx`)
- [ ] Playhead がシークバー行からトラック最下部まで表示されるよう、position の親要素を調整
  - 現在: Playhead はトラック div 内に `position: absolute` で配置
  - 変更: シークバー行 + トラック div を囲む共通の `position: relative` 親を作り、Playhead をそこに配置
- [ ] Playhead の三角形マーカーがシークバー行の中央に位置するよう調整

## Phase 8 Tasks — 動画トリミング機能強化

### 32: インスペクタでのトリムポイント編集

現状: インスペクタパネルの In/Out ポイントは読み取り専用テキストで表示されており、数値を直接編集できない。タイムライン上のドラッグトリムハンドル (6px) でのみトリムが可能だが、正確な秒数を指定するのが困難。

目標: インスペクタパネルで In/Out ポイントを数値入力で編集できるようにし、正確なトリミングを可能にする。

修正方針:

**A. InspectorPanel の In/Out 行を編集可能に** (`app/frontend/src/components/InspectorPanel.tsx`)
- [ ] 読み取り専用の `<Row label="In" value={formatMs(clip.inMs)} />` を数値入力フィールドに変更
  - `<input type="number">` で秒単位の入力 (小数第1位まで、step=0.1)
  - In 値変更時: `inMs` を更新し、`durationMs` を `outMs - newInMs` に再計算
- [ ] 読み取り専用の `<Row label="Out" value={formatMs(clip.outMs)} />` を数値入力フィールドに変更
  - Out 値変更時: `outMs` を更新し、`durationMs` を `newOutMs - inMs` に再計算
- [ ] Duration 行も編集可能にする
  - Duration 変更時: `durationMs` を更新し、`outMs` を `inMs + newDurationMs` に再計算
- [ ] `TrimEditor` コンポーネントを新規作成 (In/Out/Duration の3フィールドを連動管理)
  - `onUpdateClip` を使用してクリップの `inMs`, `outMs`, `durationMs` を同時に更新

**B. バリデーション**
- [ ] In >= 0 (ソースの先頭より前には設定不可)
- [ ] Out <= ソースメディアの総再生時間 (`asset.durationMs`)
- [ ] In < Out (In が Out を超えない)
- [ ] Duration >= 100ms (最小クリップ長)
- [ ] 不正な値の場合は入力を元の値に戻す

**C. 動画以外のクリップへの対応**
- [ ] 音声クリップ (audio) でも In/Out/Duration 編集を有効にする
- [ ] テキストクリップ (title) では Duration のみ編集可能 (In/Out は非表示のまま)
- [ ] 静止画クリップ (image) では Duration のみ編集可能 (ソース長の制約なし)

### 33: トリムハンドルの UX 改善

現状: タイムラインクリップの左右トリムハンドルは幅 6px で、ホバー時の視覚フィードバックがない。ハンドルの存在に気づきにくく、ドラッグ操作が困難。

目標: トリムハンドルの視認性を向上させ、ドラッグ中に現在のトリム位置をリアルタイム表示する。

修正方針:

**A. ホバー時のハイライト表示** (`app/frontend/src/components/TimelineClip.tsx`)
- [ ] トリムハンドルにホバー状態を追加
  - ホバー時: 背景色を `rgba(255,255,255,0.3)` に変更
  - ホバー時: ハンドル幅を 6px → 8px に拡大 (transition: 0.1s)
- [ ] ハンドル上に縦線グリップインジケータ (2本線) を表示
  - `border-left` / `border-right` ではなく、CSS で `⋮` 風のドットパターンを描画

**B. ドラッグ中のツールチップ表示**
- [ ] ドラッグ開始時にツールチップを表示 (クリップ上部にフローティング)
  - 左ハンドル: `In: X.Xs` (現在の inMs を秒表示)
  - 右ハンドル: `Out: X.Xs` (現在の outMs を秒表示)
- [ ] ドラッグ中にツールチップの値をリアルタイム更新
- [ ] ドラッグ終了時にツールチップを非表示

**C. クリップのマウスカーソル改善**
- [ ] クリップ本体: `cursor: grab` → ドラッグ中: `cursor: grabbing`
- [ ] トリムハンドル: `cursor: col-resize` (既存、維持)

### 34: トリム範囲のバリデーション強化

現状: `trimClip()` (sequence-ops.ts) は最小 duration (100ms) と inMs >= 0 の制約を適用しているが、ソースメディアの長さを超えたトリムを防止していない。右トリムハンドルをドラッグすると、元の動画の再生時間を超えた outMs が設定可能。

目標: トリム操作時にソースメディアの長さを上限として適用し、不正なトリム範囲を防止する。

修正方針:

**A. sequence-ops の trimClip にソース長制約を追加** (`app/frontend/src/lib/sequence-ops.ts`)
- [ ] `trimClip()` の引数にオプショナルな `maxSourceDurationMs?: number` を追加
- [ ] 右トリム時: `outMs` が `maxSourceDurationMs` を超えないようクランプ
  - `newDuration = Math.min(newDuration, maxSourceDurationMs - c.inMs)`
- [ ] 左トリム時: `inMs` が 0 未満にならないことは既存で担保 (変更不要)

**B. Timeline から asset 情報を伝播** (`app/frontend/src/components/Timeline.tsx`, `TimelineTrack.tsx`, `TimelineClip.tsx`)
- [ ] `onTrimClip` のコールバックに `maxSourceDurationMs` を含める、または
- [ ] `useProjectEditor.trimClip()` 内で該当クリップの asset を検索し `asset.durationMs` を取得して制約に使う
  - 静止画アセットの場合は制約なし (任意の長さに設定可能)
  - 音声アセットの場合は `asset.durationMs` で制約

**C. テストの追加** (`app/frontend/src/lib/sequence-ops.test.ts`)
- [ ] ソース長を超えた右トリムがクランプされることを検証
- [ ] ソース長制約なしの場合は従来通り制約なしで動作することを検証
- [ ] 静止画クリップではソース長制約が適用されないことを検証

## Phase 9 Tasks — プレビュー再生バグ修正 (2)

### 35: 同一アセットの連続クリップ再生バグ修正

現状: 同じアセット (例: sample.mp4) からトリミングした2つのクリップを連続配置して再生すると、2つ目のクリップが一瞬で終わってしまう。

原因:
- `PreviewPlayer.tsx` の "Handle video source changes" effect で、クリップが切り替わると `video.src = mediaUrl` を毎回設定している
- 同じアセットのクリップが連続する場合、`mediaUrl` は同一だが `video.src` に同じ URL を再代入するとブラウザが動画ファイルをリロードする
- リロード中 `video.currentTime` が 0 にリセットされ、`tick()` 内の計算 `startMs + (videoTimeMs - inMs)` が負の値またはクリップ範囲外になる
- 結果としてプレイヘッドが巻き戻り、クリップが即座に終了したように見える

修正方針:

**A. video.src の不要な再設定を回避** (`app/frontend/src/components/PreviewPlayer.tsx`)
- [ ] `lastMediaUrlRef` を追加して、前回設定した media URL を記録
- [ ] クリップ切り替え時に `mediaUrl` が前回と同一であれば `video.src` を再設定せず、`video.currentTime` のシークのみ行う
- [ ] `mediaUrl` が変更された場合のみ `video.src` を設定する

**B. tick() 内のタイムライン位置計算の安全ガード**
- [ ] `video.currentTime` から計算した `timelineMs` が現在のクリップ範囲 (`clip.startMs` 〜 `clipEndMs`) を逸脱しないようクランプ
  - `timelineMs = Math.max(clip.clip.startMs, Math.min(timelineMs, clipEndMs))`
- [ ] これにより、動画リロード中の `currentTime=0` による巻き戻りを防止

### 36: 異なるアセットの連続クリップ再生バグ修正

現状: 異なるアセット (例: A.mp4 をトリミングしたクリップ + B.mp4 をトリミングしたクリップ) を連続配置して再生すると、2つ目のクリップが一瞬で終わってしまう。

原因:
- クリップ切り替え時、React の re-render 後に `tick()` が Effect（`video.src` 変更）**より先に**実行される
- この時点で `video` 要素はまだクリップ1の古い動画を保持しており:
  - `video.readyState >= 2` (クリップ1のデータが残っている)
  - `video.currentTime` はクリップ1の再生終了位置（例: 8秒）
- tick() が `timelineMs = clip2.startMs + (video.currentTime*1000 - clip2.inMs)` を計算
  - クリップ1の `currentTime` (高い値) をクリップ2の計算に使うため、`timelineMs` がクリップ2の範囲を大幅超過
- 上限クランプにより `onTimeUpdate(clip2EndMs)` が呼ばれ、クリップ2が即座に終了する
- タスク35の下限クランプ (`Math.max(clip.startMs, ...)`) は `currentTime=0` のケースを防ぐが、上限方向の誤算は防げない

修正方針:

**A. video.src 変更後に loadeddata を待ってからシーク** (`app/frontend/src/components/PreviewPlayer.tsx`)
- [x] "Handle video source changes" Effect で `video.src` 変更時、`loadeddata` イベントリスナーを登録
  - `loadeddata` 発火後に `video.currentTime` を設定し、`video.play()` を呼ぶ
  - ソース変更前に `video.currentTime` を設定しても無視されるブラウザの挙動に対応
- [x] 同一 URL の場合 (同一アセット) は即座にシーク (従来通り)

**B. tick() でクリップ切替の過渡期を検出してフォールバック**
- [x] tick() 内で `clip.clip.id !== lastClipIdRef.current` をチェック
  - Effect 実行前は前クリップの ID のまま → 不一致 = 過渡期
  - deltaMs ベースで時間を進める

**C. tick() で video.currentTime の妥当性を検証**
- [x] `video.readyState >= 2` の場合でも、`video.currentTime` が期待値から 500ms 以上ズレていれば deltaMs フォールバック
  - 期待値: `clip.inMs + (curTime - clip.startMs)`
  - readyState >= 2 でもシーク未完了の場合があるため、直接検証が必要

## Phase 10 Tasks — エクスポート品質改善

### 37: エクスポート動画のブラウザ再生不可バグ修正

現状: エクスポートした動画を再生しようとすると「不正な形式」と表示され再生に失敗する。

原因:
- ソース動画が iPhone の HEVC 10-bit HDR (HLG, `yuv420p10le`, `color_transfer=arib-std-b67`, `color_space=bt2020nc`) で撮影されている
- `buildExportArgs()` で `-pix_fmt` を指定していないため、FFmpeg がソースの 10-bit カラーをそのまま H.264 High 10 profile で出力する
- ブラウザ (Chrome/Firefox/Safari) は H.264 High 10 profile (10-bit) の再生に対応していない
  - 対応しているのは H.264 Baseline / Main / High profile (8-bit, `yuv420p`) のみ
- 結果として MP4 ファイル自体は正常だが、ブラウザでは「不正な形式」として再生不可
- `ffprobe` で確認: `profile=High 10`, `pix_fmt=yuv420p10le`, `color_transfer=arib-std-b67`

副次的問題:
- Media 配信ルート (`media.ts`) で Content-Type ヘッダーが明示的に設定されていない
- エクスポート完了後に Exported Files 一覧が自動更新されない (`refetchExports` が呼ばれていない)

修正方針:

**A. FFmpeg エクスポート引数の修正** (`app/backend/src/services/export-service.ts`)
- [x] `buildExportArgs()` の出力オプションに `-pix_fmt yuv420p` を追加
  - 10-bit ソースを 8-bit に変換し、ブラウザ互換の H.264 High profile で出力する
  - これによりすべてのブラウザで再生可能になる
- [x] HDR → SDR のカラースペース変換を追加
  - `-colorspace bt709 -color_primaries bt709 -color_trc bt709` を指定
  - HDR (BT.2020 HLG) から SDR (BT.709) への色域マッピング
  - これによりブラウザで正しい色味で表示される

**B. Media 配信ルートの改善** (`app/backend/src/routes/media.ts`)
- [x] レスポンスに適切な Content-Type ヘッダーを設定
  - `.mp4` → `video/mp4`
  - `.jpg`/`.jpeg` → `image/jpeg`
  - `.png` → `image/png`
  - `.webm` → `video/webm`
  - `.mp3` → `audio/mpeg`
  - `.wav` → `audio/wav`
  - `.m4a`/`.aac` → `audio/mp4`
- [x] Content-Disposition ヘッダーを追加 (exports の場合のみ `attachment; filename="..."`)

**C. エクスポート完了後のファイル一覧更新** (`app/frontend/src/components/ExportDialog.tsx`)
- [x] `job.status === "completed"` になった時点で `refetchExports()` を呼び出す
  - `useEffect` で `job?.status` を監視し、`"completed"` 変化時に refetch
- [x] これにより、ダイアログを閉じずに新しいエクスポートファイルが一覧に表示される

**D. テスト** (`app/backend/src/services/export-service.test.ts`)
- [x] `buildExportArgs()` の出力に `-pix_fmt yuv420p` が含まれることを検証
- [x] `buildExportArgs()` の出力に色空間変換オプションが含まれることを検証
- [x] 既存のテストが引き続きパスすることを確認 (106 pass)

### 38: Export モーダル簡素化: エクスポート→自動ダウンロード

現状: Export モーダルに過去の Exported Files 一覧が表示されている。エクスポート完了後は手動で Download リンクをクリックする必要がある。ユーザーが求めるのは「Start Export を押したらエクスポートしてそのままダウンロードされる」というシンプルなフローである。

修正方針:

**A. Exported Files 一覧の削除** (`app/frontend/src/components/ExportDialog.tsx`)
- [x] `useExports` フックの使用を削除
- [x] Exported Files セクション (`<h4>Exported Files</h4>` 以下のファイルリスト) を削除
- [x] タスク37 で追加した `refetchExports` 関連の `useEffect` を削除 (一覧表示がなくなるため不要)

**B. エクスポート完了時の自動ダウンロード** (`app/frontend/src/components/ExportDialog.tsx`)
- [x] `useEffect` で `job?.status === "completed"` を監視し、完了時に自動ダウンロードを実行
  - `exportedFilenameRef` でエクスポート開始時のファイル名を記録
  - ダウンロード URL: `/media/projects/${projectId}/exports/${filename}`
  - プログラム的に `<a>` 要素を生成して `.click()` でダウンロードをトリガー
- [x] `downloadedRef` フラグで同じジョブに対する重複ダウンロードを防止

**C. 不要になった API フックの整理** (`app/frontend/src/api/exports.ts`)
- [x] `useExports` フックを削除 (使用箇所がなくなるため)

## Phase 11 Tasks — エディタ画面レイアウト大改修

### 現状の課題

現在のエディタ画面は 3 カラム + 下部タイムラインの構成:
```
┌──────────┬─────────────────────┬──────────┐
│  Assets  │   Preview Player    │Inspector │
│  (240px) │      (1fr)          │ (240px)  │
├──────────┴─────────────────────┴──────────┤
│              Timeline (220px)              │
└───────────────────────────────────────────┘
```

問題点:
- プレビューが中央に大きく配置されているが、編集作業中は Inspector の操作が主であり、プレビューは確認用
- Assets パネルと Inspector パネルがそれぞれ 240px と狭く、操作しにくい
- Assets / Inspector / Export ボタンなどの機能が分散している

### 目標レイアウト

プレビューを左端に固定し、右側の広いエリアを 1 ペインにまとめてタブで切り替える。Inspector をデフォルトタブとして最も目立つ位置に配置する。

```
┌───────────────┬─────────────────────────────┐
│               │  [Inspector] [Assets] [Export]│ ← タブバー
│   Preview     ├─────────────────────────────┤
│   Player      │                             │
│   (1/3幅)     │   タブコンテンツ (2/3幅)      │
│               │   (Inspector がデフォルト)    │
│               │                             │
├───────────────┴─────────────────────────────┤
│              Timeline (220px, 全幅)          │
└─────────────────────────────────────────────┘
```

### 39: エディタ画面レイアウト大改修: プレビュー左固定 + 右ペインタブ化

EditorLayout のグリッド構造を全面的に変更し、プレビューを左 1/3 に固定、右 2/3 をタブ付きペインにする。

**A. EditorLayout の CSS Grid 再設計** (`app/frontend/src/components/EditorLayout.tsx`)
- [ ] Props を変更:
  - 旧: `{ left, center, right, bottom }`
  - 新: `{ preview, mainPanel, bottom }`
  - `preview`: PreviewPlayer を配置
  - `mainPanel`: タブ付きペイン (Inspector / Assets / Export を含む)
  - `bottom`: Timeline (変更なし)
- [ ] gridTemplateColumns を `"1fr 2fr"` に変更 (左 1/3、右 2/3)
- [ ] gridTemplateRows は `"1fr 220px"` を維持
- [ ] プレビュー領域 (左): row 1, col 1
  - `background: #111`, `display: flex`, `alignItems: center`, `justifyContent: center`
  - `overflow: hidden`
- [ ] メインペイン (右): row 1, col 2
  - `background: #1a1a1a`, `overflow: auto`
  - `display: flex`, `flexDirection: column` (タブバー + コンテンツ)
- [ ] タイムライン (下): row 2, col 1-2 (`gridColumn: "1 / -1"`)

**B. EditorPage の組み替え** (`app/frontend/src/pages/EditorPage.tsx`)
- [ ] `left` / `center` / `right` の分離をやめ、`preview` と `mainPanel` に統合
- [ ] `preview` には PreviewPlayer のみを渡す
- [ ] `mainPanel` には新しい `EditorMainPanel` コンポーネントを渡す
  - EditorMainPanel がタブ管理を担当 (タスク 40 で詳細化)

### 40: 右ペインのタブ UI コンポーネント実装

タブバーとタブコンテンツを管理するコンポーネントを新規作成する。

**A. EditorMainPanel コンポーネント** (`app/frontend/src/components/EditorMainPanel.tsx`)
- [ ] 新規作成
- [ ] タブ定義:
  - `Inspector`: InspectorPanel + SaveIndicator (Undo/Redo)
  - `Assets`: AssetPanel + Add Text ボタン
  - `Export`: Export ボタン + ExportDialog トリガー
- [ ] タブ状態管理: `useState<"inspector" | "assets" | "export">("inspector")`
  - デフォルトは `"inspector"` (Inspector が最も使用頻度が高いため)
- [ ] Props: EditorPage から必要な props をすべて受け取る
  - `project`, `selectedClip`, `onUpdateClip`, `onDeleteAsset`, `assets`, `onImportAsset` 等

**B. タブバー UI** (`app/frontend/src/components/EditorMainPanel.tsx` 内)
- [ ] タブバー: `display: flex`, 上部に固定
  - 高さ: 36px
  - 背景: #1a1a1a
  - 下線: 1px solid #333
- [ ] 各タブボタン:
  - アクティブタブ: 背景 #2a2a2a, 下線 2px solid #5b8def, テキスト #eee
  - 非アクティブタブ: 背景 transparent, テキスト #888
  - ホバー: テキスト #ccc
  - パディング: 8px 16px
  - フォントサイズ: 13px
  - カーソル: pointer
- [ ] タブコンテンツ: `flex: 1`, `overflow: auto`, `padding: 8px`

**C. タブコンテンツの切り替え**
- [ ] アクティブなタブのコンテンツのみレンダリング (条件分岐)
  - Inspector タブ: SaveIndicator + InspectorPanel
  - Assets タブ: AssetPanel + "+ Add Text" ボタン
  - Export タブ: Export ボタン + Jobs リンク
- [ ] 非アクティブなタブのコンテンツはアンマウントせず `display: none` で非表示にする
  - AssetPanel のインポート状態やポーリングが失われないようにするため

### 41: Inspector タブの優先表示とクリップ選択連動

タイムラインでクリップを選択したとき、自動的に Inspector タブに切り替える。

**A. クリップ選択時の自動タブ切り替え** (`app/frontend/src/components/EditorMainPanel.tsx`)
- [ ] `selectedClipId` prop を受け取る
- [ ] `useEffect` で `selectedClipId` の変化を監視
  - `selectedClipId` が `null` → 非 null に変わったとき、タブを `"inspector"` に切り替え
  - `null` → `null` や非 null → 別の非 null では切り替えない (ユーザーが意図的に別タブにいる場合を尊重)
- [ ] ただし、初回レンダー時は切り替えを発生させない (`useRef` でマウント済みフラグ管理)

**B. Inspector タブの視覚的な強調**
- [ ] Inspector タブのラベルを太字にする (`fontWeight: 600`)
- [ ] クリップ選択中は Inspector タブのラベル横にインジケータ (小さな青い丸) を表示
  - `width: 6px, height: 6px, borderRadius: 50%, background: #5b8def`
  - クリップ未選択時は非表示

### 42: タイムラインの全幅レイアウト維持

レイアウト変更後もタイムラインが画面下部に全幅で表示されることを保証する。

**A. タイムラインのグリッド配置確認** (`app/frontend/src/components/EditorLayout.tsx`)
- [ ] タイムラインの `gridColumn: "1 / -1"` を維持 (2カラム全幅)
- [ ] `gridRow: 2` を明示的に設定
- [ ] 高さ 220px を維持

**B. タイムラインの操作性確認**
- [ ] ルーラーのドラッグシークが正常に動作すること
- [ ] シークバー専用行が正常に表示されること
- [ ] プレイヘッドが正しい位置に表示されること
- [ ] クリップの右クリックメニューが正常に動作すること
- [ ] トリムハンドルのドラッグが正常に動作すること

## Phase 12 Tasks — クリップ選択と再生の連動

### 43: クリップ選択時のシーク移動とプレビュー表示

現状: タイムラインでクリップをクリックすると `selectedClipId` が設定されるが、プレイヘッド (`currentTimeMs`) は移動しない。プレビューも変化しない。ユーザーはクリップを選択した後、そのクリップの内容を確認するために手動でシークバーを操作する必要がある。

目標: クリップを選択したら、プレイヘッドをそのクリップの先頭 (`clip.startMs`) に移動させ、プレビューにそのクリップの 1 フレーム目を表示する。

原理:
- `currentTimeMs` をクリップの `startMs` に設定すれば、`findActiveClip()` がそのクリップを返し、PreviewPlayer の既存ロジック (非再生時の seek useEffect) が `video.currentTime = clip.inMs / 1000` を設定する
- つまりシーク移動だけで、プレビュー表示は既存の仕組みで自動的に実現される

**A. EditorPage のクリップ選択ハンドラにシーク追加** (`app/frontend/src/pages/EditorPage.tsx`)
- [ ] `onSelectClip` のコールバックを拡張: クリップ選択時にそのクリップの `startMs` に `onSeek` を呼ぶ
  - `handleSelectClip(clipId: string | null)` を新設
  - `clipId` が非 null の場合: `sequence.tracks` からクリップを検索し、`clip.startMs` を取得して `onSeek(clip.startMs)` を呼ぶ
  - `clipId` が null の場合 (選択解除): シークは変更しない
- [ ] Timeline と EditorMainPanel に渡す `onSelectClip` をこの新ハンドラに差し替え

**B. クリップ検索ヘルパー** (`app/frontend/src/pages/EditorPage.tsx`)
- [ ] `findClipById(sequence, clipId)` ヘルパーを追加 (全トラックを走査して該当クリップを返す)
- [ ] 見つからない場合はシーク変更なし (安全ガード)

**C. 注意事項**
- [ ] ドラッグ並べ替え中の mousedown でもシークが発生するが、並べ替え操作自体には影響しない (クリップの startMs に移動するだけ)
- [ ] 再生中のクリップ選択ではシークにより再生位置がジャンプする (意図的な挙動)

### 44: 選択クリップ範囲のみ再生

現状: Play を押すと `currentTimeMs` からシーケンス末尾 (`seqEnd`) まで全体を通して再生する。特定のクリップだけを確認したい場合に不便。

目標:
- クリップが選択された状態で Play を押すと、そのクリップの範囲 (`clip.startMs` 〜 `clip.startMs + clip.durationMs`) のみ再生する
- クリップ末尾に到達したら再生を停止する
- 停止後に再度 Play を押すと、そのクリップの先頭から再生する
- クリップが未選択の場合は従来通り全体再生

**A. PreviewPlayer の tick() にクリップ範囲制限を追加** (`app/frontend/src/components/PreviewPlayer.tsx`)
- [ ] Props に `selectedClipId: string | null` を追加
- [ ] `selectedClipId` が非 null の場合、シーケンス末尾の代わりに選択クリップの末尾を再生終了ポイントとして使用
  - tick() 内の `seqEnd` を `selectedClipEndMs` に置き換える
  - `selectedClipEndMs = selectedClip.startMs + selectedClip.durationMs`
- [ ] 選択クリップの検索: `findClipInSequence(project.sequence, selectedClipId)` を使用
  - 見つからない場合 (クリップが削除された等) はフォールバックとして全体再生

**B. Play ボタンの挙動変更** (`app/frontend/src/components/PreviewPlayer.tsx`)
- [ ] Play 押下時の先頭リセット判定を修正:
  - クリップ選択中: `currentTimeMs >= selectedClipEndMs` の場合、`onTimeUpdate(selectedClip.startMs)` でクリップ先頭にリセット
  - クリップ未選択: 従来通り `currentTimeMs >= seqEnd` で `onTimeUpdate(0)` (シーケンス先頭)

**C. 選択解除時の挙動**
- [ ] 再生中にクリップ選択を解除 (`selectedClipId` が null に変化) した場合、再生を継続して全体再生モードに切り替え
  - tick() 内で `selectedClipId` が null になったら終了ポイントを `seqEnd` に戻す

## Phase 13 Tasks — プロジェクト設定とタイムライン制約

### 現状の課題

- プロジェクト全体の設定を管理する場所がない
- タイムラインの長さはクリップ配置から動的に計算されており、動画全体の目標尺を制御できない
- クリップをいくらでも長い位置に配置でき、意図しない長尺動画になるリスクがある

### 目標

- プロジェクト設定として「動画時間 (duration)」を管理する
- デフォルト値は 10 秒 (10000ms)
- タイムライン UI にこの時間制限を反映し、制限を超える位置へのクリップ配置・移動・トリムを防止する
- エディタの右ペインに「Settings」タブを追加し、動画時間を変更できるようにする

### 45: 共有型に ProjectSettings を追加

プロジェクトに設定フィールドを追加し、動画時間のデフォルト値を定義する。

**A. 型定義の追加** (`app/shared/src/types/project.ts`)
- [x] `ProjectSettings` 型を新規定義:
  ```typescript
  export type ProjectSettings = {
    durationMs: number; // 動画全体の目標尺 (ミリ秒)
  };
  ```
- [x] `Project` 型に `settings: ProjectSettings` フィールドを追加 (必須フィールド)
- [x] `index.ts` re-export に `ProjectSettings` を追加

**B. デフォルト値の定義** (`app/shared/src/utils/constants.ts`)
- [x] `DEFAULT_PROJECT_DURATION_MS = 10_000` (10 秒) を追加

**C. プロジェクト作成時のデフォルト設定**
- [x] バックエンドの `createProject()` (`app/backend/src/services/project-service.ts`) で `settings: { durationMs: DEFAULT_PROJECT_DURATION_MS }` を初期値として設定
- [x] フロントエンドの `useCreateProject` (`app/frontend/src/api/projects.ts`) はバックエンド側でデフォルト設定するため変更不要

### 46: Settings タブの追加

エディタ右ペインに Settings タブを追加し、動画時間を編集できるようにする。

**A. ProjectSettingsPanel コンポーネント** (`app/frontend/src/components/ProjectSettingsPanel.tsx`)
- [x] 新規作成
- [x] Props: `{ project: Project; onUpdateSettings: (settings: ProjectSettings) => void }`
- [x] UI 構成: Duration (sec) 数値入力、バリデーション (1-3600s)、ダークテーマ

**B. EditorMainPanel にタブ追加** (`app/frontend/src/components/EditorMainPanel.tsx`)
- [x] タブ定義を `"inspector" | "assets" | "export" | "settings"` に拡張
- [x] TABS 配列に Settings を追加、Props に `settingsContent` を追加

**C. EditorPage の組み込み** (`app/frontend/src/pages/EditorPage.tsx`)
- [x] `handleUpdateSettings` コールバックを追加 (useUpdateProject で直接保存)
- [x] `ProjectSettingsPanel` を `settingsContent` として渡す

**D. useProjectEditor にプロジェクト設定更新を追加**
- [x] 設定変更はプロジェクトレベルのため、useUpdateProject で直接保存する方式を採用 (undo/redo 対象外)

### 47: タイムライン UI への動画時間制限の反映

タイムラインの表示と操作に動画時間の上限を適用する。

**A. タイムライン表示幅の固定** (`app/frontend/src/components/Timeline.tsx`)
- [x] `getTimelineDuration()` を `project.settings.durationMs` ベースに修正
- [x] タイムラインに終端マーカー (dashed red line) を表示

**B. クリップ追加時の制約** (`app/frontend/src/lib/sequence-ops.ts`)
- [x] `addClipFromAsset()` に `maxDurationMs` 引数追加、クランプ・拒否ロジック実装
- [x] `addTextClip()` にも同様の制約追加

**C. クリップ移動時の制約**
- [x] `moveClip()` に `maxDurationMs` 引数追加、startMs クランプ実装

**D. クリップトリム時の制約**
- [x] `trimClip()` に `maxTimelineDurationMs` 引数追加、右トリムのクランプ実装

**E. useProjectEditor への制約伝播**
- [x] 全操作関数に `project.settings.durationMs` を渡すよう更新

**F. ドラッグ移動のビジュアルフィードバック** (`app/frontend/src/components/TimelineClip.tsx`)
- [x] ドラッグ中のプレビュー位置を `maxDurationMs - clip.durationMs` でクランプ

### 48: テストの追加

**A. sequence-ops テスト** (`app/frontend/src/lib/sequence-ops.test.ts`)
- [x] `addClipFromAsset` に `maxDurationMs` を指定: クランプ、拒否、制約なしの 4 テスト
- [x] `moveClip` に `maxDurationMs` を指定: 移動可、クランプ、オーバーフローの 3 テスト
- [x] `trimClip` に `maxTimelineDurationMs` を指定: タイムライン制約、ソース+タイムライン複合制約の 2 テスト
- [x] `addTextClip` に `maxDurationMs` を指定: クランプ、拒否、制約なしの 3 テスト

**B. 型の整合性確認**
- [x] `Project` 型で `settings` が必須フィールドであることを TypeScript コンパイルで確認 (既存テストが型チェックを通過)
- [x] `createProject` が `settings.durationMs = 10_000` で初期化されることを検証 (project-service.test.ts に追加)

## Phase 14 Tasks — 再生・操作性・インポート改善

### 49: 先頭から全体再生ボタンの追加

現状: Play ボタンはクリップ選択中はそのクリップ範囲のみ再生し、未選択時は現在位置から末尾まで再生する。「最初から全体を通して再生する」操作にはクリップ選択を解除 → プレイヘッドを先頭に移動 → Play の 3 ステップが必要。

目標: 1 クリックで「クリップ選択を解除し、先頭 (0ms) から全体再生」できるボタンを追加する。

**A. PreviewPlayer に「最初から再生」ボタンを追加** (`app/frontend/src/components/PreviewPlayer.tsx`)
- [ ] Play ボタンの左に「⏮」(先頭から再生) ボタンを追加
  - クリック時: `onTimeUpdate(0)` でプレイヘッドを先頭に移動
  - `onSelectClip(null)` でクリップ選択を解除 (全体再生モードにする)
  - `onPlayPause()` で再生開始 (既に再生中なら一度停止してから再開)
- [ ] Props に `onSelectClip: (id: string | null) => void` を追加
  - EditorPage からクリップ選択解除を呼べるようにする

**B. ボタン UI** (`app/frontend/src/components/PreviewPlayer.tsx`)
- [ ] 既存の Play ボタンと統一したスタイル
  - サイズ・背景色・ボーダーを合わせる
  - ラベル: 「⏮」または「Restart」(コンパクトな表記)
- [ ] ボタン配置: 「⏮ Play」の順で左から並べる
- [ ] 再生中に「⏮」を押した場合: 再生を停止 → 先頭にシーク → 再生開始

**C. EditorPage の接続** (`app/frontend/src/pages/EditorPage.tsx`)
- [ ] PreviewPlayer に `onSelectClip={handleSelectClip}` を渡す (既存の handleSelectClip を再利用)
  - ただし PreviewPlayer 内では `onSelectClip(null)` のみ使用 (選択解除のみ)

### 50: 同一トラック内のクリップ重なり防止

現状: `moveClip()` は `startMs >= 0` と `startMs + durationMs <= maxDurationMs` の制約のみ適用しており、同一トラック内のクリップ間の重なりを検出・防止していない。クリップを別のクリップ上にドラッグすると、重なった状態で配置される。

目標: クリップをドラッグ移動する際、同一トラック内の他のクリップと重ならないようにする。後ろから近づけた場合、前のクリップの末尾にピッタリくっついた位置で停止する (スナップ動作)。

**A. moveClip にクリップ衝突回避ロジックを追加** (`app/frontend/src/lib/sequence-ops.ts`)
- [ ] `moveClip()` 内でクリップ移動後の位置を計算した後、同一トラック内の他のクリップとの重なりを検出
- [ ] 衝突回避アルゴリズム:
  1. 移動対象クリップの新しい範囲: `[newStartMs, newStartMs + clip.durationMs)`
  2. 同一トラック内の他のクリップを走査
  3. 重なるクリップが見つかった場合:
     - **右方向から近づいた場合** (移動先が前のクリップと重なる): `newStartMs = prevClip.startMs + prevClip.durationMs` (前のクリップの末尾にスナップ)
     - **左方向から近づいた場合** (移動先が後ろのクリップと重なる): `newStartMs = nextClip.startMs - clip.durationMs` (後ろのクリップの先頭にスナップ)
  4. スナップ後も別のクリップと重なる場合は移動をキャンセル (元の位置を維持)

**B. 衝突検出ヘルパー関数** (`app/frontend/src/lib/sequence-ops.ts`)
- [ ] `findNonOverlappingPosition(clips, movingClipId, newStartMs, durationMs): number` を追加
  - 他のクリップの範囲を確認し、重ならない最寄りの位置を返す
  - 左側の最も近いクリップの末尾と、右側の最も近いクリップの先頭の間に収まるようにクランプ

**C. テストの追加** (`app/frontend/src/lib/sequence-ops.test.ts`)
- [ ] クリップを別のクリップ上に移動しようとした場合、前のクリップ末尾にスナップすることを検証
- [ ] クリップ間に十分なスペースがある場合は自由に移動できることを検証
- [ ] 3つ以上のクリップがある場合の中間位置への移動テスト

### 51: アセットインポート完了前のクリップ追加防止とサムネイル表示改善

現状の問題:
1. アセットをインポートした直後、バックグラウンドジョブ (ffprobe + proxy/thumbnail 生成) が完了するまで `asset.thumbnailPath` と `asset.proxyPath` が `undefined`。この状態でサムネイルが表示されず kind ラベル ("video" 等) のみ表示される。
2. ジョブ完了前に「+ Add to Timeline」を押すと、`asset.durationMs` が `undefined` のため `DEFAULT_IMAGE_DURATION_MS (3000ms)` がフォールバックとして使われ、不正確なクリップが作成される。ジョブ完了後に正しい duration に更新されない。
3. ジョブ完了後、プロジェクトの再フェッチが行われないため、サムネイルが表示されない場合がある。

**A. ジョブ未完了アセットの「Add to Timeline」ボタンを無効化** (`app/frontend/src/components/AssetPanel.tsx`)
- [ ] `AssetThumbnail` コンポーネントの「+」ボタンに `disabled` 条件を追加
  - ジョブが進行中 (`job.status` が `"pending"` or `"running"`) の場合はボタンをグレーアウト
  - ジョブが完了 (`"completed"`) の場合のみクリック可能
  - ジョブがない (`jobId` が null) かつ `asset.durationMs` が設定済みの場合も有効 (既に完了済みのアセット)
- [ ] ボタンの disabled スタイル: `opacity: 0.4`, `cursor: not-allowed`

**B. ジョブ完了後のプロジェクト再フェッチ** (`app/frontend/src/components/AssetPanel.tsx`)
- [ ] ジョブ完了 (`job.status === "completed"`) を検出したら `queryClient.invalidateQueries(["projects", projectId])` を呼び出す
  - これにより `useProject` が再フェッチされ、更新された asset (thumbnailPath, proxyPath, durationMs) が取得される
  - `useEffect` で各アクティブジョブの status を監視し、completed 変化時に refetch をトリガー

**C. アクティブジョブの永続化改善** (`app/frontend/src/components/AssetPanel.tsx`)
- [ ] 現在 `activeJobIds` は `useState` で管理されており、ページ遷移やリロードで失われる
  - アセットの `thumbnailPath` が undefined のアセットについて、初回レンダー時にバックエンドから最新のジョブ情報を取得する
  - または、アセットの `thumbnailPath` の有無でジョブ完了を判定し、ジョブ ID 管理を不要にする

**D. AssetThumbnail のローディング表示改善** (`app/frontend/src/components/AssetThumbnail.tsx`)
- [ ] ジョブ進行中: スピナーまたはプログレスバーを表示 (既存の JobProgress を使用)
- [ ] ジョブ完了でサムネイルがまだ表示されない場合: 「Processing...」表示
- [ ] サムネイルがある場合: 画像を表示 (現状通り)

## Phase 15 Tasks — インスペクタ機能強化

### 現状の課題

1. **Crop の初期値問題**: Crop の W/H がハードコード `100` で初期化されている。元動画のサイズ (`asset.width/height`) がアセットメタデータとして取得済みなのに活用されていない
2. **クリップの位置・拡大縮小**: `ClipTransform` 型に `x`, `y`, `scale` フィールドが定義済みだが、UI (InspectorPanel) もプレビュー描画 (PreviewPlayer) もエクスポート (export-service) も未実装。回転のみ対応
3. **クリップ開始位置の数値入力**: `startMs` は InspectorPanel に読み取り専用テキストで表示されるのみ。タイムライン上のドラッグでしか変更できない

### 52: Crop 初期値をアセットサイズに合わせる

現状: `InspectorPanel.tsx` の `updateCrop()` で Crop が未設定の場合のデフォルト値が `{ x: 0, y: 0, width: 100, height: 100 }` にハードコードされている。これはアセットの実際のピクセルサイズと無関係な値であり、Crop を初めて設定したときに意図しない範囲になる。

目標: Crop の初期 W/H をアセットの実サイズ (`asset.width`, `asset.height`) に合わせる。

**A. TransformEditor にアセット情報を渡す** (`app/frontend/src/components/InspectorPanel.tsx`)
- [ ] `TransformEditor` の props に `asset: Asset | undefined` を追加
- [ ] `InspectorPanel` から `TransformEditor` に `asset` を渡す

**B. Crop デフォルト値をアセットサイズで初期化**
- [ ] `updateCrop()` 内のフォールバック値を変更:
  - 旧: `{ x: 0, y: 0, width: 100, height: 100, ...field }`
  - 新: `{ x: 0, y: 0, width: asset?.width ?? 100, height: asset?.height ?? 100, ...field }`
- [ ] Crop の W/H 入力フィールドのプレースホルダー表示も変更:
  - 旧: `crop?.width ?? 100`, `crop?.height ?? 100`
  - 新: `crop?.width ?? (asset?.width ?? 100)`, `crop?.height ?? (asset?.height ?? 100)`

**C. バリデーション**
- [ ] W > 0 かつ W <= asset.width (存在する場合)
- [ ] H > 0 かつ H <= asset.height (存在する場合)
- [ ] X + W <= asset.width, Y + H <= asset.height (存在する場合)

### 53: クリップの位置・拡大縮小 UI とプレビュー対応

現状: `ClipTransform` 型に `x`, `y`, `scale` が定義済みだが、UI・プレビュー描画・エクスポートのいずれにも未実装。

目標: インスペクタから位置 (X, Y) と拡大縮小 (Scale) を設定でき、プレビューにリアルタイム反映される。

**A. TransformEditor に Position / Scale UI を追加** (`app/frontend/src/components/InspectorPanel.tsx`)
- [ ] Rotation セクションの下に Position セクションを追加:
  - X: `<input type="number">` (ピクセル単位、step=1、デフォルト 0)
  - Y: `<input type="number">` (ピクセル単位、step=1、デフォルト 0)
  - 2 カラムグリッドで X, Y を横並び表示
- [ ] Position セクションの下に Scale セクションを追加:
  - Scale: `<input type="number">` (倍率、step=0.1、min=0.1、max=5.0、デフォルト 1.0)
  - `{Math.round(scale * 100)}%` でパーセント表示を添える
- [ ] 「Reset Transform」ボタンを追加: `onUpdate({ transform: undefined })` でリセット
- [ ] 各入力値変更時に `updateTransform({ x: ... })` 等で `onUpdateClip` を呼ぶ

**B. PreviewPlayer でのトランスフォーム描画** (`app/frontend/src/components/PreviewPlayer.tsx`)
- [ ] `activeClip.clip.transform` から `x`, `y`, `scale` を取得 (デフォルト: x=0, y=0, scale=1)
- [ ] 映像/画像要素の CSS `transform` を拡張:
  - 現状: `transform: rotate(${rotation}deg)`
  - 変更: `transform: translate(${x}px, ${y}px) scale(${scale}) rotate(${rotation}deg)`
  - `transformOrigin: "center center"` を設定
- [ ] クロップとの組み合わせ: クロップコンテナの外側に position/scale を適用

**C. エクスポートでの反映** (`app/backend/src/services/export-service.ts`)
- [ ] `buildExportArgs()` で `transform.x`, `transform.y`, `transform.scale` を FFmpeg フィルターに変換
  - Scale: `scale=iw*{scale}:ih*{scale}` フィルター
  - Position: `pad` または `overlay` フィルターで座標指定
  - 回転と合わせて filtergraph に挿入

### 54: クリップ開始位置の数値入力

現状: InspectorPanel の `<Row label="Start" value={formatMs(clip.startMs)} />` は読み取り専用。タイムライン上のドラッグ移動でしか `startMs` を変更できない。

目標: インスペクタから `startMs` を数値入力で変更でき、タイムライン上のクリップ位置がリアルタイムに更新される。

**A. Start 行を編集可能にする** (`app/frontend/src/components/InspectorPanel.tsx`)
- [ ] `<Row label="Start" value={formatMs(clip.startMs)} />` を `TrimEditor` と同様の数値入力フィールドに変更
  - 秒単位の入力 (小数第 1 位まで、step=0.1)
  - `useState` で入力値を管理、`onBlur` / `Enter` キーでコミット
- [ ] InspectorPanel の props に `onMoveClip?: (clipId: string, newStartMs: number) => void` を追加
- [ ] 値変更時: `onMoveClip(clip.id, newStartMs)` を呼ぶ
  - これにより `sequence-ops.moveClip()` 経由で重なり防止・maxDurationMs 制約が適用される

**B. EditorPage からの接続** (`app/frontend/src/pages/EditorPage.tsx`)
- [ ] InspectorPanel に `onMoveClip` を渡す
  - `useProjectEditor` の `moveClip` を使用
- [ ] EditorMainPanel 経由で props を伝播

**C. バリデーション**
- [ ] startMs >= 0
- [ ] startMs + clip.durationMs <= project.settings.durationMs (タイムライン制約)
- [ ] 不正な値の場合は入力を元の値に戻す
- [ ] 同一トラック内の重なり防止は `moveClip()` のロジックで自動適用される

### 55: Undo/Redo UI を Inspector から分離してグローバル配置

現状: `SaveIndicator` コンポーネント（undo/redo ボタン + 保存状態ラベル）が Inspector タブのコンテンツ内に配置されている (`EditorPage.tsx:133-140`)。undo/redo はプロジェクト全体の操作であり、個々のクリップに紐づく Inspector 内にあるのは意味的に不自然。

目標: undo/redo ボタンと保存状態表示を Inspector から分離し、エディタ全体に対するグローバルな UI として配置する。

**A. SaveIndicator を Inspector コンテンツから除去** (`app/frontend/src/pages/EditorPage.tsx`)
- [ ] `inspectorContent` から `SaveIndicator` を除去
  - 現在: `inspectorContent` の `<div>` 内に `SaveIndicator` + `InspectorPanel` が並列配置
  - 変更後: `inspectorContent` は `InspectorPanel` のみにする

**B. ツールバー領域の新設** (`app/frontend/src/components/EditorLayout.tsx`)
- [ ] `EditorLayout` に `toolbar` スロット (prop) を追加
- [ ] プレビュー領域の上部、または右ペインのタブバー上部にツールバー行を配置
  - 推奨配置: プレビュー領域の上に横幅全体を使ったツールバー行
  - 高さ: 32-36px 程度の薄いバー
- [ ] ツールバーのスタイル: 背景色はエディタのヘッダー/パネルと統一、左右に要素を分散配置できる flex レイアウト

**C. SaveIndicator をツールバーに移動** (`app/frontend/src/pages/EditorPage.tsx`)
- [ ] `EditorLayout` の `toolbar` prop に `SaveIndicator` を渡す
- [ ] SaveIndicator の props (status, canUndo, canRedo, onUndo, onRedo) はそのまま維持
- [ ] ツールバー内での配置: 右寄せ (将来的に左側に他のツールバーボタンを追加可能)

**D. SaveIndicator コンポーネントの微調整** (`app/frontend/src/components/SaveIndicator.tsx`)
- [ ] ツールバー配置に合わせたスタイル微調整（必要に応じて）
  - 横並びレイアウトは既存のまま活用
  - フォントサイズ・ボタンサイズがツールバーの高さに合うか確認

**E. 動作確認**
- [ ] undo/redo ボタンがツールバーに表示されること
- [ ] Inspector タブ内に undo/redo が表示されないこと
- [ ] undo/redo のクリック操作が正常に動作すること
- [ ] キーボードショートカット (Ctrl+Z / Ctrl+Shift+Z) は影響を受けないこと
- [ ] 保存状態ラベル (Saving.../Saved/Error) が正常に表示されること

### 56: TypeScript 暗黙 any 型エラーの修正

現状: `strict: true` 設定下でコールバック引数に暗黙の `any` 型推論が発生（TS7006）。`@video/shared` の型がビルド未実施で解決できないことが根本原因だが、型注釈を明示することで shared ビルド有無に依存せず型安全にする。

目標: `npx tsc --noEmit -p app/frontend/tsconfig.json` で TS7006 エラーをゼロにする（TS6305, bun:test 関連は対象外）。

**A. sequence-ops.ts の型注釈追加** (`app/frontend/src/lib/sequence-ops.ts`)
- [ ] import に `Track` を追加
- [ ] `.map((t) =>` → `.map((t: Track) =>`（6箇所）
- [ ] `.find((t) =>` → `.find((t: Track) =>`（2箇所）
- [ ] `.find((c) =>` / `.map((c) =>` → `(c: Clip)`（8箇所）
- [ ] `.filter((c) =>` → `(c: Clip)`
- [ ] `.sort((a, b) =>` → `(a: Clip, b: Clip)`（2箇所）
- [ ] `.reduce` の `(max, c)` → `(max: number, c: Clip)`

**B. コンポーネントの型注釈追加**
- [ ] `AssetPanel.tsx:89` — `.map((asset) =>` → `.map((asset: Asset) =>`
- [ ] `InspectorPanel.tsx:16` — `.find((c) =>` → `.find((c: Clip) =>`
- [ ] `InspectorPanel.tsx:18` — `.find((a) =>` → `.find((a: Asset) =>`
- [ ] `PreviewPlayer.tsx:30` — `.find((a) =>` → `.find((a: Asset) =>`
- [ ] `Timeline.tsx:214` — `.map((track) =>` → `.map((track: Track) =>`、import に `Track` 追加
- [ ] `TimelineTrack.tsx:67` — `.map((clip) =>` → `.map((clip: Clip) =>`、import に `Clip` 追加

**C. hooks の型注釈追加**
- [ ] `useProjectEditor.ts:38` — `.find((c) =>` → `.find((c: Clip) =>`
- [ ] `useProjectEditor.ts:40` — `.find((a) =>` → `.find((a: Asset) =>`

**D. HomePage の型注釈追加**
- [ ] `HomePage.tsx:84` — `.map((p) =>` → `.map((p: Project) =>`、import に `Project` 追加

**E. テストファイルの型注釈追加** (`app/frontend/src/lib/sequence-ops.test.ts`)
- [ ] `.find((t) =>` → `.find((t: Track) =>`
- [ ] `.map((c) =>` / `.find((c) =>` → `(c: Clip)`（5箇所）

### 57: エクスポートが project settings の動画時間を超過するバグ修正

現状: `buildExportArgs()` (`app/backend/src/services/export-service.ts`) はビデオトラックの全クリップの `durationMs` を単純合算してエクスポートしており、`project.settings.durationMs` を一切参照していない。ユーザーが Settings で動画時間を 6 秒に設定しても、タイムライン上の全クリップ（例: 3 秒 × 6 本 = 18 秒）がそのまま出力される。

目標: エクスポート結果の動画長が `project.settings.durationMs` を超えないようにする。

**A. buildExportArgs でプロジェクト設定の durationMs を適用** (`app/backend/src/services/export-service.ts`)
- [ ] `project.settings.durationMs` を取得し、エクスポートの最大時間とする
- [ ] クリップのフィルタリング: `clip.startMs >= projectDurationMs` のクリップを除外
- [ ] クリップのトリム: `clip.startMs + clip.durationMs > projectDurationMs` の場合、`durationMs` を `projectDurationMs - clip.startMs` にクランプ
- [ ] concat の `n=` パラメータを除外後のクリップ数に更新
- [ ] テキストオーバーレイも同様に `projectDurationMs` 以降を除外

**B. startExport の totalDurationMs 計算を修正** (`app/backend/src/services/export-service.ts`)
- [ ] `totalDurationMs` を `Math.min(clipSum, project.settings.durationMs)` に変更（プログレスバー精度向上）

**C. テスト追加** (`app/backend/src/services/export-service.test.ts`)
- [ ] プロジェクト設定 6000ms、クリップ合計 18000ms → 出力が 6000ms 分に制限されることを検証
- [ ] 境界をまたぐクリップが正しくトリムされることを検証
- [ ] 設定時間外のクリップが除外されることを検証

### 58: 設定変更時の既存クリップ遡及トリム

現状: `addClipFromAsset()` はクリップ追加時に `maxDurationMs` でクランプするが、プロジェクト設定の `durationMs` を後から短くしても既存クリップは調整されない。結果、タイムライン上にプロジェクト設定を超えるクリップが残り、Task 57 のエクスポート問題の原因となる。

目標: プロジェクト設定の `durationMs` 変更時に既存クリップを自動的にトリム・除外する。

**A. クリップトリム関数の追加** (`app/frontend/src/lib/sequence-ops.ts`)
- [ ] `clampClipsToDuration(sequence, maxDurationMs)` 関数を追加
- [ ] `startMs >= maxDurationMs` のクリップを除外
- [ ] `startMs + durationMs > maxDurationMs` のクリップの `durationMs` と `outMs` をクランプ
- [ ] 空になったトラック（video/audio）は保持（title トラックのクリップも同様にクランプ）

**B. 設定変更時の適用** (`app/frontend/src/hooks/useProjectEditor.ts` or Settings パネル)
- [ ] `project.settings.durationMs` の変更時に `clampClipsToDuration` を呼び出す
- [ ] Undo/Redo スタックに正しく反映されるよう `pushState` 経由で適用

**C. テスト追加** (`app/frontend/src/lib/sequence-ops.test.ts`)
- [ ] 設定短縮で境界をまたぐクリップがトリムされることを検証
- [ ] 設定範囲外のクリップが除外されることを検証
- [ ] title/audio トラックも同様にクランプされることを検証

### 59: エクスポート時のクリップフリーズ・尺ずれバグ修正

現状: エクスポートした動画で (1) 1つ目のクリップが想定より短い (2) 2つ目のクリップが途中でフリーズし静止画のまま残り時間を埋める、という現象が発生。原因は FFmpeg の `trim` フィルターが、クリップの `durationMs` がソース動画の実際の長さを超える場合に最終フレームを引き延ばすこと、および `inMs`/`outMs` と `durationMs` の不整合。

目標: エクスポート動画がフリーズせず、各クリップが正確な尺で再生されるようにする。

**A. trim duration のソース長クランプ** (`app/backend/src/services/export-service.ts`)
- [ ] エクスポート時にアセットの `durationMs` を参照し、`trim` の `duration` が `asset.durationMs - clip.inMs` を超えないようクランプ
- [ ] `clip.durationMs` がソース残量を超える場合、不足分は黒フレームで埋めるか、クリップをソース長で打ち切る（打ち切りが妥当）

**B. inMs/outMs/durationMs の整合性チェック**
- [ ] `buildExportArgs` 内で各クリップの `outMs - inMs === durationMs` を検証し、不整合があれば `durationMs = outMs - inMs` に修正
- [ ] フロントエンド側（`sequence-ops.ts`）でも `trimClip` / `updateClip` 後の整合性を保証

**C. Playwright E2E テスト** (調査・検証用)
- [ ] Playwright でアプリを起動し、2つの動画アセットをインポート → タイムラインに追加 → 設定で動画時間を指定 → エクスポート → 出力動画の長さを `ffprobe` で検証
- [ ] フリーズフレームが発生しないことを確認（最終フレームが不自然に長くないことを検証）

## Phase 17 Tasks — Everforest Light カラーテーマ適用

### 現状の課題

- 全コンポーネントがダークテーマのハードコード色 (#111, #1a1a1a, #222, #333 等) を使用
- カラー定数が一切集約されておらず、23 ファイルに分散
- テーマ変更や色彩統一が困難

### 目標

macOS Terminal テーマ `everforest-light.terminal` で定義されるカラーパレットに基づき、全コンポーネントをライトテーマに統一する。

### Everforest Light カラーパレット (`.terminal` ファイルから抽出)

| 役割 | RGB (0-1) | HEX | 用途 |
|------|-----------|-----|------|
| Background | 0.992, 0.965, 0.890 | `#FDF6E3` | メイン背景 |
| Text | 0.361, 0.416, 0.447 | `#5C6A72` | 本文テキスト |
| Cursor | 0.208, 0.655, 0.486 | `#35A77C` | カーソル・アクセント (cyan) |
| Selection | 0.937, 0.914, 0.835 | `#EFE9D5` | 選択範囲・ホバー |
| Black | 0.361, 0.416, 0.447 | `#5C6A72` | 見出し・強調テキスト |
| Red | 0.973, 0.333, 0.322 | `#F85552` | エラー・削除 |
| Green | 0.553, 0.631, 0.004 | `#8DA101` | 成功・audio クリップ |
| Yellow | 0.875, 0.627, 0.0 | `#DFA000` | 警告・saving 状態 |
| Blue | 0.227, 0.580, 0.773 | `#3A94C5` | video クリップ・アクティブタブ |
| Magenta | 0.875, 0.412, 0.729 | `#DF69BA` | text クリップ |
| Cyan | 0.208, 0.655, 0.486 | `#35A77C` | ハイライト・リンク |
| White | 0.576, 0.624, 0.569 | `#939F91` | 無効テキスト・ボーダー |
| BrightWhite | 0.957, 0.941, 0.851 | `#F4F0D9` | サブ背景・パネル |

### 60: Everforest Light テーマ定数ファイルの作成

カラーパレットを一元管理する定数ファイルを新規作成し、全コンポーネントから参照可能にする。

**A. テーマ定数ファイルの作成** (`app/frontend/src/theme.ts`)
- [ ] 新規作成
- [ ] Everforest Light のベースカラーを定義:
  ```typescript
  export const theme = {
    // ── ベースカラー ──
    bg:          '#FDF6E3',  // メイン背景 (Background)
    bgPanel:     '#F4F0D9',  // パネル背景 (BrightWhite)
    bgHover:     '#EFE9D5',  // ホバー・選択 (Selection)
    bgDark:      '#E5DFC9',  // 押下・アクティブ (Selection より暗め, 派生色)

    text:        '#5C6A72',  // 本文テキスト (Text / Black)
    textMuted:   '#939F91',  // 補助テキスト (White)
    textDisabled:'#A9B3A5',  // 無効テキスト (White より明るめ, 派生色)

    border:      '#D4CCAB',  // ボーダー (派生色: Selection を暗くしたもの)
    borderLight: '#E5DFC9',  // 薄いボーダー (派生色)

    // ── セマンティックカラー ──
    primary:     '#3A94C5',  // プライマリ (Blue)
    primaryHover:'#2E7BA3',  // プライマリ:hover (Blue 暗め)
    accent:      '#35A77C',  // アクセント (Cyan / Cursor)

    error:       '#F85552',  // エラー (Red)
    warning:     '#DFA000',  // 警告 (Yellow)
    success:     '#8DA101',  // 成功 (Green)
    info:        '#3A94C5',  // 情報 (Blue)

    // ── クリップタイプカラー ──
    clipVideo:       '#3A94C5',  // video クリップ (Blue)
    clipVideoSelect: '#2E7BA3',  // video 選択時
    clipAudio:       '#8DA101',  // audio クリップ (Green)
    clipAudioSelect: '#738501',  // audio 選択時
    clipText:        '#DF69BA',  // text クリップ (Magenta)
    clipTextSelect:  '#C050A0',  // text 選択時

    // ── UI 部品 ──
    tabActive:       '#FDF6E3',  // アクティブタブ背景
    tabInactive:     '#F4F0D9',  // 非アクティブタブ背景
    tabIndicator:    '#3A94C5',  // タブ下線 (Blue)
    tabText:         '#5C6A72',  // タブテキスト
    tabTextInactive: '#939F91',  // 非アクティブタブテキスト

    button:          '#3A94C5',  // ボタン背景
    buttonText:      '#FFFFFF',  // ボタンテキスト
    buttonHover:     '#2E7BA3',  // ボタン:hover
    buttonDanger:    '#F85552',  // 危険ボタン
    buttonDangerHover:'#D94440', // 危険ボタン:hover

    // ── タイムライン ──
    timelineBg:      '#F4F0D9',  // タイムライン背景
    timelineTrackBg: '#FDF6E3',  // トラック背景
    timelineRuler:   '#EFE9D5',  // ルーラー背景
    playhead:        '#F85552',  // プレイヘッド (Red)
    seekBar:         '#35A77C',  // シークバー (Cyan)

    // ── その他 ──
    shadow:    'rgba(92, 106, 114, 0.12)',  // ドロップシャドウ
    overlay:   'rgba(92, 106, 114, 0.5)',   // モーダルオーバーレイ
  } as const;
  ```

**B. 型エクスポート**
- [ ] `export type Theme = typeof theme;` を追加
- [ ] 必要に応じてカラーキーのユニオン型も提供

### 61: グローバル CSS・ページコンポーネントの色彩更新

グローバルスタイルとページレベルのコンポーネントを Everforest Light テーマに変更する。

**A. index.css の更新** (`app/frontend/src/index.css`)
- [ ] `body` の `background` を `#FDF6E3` に変更
- [ ] `body` の `color` を `#5C6A72` に変更
- [ ] `::selection` に `background: #EFE9D5` を追加
- [ ] スクロールバーのスタイルをライトテーマに合わせる

**B. HomePage の更新** (`app/frontend/src/pages/HomePage.tsx`)
- [ ] 背景色: `#111` → `theme.bg`
- [ ] テキスト色: `#eee` / `#ccc` → `theme.text`
- [ ] ボタン色: ダーク系 → `theme.button` / `theme.buttonText`
- [ ] カードのスタイル: `ProjectCard.tsx` のダーク背景 → `theme.bgPanel`, ボーダー `theme.border`

**C. ProjectCard の更新** (`app/frontend/src/components/ProjectCard.tsx`)
- [ ] カード背景: ダーク系 → `theme.bgPanel`
- [ ] テキスト色 → `theme.text` / `theme.textMuted`
- [ ] ホバー → `theme.bgHover`
- [ ] ボーダー → `theme.border`

**D. CreateProjectDialog の更新** (`app/frontend/src/components/CreateProjectDialog.tsx`)
- [ ] モーダル背景 → `theme.overlay`
- [ ] ダイアログ背景 → `theme.bg`
- [ ] 入力フィールド: ダーク背景 → `theme.bgPanel`, ボーダー `theme.border`
- [ ] ボタン → `theme.button` / `theme.buttonText`

**E. JobLogPage の更新** (`app/frontend/src/pages/JobLogPage.tsx`)
- [ ] 背景・テキスト → `theme.bg` / `theme.text`
- [ ] テーブル/リストのスタイル → `theme.bgPanel`, `theme.border`

**F. JobProgress の更新** (`app/frontend/src/components/JobProgress.tsx`)
- [ ] プログレスバーの背景 → `theme.bgHover`
- [ ] プログレスバーの前景 → `theme.primary`

### 62: エディタ UI コンポーネントの色彩更新

エディタ画面のパネル・ダイアログ系コンポーネントの色彩を更新する。

**A. EditorLayout の更新** (`app/frontend/src/components/EditorLayout.tsx`)
- [ ] ツールバー背景: `#1e1e1e` → `theme.bgPanel`
- [ ] プレビュー領域背景: `#111` → `theme.bg`
- [ ] メインペイン背景: `#1a1a1a` → `theme.bgPanel`
- [ ] ボーダー: `#333` → `theme.border`

**B. EditorMainPanel の更新** (`app/frontend/src/components/EditorMainPanel.tsx`)
- [ ] タブバー背景: `#1a1a1a` → `theme.bgPanel`
- [ ] タブ下線: `#333` → `theme.border`
- [ ] アクティブタブ: 背景 `#2a2a2a` → `theme.tabActive`, 下線 `#5b8def` → `theme.tabIndicator`, テキスト `#eee` → `theme.tabText`
- [ ] 非アクティブタブ: テキスト `#888` → `theme.tabTextInactive`
- [ ] ホバー: テキスト `#ccc` → `theme.text`
- [ ] インジケータ (青い丸): `#5b8def` → `theme.tabIndicator`

**C. PreviewPlayer の更新** (`app/frontend/src/components/PreviewPlayer.tsx`)
- [ ] コントロールバー背景: ダーク系 → `theme.bgPanel`
- [ ] ボタン色 → `theme.text` / `theme.textMuted`
- [ ] テキストオーバーレイのデフォルト色の確認 (ユーザー指定色は変更しない)

**D. InspectorPanel の更新** (`app/frontend/src/components/InspectorPanel.tsx`)
- [ ] パネル背景 → `theme.bg`
- [ ] ラベル色: `#888` / `#aaa` → `theme.textMuted`
- [ ] 入力フィールド: ダーク背景 → `theme.bgPanel`, ボーダー `theme.border`, テキスト `theme.text`
- [ ] セクション区切り: `#333` → `theme.border`
- [ ] 削除ボタン: 既存の赤系 → `theme.buttonDanger`

**E. AssetPanel の更新** (`app/frontend/src/components/AssetPanel.tsx`)
- [ ] パネル背景 → `theme.bg`
- [ ] アセット一覧の各行: ダーク系 → `theme.bgPanel`, ホバー → `theme.bgHover`
- [ ] 「+ Import」ボタン → `theme.button` / `theme.buttonText`
- [ ] テキスト → `theme.text` / `theme.textMuted`

**F. AssetThumbnail の更新** (`app/frontend/src/components/AssetThumbnail.tsx`)
- [ ] サムネイル背景 → `theme.bgPanel`
- [ ] ボーダー・枠線 → `theme.border`
- [ ] 「+」ボタン → `theme.accent`

**G. ProjectSettingsPanel の更新** (`app/frontend/src/components/ProjectSettingsPanel.tsx`)
- [ ] 背景・入力フィールド → ライトテーマ化
- [ ] ラベル色 → `theme.textMuted`

**H. ExportDialog の更新** (`app/frontend/src/components/ExportDialog.tsx`)
- [ ] モーダルオーバーレイ → `theme.overlay`
- [ ] ダイアログ背景 → `theme.bg`
- [ ] ボタン → `theme.button`, `theme.buttonDanger`

**I. SaveIndicator の更新** (`app/frontend/src/components/SaveIndicator.tsx`)
- [ ] ステータス色のマッピング更新:
  - `saved`: `#4a4` → `theme.success`
  - `saving`: `#fa0` → `theme.warning`
  - `error`: `#f44` → `theme.error`
- [ ] Undo/Redo ボタン → `theme.bgHover` / `theme.text`

**J. ContextMenu の更新** (`app/frontend/src/components/ContextMenu.tsx`)
- [ ] メニュー背景: ダーク系 → `theme.bg`
- [ ] メニュー項目ホバー → `theme.bgHover`
- [ ] テキスト → `theme.text`
- [ ] ボーダー → `theme.border`
- [ ] シャドウ → `theme.shadow`

### 63: タイムライン・クリップコンポーネントの色彩更新

タイムライン関連コンポーネントの色彩を Everforest Light テーマに統一する。

**A. Timeline の更新** (`app/frontend/src/components/Timeline.tsx`)
- [ ] タイムライン背景: `#1a1a1a` → `theme.timelineBg`
- [ ] トラックヘッダー → `theme.bgPanel`
- [ ] ボーダー・区切り線: `#333` → `theme.border`
- [ ] テキスト (トラックラベル) → `theme.text`
- [ ] 終端マーカー (赤い破線) → `theme.error`

**B. TimelineTrack の更新** (`app/frontend/src/components/TimelineTrack.tsx`)
- [ ] トラック背景: ダーク系 → `theme.timelineTrackBg`
- [ ] 交互行色 (あれば) → `theme.bgPanel` / `theme.bg`

**C. TimelineClip の更新** (`app/frontend/src/components/TimelineClip.tsx`)
- [ ] video クリップ: `#3a6ad4` → `theme.clipVideo`, 選択時 `#2a4a9a` → `theme.clipVideoSelect`
- [ ] audio クリップ: `#27ae60` / `#1e8449` → `theme.clipAudio` / `theme.clipAudioSelect`
- [ ] text クリップ: `#9b59b6` / `#8e44ad` → `theme.clipText` / `theme.clipTextSelect`
- [ ] クリップ内テキスト → `#FFFFFF` (ライトテーマでもクリップ上のテキストは白を維持して可読性を確保)
- [ ] トリムハンドル → ライトテーマ適応

**D. TimelineRuler の更新** (`app/frontend/src/components/TimelineRuler.tsx`)
- [ ] ルーラー背景 → `theme.timelineRuler`
- [ ] 目盛り線 → `theme.textMuted`
- [ ] 時間ラベル → `theme.text`

**E. Playhead の更新** (`app/frontend/src/components/Playhead.tsx`)
- [ ] プレイヘッド色: 既存の赤系 → `theme.playhead` (`#F85552`)

**F. EditorPage のインライン色** (`app/frontend/src/pages/EditorPage.tsx`)
- [ ] エディタ画面内のインラインスタイル色をすべて `theme.*` に置換

---

### 64: プレビュー "No clip at playhead" 表示の全幅化

**背景**: プレビュー領域にクリップがない場合、"No clip at playhead" テキストが小さく中央に表示されるが、プレビュー領域の横幅をフルに使えていない。PreviewPlayer コンポーネントに `width: 100%` が設定されておらず、親の EditorLayout が `alignItems: center` で中央寄せしているため横幅が縮んでいる。

**対象ファイル**:
- `app/frontend/src/components/PreviewPlayer.tsx`

**サブタスク**:
- [x] PreviewPlayer のルートコンテナに `width: "100%"` を追加し、プレビュー領域全体を横幅いっぱいに使えるようにする
- [x] "No clip at playhead" 表示時もプレビュー黒背景が全幅に表示されることを確認

---

### 65: エディタ画面からホームへの導線追加

**背景**: 現在エディタ画面にはホーム画面 (`/`) へ戻る UI がなく、ブラウザの戻るボタンに頼る必要がある。ツールバー領域にホームへ戻るリンクを追加する。

**対象ファイル**:
- `app/frontend/src/pages/EditorPage.tsx` — ツールバーにホームリンクを追加
- `app/frontend/src/components/EditorLayout.tsx` — ツールバー左側にスペースを確保（必要に応じて）

**サブタスク**:
- [x] EditorLayout のツールバー行を左右に分割し、左端にホームリンク用スペースを確保する
- [x] EditorPage の toolbar prop にホームリンク (`react-router-dom` の `Link` で `/` へ遷移) を追加する
- [x] リンクのスタイルを Everforest Light テーマに合わせる（`theme.text` / `theme.textMuted` を使用）
- [x] ホームリンクのテキストは「← Home」等シンプルなものにする

## Phase 18 Tasks — プレビュー操作改善 + Export タブ再設計

### 現状の課題

1. **⏮ ボタンが自動再生する**: プレビュー UI の ⏮ ボタン（先頭から再生）は、クリップ選択解除 → 先頭シーク → 再生開始 の 3 アクションを一括実行する。しかし「先頭に戻る」操作と「再生する」操作は別の意図であり、⏮ は先頭フレームへのシークのみ行い、再生は開始しないのが自然。
2. **Export タブに View Jobs がある不自然さ**: View Jobs はエクスポート履歴を別ページで閲覧する機能であり、エクスポート操作を行う Export タブ内に置くのは導線として不自然。
3. **Export タブがモーダル起動のみ**: Export タブの中身が「Start Export」ボタン（モーダル起動）と「View Jobs」リンクだけ。タブ内に直接エクスポート操作（ファイル名入力・実行・進捗表示）を配置すれば、モーダルを開く手間がなくなり操作が直感的になる。

### 66: ⏮ ボタンの動作変更: 先頭シークのみ（再生開始しない）

現状: `PreviewPlayer.tsx` の ⏮ ボタンは `onTimeUpdate(0)` で先頭にシーク後、`setTimeout(() => onPlayPause(), 0)` で自動再生を開始する。

目標: ⏮ ボタンは先頭フレーム (0ms) にシークするのみで、再生は開始しない。再生中に押した場合は再生を停止してから先頭にシークする。

**A. ⏮ ボタンの onClick ハンドラー変更** (`app/frontend/src/components/PreviewPlayer.tsx`)
- [x] 現在のハンドラー:
  ```tsx
  onClick={() => {
    if (isPlaying) {
      onPlayPause(); // stop first
    }
    onSelectClip(null);
    onTimeUpdate(0);
    setTimeout(() => onPlayPause(), 0); // ← 自動再生
  }}
  ```
- [x] 変更後:
  ```tsx
  onClick={() => {
    if (isPlaying) {
      onPlayPause(); // 再生中なら停止
    }
    onSelectClip(null); // クリップ選択解除（全体再生モード）
    onTimeUpdate(0);    // 先頭にシーク
    // 再生は開始しない
  }}
  ```
- [x] `setTimeout(() => onPlayPause(), 0)` の行を削除

**B. ボタンの title 属性変更** (`app/frontend/src/components/PreviewPlayer.tsx`)
- [x] `title="Play from start"` → `title="Go to start"` に変更（動作に合わせた説明）

### 67: Export タブ再設計: インライン操作化 + View Jobs 移動

現状: Export タブには「Start Export」ボタン（ExportDialog モーダルを開く）と「View Jobs」リンクがある。エクスポート操作はモーダル内で行われる。

目標:
- Export タブ内に直接エクスポート操作 UI（ファイル名入力・実行ボタン・進捗表示）を配置する
- ExportDialog モーダルを廃止する
- View Jobs リンクを Export タブから除去し、Settings タブ内に移動する

**A. Export タブのインラインコンテンツ作成** (`app/frontend/src/pages/EditorPage.tsx`)
- [x] `exportContent` の中身を変更: 現在の「Start Export」ボタン + 「View Jobs」リンクを削除
- [x] ExportDialog の主要 UI をタブ内に直接配置:
  - ファイル名入力フィールド (`export-{timestamp}.mp4` をデフォルト値)
  - 「Start Export」ボタン（直接エクスポートを実行）
  - エクスポート進捗表示 (`JobProgress` コンポーネント)
  - 完了/失敗メッセージ
- [x] 状態管理を EditorPage に移動:
  - `filename` state: エクスポートファイル名
  - `activeJobId` state: 実行中のジョブ ID
  - `exportedFilenameRef` / `downloadedRef`: 自動ダウンロード用 ref
  - `useExport` / `useJob` hooks を EditorPage で直接使用
- [x] 自動ダウンロード処理 (`useEffect` でジョブ完了を監視 → `<a>` タグ経由でダウンロード) を EditorPage に移動

**B. ExportDialog モーダルの廃止**
- [x] `showExport` state を削除 (`EditorPage.tsx`)
- [x] `ExportDialog` コンポーネントの `import` とレンダリングを削除 (`EditorPage.tsx`)
- [x] `app/frontend/src/components/ExportDialog.tsx` ファイルを削除

**C. View Jobs リンクを Settings タブに移動** (`app/frontend/src/pages/EditorPage.tsx`, `app/frontend/src/components/ProjectSettingsPanel.tsx`)
- [x] Export タブから `View Jobs` リンクを削除
- [x] `ProjectSettingsPanel` の末尾に「View Jobs」リンクを追加:
  - `Link to={/projects/${project.id}/jobs}` (既存のルーティングをそのまま利用)
  - セクション区切り線の下に配置し、設定項目と視覚的に分離する
  - スタイル: `theme.bgDark` 背景、`theme.text` テキスト（現状と同じ）
- [x] `ProjectSettingsPanel` の props に `projectId: string` を追加（Link のパス生成に必要）

**D. Export タブ内の UI スタイル調整** (`app/frontend/src/pages/EditorPage.tsx`)
- [x] ファイル名入力: `theme.bgPanel` 背景、`theme.border` ボーダー、`theme.text` テキスト
- [x] Start Export ボタン: `theme.button` 背景、`theme.buttonText` テキスト、エクスポート中は `theme.bgDark` に変更
- [x] 進捗表示: `JobProgress` をそのまま使用
- [x] 完了メッセージ: `theme.success` テキスト
- [x] 失敗メッセージ: `theme.error` テキスト
- [x] 各要素間のマージンを適切に設定（モーダル内と同等の 12px 間隔）

### 68: textDisabled ラベルの視認性改善（全 UI）

現状: 複数のコンポーネントでフィールドラベルや補助テキストに `theme.textDisabled`（`#A9B3A5`）が使われており、ベージュ背景（`#FDF6E3` / `#F4F0D9`）に対してコントラストが不十分で視認性が悪い。

`theme.textDisabled` の全使用箇所（6 ファイル・17 箇所）を精査し、「無効状態の表現」として意図的に使用している箇所は維持、「読ませるべきラベル・テキスト」には `theme.textMuted`（`#939F91`）への変更とフォントサイズの引き上げを行う。

目標:
- フィールドラベル・補助テキストの色を `theme.textMuted` に変更してコントラスト比を改善する
- `fontSize: "10px"` のラベルは `"11px"` に引き上げて可読性を向上させる
- 無効状態（disabled ボタン・メニュー項目）の `textDisabled` 使用は変更しない

**A. InspectorPanel のフィールドラベル** (`app/frontend/src/components/InspectorPanel.tsx`)
- [x] `StartEndEditor` 内の "Start (s)" ラベル (L570): `color: theme.textDisabled` → `color: theme.textMuted`、`fontSize: "10px"` → `fontSize: "11px"`
- [x] `StartEndEditor` 内の "End (s)" ラベル (L583): 同上
- [x] `TrimEditor` 内の "In (s)" ラベル (L221): 同上
- [x] `TrimEditor` 内の "Out (s)" ラベル (L236): 同上
- [x] `TrimEditor` 内の "Duration (s)" ラベル (L250): 同上
- [x] `TransformEditor` 内の "X (px)", "Y (px)" ラベル (L419, L429): 同上
- [x] `TransformEditor` 内の Crop "X", "Y", "W", "H" ラベル (L476, L487, L498, L509): 同上

**B. ProjectSettingsPanel のヘルプテキスト** (`app/frontend/src/components/ProjectSettingsPanel.tsx`)
- [x] L61: "Min: 1s / Max: 3600s (1 hour)" テキスト — `color: theme.textDisabled` → `color: theme.textMuted`、`fontSize: "10px"` → `fontSize: "11px"`

**C. PreviewPlayer のプレースホルダテキスト** (`app/frontend/src/components/PreviewPlayer.tsx`)
- [x] L330: "No clip at playhead" — `color: theme.textDisabled` → `color: theme.textMuted`

**D. ProjectCard の日付表示** (`app/frontend/src/components/ProjectCard.tsx`)
- [x] L34: `<time>` 要素 — `color: theme.textDisabled` → `color: theme.textMuted`

**E. 変更しない箇所（無効状態の表現として意図的に使用）**
- SaveIndicator.tsx L50, L65: Undo/Redo ボタンの無効時テキスト色 — `canUndo ? theme.text : theme.textDisabled` → 変更不要
- ContextMenu.tsx L68: disabled メニュー項目のテキスト色 — `item.disabled ? theme.textDisabled : theme.text` → 変更不要

### 69: テーマシステム拡張: スペーシング・フォントサイズ・角丸の定数化

現状: `theme.ts` は色定数のみを定義しており、スペーシング・フォントサイズ・角丸はコンポーネントごとにバラバラな値がハードコードされている。

目標:
- `theme.ts` にスペーシングスケール、フォントサイズスケール、角丸スケールを追加し、UI 全体の統一基盤を作る

**A. スペーシングスケールの追加** (`app/frontend/src/theme.ts`)
- [x] `spacing` オブジェクトを追加:
  - `xs: 4` (px) — ラベル〜入力間、密なギャップ
  - `sm: 8` — セクション内マージン、パネルパディング
  - `md: 12` — セクション間マージン
  - `lg: 16` — ヘッダー・ダイアログ内パディング
  - `xl: 24` — ページレベルパディング

**B. フォントサイズスケールの追加** (`app/frontend/src/theme.ts`)
- [x] `fontSize` オブジェクトを追加:
  - `xs: "10px"` — メタ情報（タイムスタンプ等）
  - `sm: "11px"` — フィールドラベル、タイムラインクリップ
  - `md: "12px"` — 本文テキスト、入力フィールド、ボタン（小）
  - `lg: "13px"` — タブテキスト、ボタン（標準）
  - `xl: "14px"` — ボタン（大）
  - `heading3: "16px"` — セクション見出し
  - `heading2: "18px"` — ダイアログ見出し
  - `heading1: "20px"` — ページ見出し

**C. 角丸スケールの追加** (`app/frontend/src/theme.ts`)
- [x] `radius` オブジェクトを追加:
  - `xs: "2px"` — プログレスバー
  - `sm: "3px"` — 入力フィールド、小ボタン
  - `md: "4px"` — 標準ボタン、カード内要素
  - `lg: "6px"` — ダイアログボタン
  - `xl: "8px"` — カード、ダイアログ

### 70: ハードコード色のテーマ変数置換

現状: 複数のコンポーネントで `"#fff"`, `"#000"`, `rgba(...)` などの色がハードコードされており、テーマとの一貫性が損なわれている。

目標:
- すべてのハードコード色を `theme` 変数に置換する
- 必要に応じて `theme.ts` に新しい色定数を追加する

**A. theme.ts への色定数追加** (`app/frontend/src/theme.ts`)
- [x] `white: '#FFFFFF'` を追加（クリップラベル・ボタンテキスト等で使用）
- [x] `black: '#000000'` を追加（プレビュー背景等で使用）
- [x] `overlayLight: 'rgba(255,255,255,0.2)'` を追加（サムネイルボタン等）
- [x] `overlayDark: 'rgba(0,0,0,0.85)'` を追加（ツールチップ背景等）
- [x] `clipLabelText: '#FFFFFF'` を追加（クリップ上の白テキスト用）

**B. AssetThumbnail.tsx のハードコード色置換** (`app/frontend/src/components/AssetThumbnail.tsx`)
- [x] L120: `color: "#fff"` → `color: theme.clipLabelText`
- [x] L144: `background: "rgba(248,85,82,0.5)"` → `background: theme.errorOverlay`
- [x] L161, L175: `background: "rgba(255,255,255,0.2)"` → `background: theme.overlayLight`
- [x] L162, L176: `border: "1px solid rgba(255,255,255,0.5)"` → `theme.overlayLightBorder` 変数化

**C. TimelineClip.tsx のハードコード色置換** (`app/frontend/src/components/TimelineClip.tsx`)
- [x] L175: `color: "#fff"` → `color: theme.clipLabelText`
- [x] L200: `background: "rgba(0,0,0,0.85)"` → `background: theme.overlayDark`
- [x] L201: `color: "#fff"` → `color: theme.white`
- [x] L241: `background: "rgba(255,255,255,0.3)"` → `background: theme.overlayLightMed`
- [x] L243-244: `rgba(255,255,255,...)` → `theme.overlayLightBorder`, `theme.overlayLightSubtle` 変数化

**D. PreviewPlayer.tsx のハードコード色置換** (`app/frontend/src/components/PreviewPlayer.tsx`)
- [x] L315: `"#000"` → `theme.black`

**E. EditorPage.tsx のハードコード色置換** (`app/frontend/src/pages/EditorPage.tsx`)
- [x] L198-199: `color: "#ffffff"`, `backgroundColor: "#000000"` → `theme.white`, `theme.black`

### 71: ボタンスタイルの統一

現状: ボタンのスタイル（padding, fontSize, borderRadius）がコンポーネントごとに異なり、視覚的な一貫性がない。

目標:
- `theme.ts` にボタンスタイルのプリセットを定義し、全コンポーネントで統一する

**A. theme.ts にボタンスタイルプリセットを追加** (`app/frontend/src/theme.ts`)
- [x] `buttonStyle` オブジェクトを追加:
  - `primary`: `{ background: theme.button, color: theme.buttonText, border: "none", borderRadius: radius.md, padding: "6px 12px", fontSize: fontSize.md, cursor: "pointer" }`
  - `secondary`: `{ background: theme.bgDark, color: theme.text, border: "none", borderRadius: radius.md, padding: "6px 12px", fontSize: fontSize.md, cursor: "pointer" }`
  - `danger`: `{ background: theme.buttonDanger, color: theme.buttonText, ... }`
  - `small`: `{ padding: "2px 8px", fontSize: fontSize.sm }`（サイズバリアント）

**B. AssetPanel の Import ボタン統一** (`app/frontend/src/components/AssetPanel.tsx`)
- [x] L64-70: ボタンスタイルを `buttonStyle.primary` ベースに統一

**C. PreviewPlayer のトランスポートボタン統一** (`app/frontend/src/components/PreviewPlayer.tsx`)
- [x] L427, L461 等: トランスポートボタン（⏮, Play, etc.）のスタイルを `buttonStyle.secondary` ベースに統一
- [x] ホバー時の `background` を `theme.bgHover` に統一

**D. EditorPage の "+ Add Text" ボタン統一** (`app/frontend/src/pages/EditorPage.tsx`)
- [x] L202-211: `theme.clipText` 背景は意図的だが、padding/fontSize/borderRadius を `buttonStyle.primary` ベースに合わせる

**E. InspectorPanel のリセットボタン統一** (`app/frontend/src/components/InspectorPanel.tsx`)
- [x] L459, L526 等: `buttonStyle.small` + `secondary` ベースに統一

**F. CreateProjectDialog のボタン統一** (`app/frontend/src/components/CreateProjectDialog.tsx`)
- [x] L85-92: `buttonStyle.primary` ベースに統一（borderRadius を `radius.md` に）

### 72: 入力フィールド・見出し・ラベルスタイルの統一

現状: 入力フィールドの padding、見出しの h タグレベル・マージン、セクションラベルのスタイルがコンポーネント間で不統一。

目標:
- 共通の入力スタイル・見出しスタイルを `theme.ts` に定義し、全コンポーネントで適用する

**A. theme.ts に共通スタイルを追加** (`app/frontend/src/theme.ts`)
- [x] `inputStyle` オブジェクトを追加:
  - `{ background: theme.bgPanel, color: theme.text, border: "1px solid " + theme.border, borderRadius: radius.sm, padding: "4px 6px", fontSize: fontSize.md, boxSizing: "border-box" }`
- [x] `sectionHeadingStyle` を追加:
  - `{ fontSize: fontSize.heading3, fontWeight: 600, margin: "0 0 8px" }`

**B. InspectorPanel の inputStyle を theme から参照** (`app/frontend/src/components/InspectorPanel.tsx`)
- [x] L126-135: ローカル `inputStyle` を削除し、theme からの `inputStyle` を import

**C. CreateProjectDialog の入力フィールド統一** (`app/frontend/src/components/CreateProjectDialog.tsx`)
- [x] L55: `padding: "10px 12px"` → theme の `inputStyle` に合わせる（ダイアログ用に padding のみオーバーライド）

**D. EditorPage の Export ファイル名入力統一** (`app/frontend/src/pages/EditorPage.tsx`)
- [x] L229: `padding: "6px 8px"` → theme の `inputStyle` に合わせる

**E. ProjectSettingsPanel の入力フィールド統一** (`app/frontend/src/components/ProjectSettingsPanel.tsx`)
- [x] L38: ローカル `inputStyle` を削除し、theme からの `inputStyle` を import

**F. 見出しタグの統一**
- [x] `InspectorPanel.tsx` L55: `<h4>` → `<h3>` に変更し `sectionHeadingStyle` を適用
- [x] `AssetPanel.tsx` L59: `<h3>` の margin を `sectionHeadingStyle` に合わせる
- [x] `ProjectSettingsPanel.tsx` L45: `<h4>` → `<h3>` に変更、`sectionHeadingStyle` を適用

### 73: Storybook 導入 + 全コンポーネントの Story 定義

現状: フロントエンドに Storybook が未導入で、コンポーネントの視覚的なカタログやインタラクティブなドキュメントがない。

目標:
- Storybook 8 を導入し、全 17 コンポーネント + 3 ページの Story を定義する
- 各 Story で主要なバリエーション（props の組み合わせ）をカバーする

**A. Storybook のインストールと設定** (`app/frontend/`)
- [x] `bun add -D @storybook/react-vite @storybook/react @storybook/addon-essentials @storybook/blocks storybook` を実行
- [x] `app/frontend/.storybook/main.ts` を作成:
  - `framework: "@storybook/react-vite"`
  - `stories: ["../src/**/*.stories.@(ts|tsx)"]`
  - `addons: ["@storybook/addon-essentials"]`
- [x] `app/frontend/.storybook/preview.ts` を作成:
  - グローバル CSS (`../src/index.css`) の import
  - デコレーターでテーマ背景色（`theme.bg`）を適用
- [x] `package.json` に `"storybook": "storybook dev -p 6006"`, `"build-storybook": "storybook build"` スクリプトを追加
- [x] `bun run storybook` で起動確認

**B. テーマ定義の確認 Story** (`app/frontend/src/stories/`)
- [x] `Theme.stories.tsx` — テーマ全体を視覚的に確認するための Story:
  - **Colors**: ベースカラー（bg, bgPanel, bgHover, bgDark）、テキストカラー（text, textMuted, textDisabled）、セマンティックカラー（primary, accent, error, warning, success, info）、クリップタイプカラー（clipVideo, clipAudio, clipText + 選択時）、UI 部品カラー（tab, button, timeline 等）をスウォッチで一覧表示
  - **Typography**: fontSize スケール（xs〜heading1）の実サイズ比較、各テキストカラーとの組み合わせ表示
  - **Spacing**: spacing スケール（xs〜xl）のボックス視覚化
  - **Border Radius**: radius スケール（xs〜xl）の適用サンプル
  - **Buttons**: buttonStyle プリセット（primary, secondary, danger, small）の実レンダリング
  - **Inputs**: inputStyle の実レンダリング、各状態（通常・フォーカス・無効）
  - **Shadows & Overlays**: shadow, overlay, overlayLight, overlayDark の視覚サンプル

**C. ページコンポーネントの Story** (`app/frontend/src/pages/`)
- [x] `HomePage.stories.tsx` — プロジェクト一覧表示（0件・複数件）、新規作成ダイアログ表示
- [x] `EditorPage.stories.tsx` — クリップ未選択・選択時、各タブ表示
- [x] `JobLogPage.stories.tsx` — ジョブ一覧表示（空・進行中・完了・失敗）

**D. エディタ系コンポーネントの Story** (`app/frontend/src/components/`)
- [x] `EditorLayout.stories.tsx` — 3 カラムレイアウトのモック
- [x] `EditorMainPanel.stories.tsx` — タブ切り替え
- [x] `InspectorPanel.stories.tsx` — video/audio/text クリップ別の表示
- [x] `AssetPanel.stories.tsx` — アセットなし・あり、インポート中
- [x] `AssetThumbnail.stories.tsx` — 各状態（ready, importing, failed）
- [x] `ProjectSettingsPanel.stories.tsx` — 設定表示
- [x] `SaveIndicator.stories.tsx` — 保存中・完了・Undo/Redo 状態

**E. タイムライン系コンポーネントの Story** (`app/frontend/src/components/`)
- [x] `Timeline.stories.tsx` — 空タイムライン・クリップあり・ズーム状態
- [x] `TimelineTrack.stories.tsx` — トラック表示
- [x] `TimelineClip.stories.tsx` — video/audio/text・選択状態・トリム中
- [x] `TimelineRuler.stories.tsx` — ルーラー表示
- [x] `Playhead.stories.tsx` — プレイヘッド位置バリエーション

**F. プレビュー・その他コンポーネントの Story** (`app/frontend/src/components/`)
- [x] `PreviewPlayer.stories.tsx` — 再生中・停止・テキストオーバーレイ
- [x] `ContextMenu.stories.tsx` — 表示・非表示
- [x] `CreateProjectDialog.stories.tsx` — ダイアログ表示
- [x] `ProjectCard.stories.tsx` — カード表示バリエーション
- [x] `JobProgress.stories.tsx` — 各進捗状態（pending, processing, completed, failed）

### 74: Vitest ブラウザテスト導入 + 全 Story のテスト整備

現状: フロントエンドテストは `bun:test` によるユニットテスト（sequence-ops, timeline-utils, undo-redo）のみ。コンポーネントの描画テストやインタラクションテストがない。

目標:
- Vitest のブラウザモードを導入し、Storybook の各 Story に対応するテストを整備する
- `@storybook/experimental-addon-test` を活用し、Story ベースのコンポーネントテストを実現する

**A. Vitest + Storybook テストのインストールと設定** (`app/frontend/`)
- [x] `bun add -D vitest @vitest/browser playwright @storybook/experimental-addon-test @storybook/test` を実行
- [x] `app/frontend/vitest.config.ts` を作成:
  - `plugins: [storybookTest()]` を設定
  - `browser: { enabled: true, provider: "playwright", instances: [{ browser: "chromium" }] }` を設定
  - `setupFiles: [".storybook/vitest.setup.ts"]` を設定
- [x] `app/frontend/.storybook/vitest.setup.ts` を作成:
  - `@storybook/experimental-addon-test/vitest-plugin` からの `setProjectAnnotations` を呼び出し
- [x] `.storybook/main.ts` の `addons` に `"@storybook/experimental-addon-test"` を追加
- [x] `package.json` に `"test:browser": "vitest --project=storybook"` スクリプトを追加

**B. ページコンポーネントのテスト** (`app/frontend/src/pages/`)
- [x] `HomePage.test.tsx` — プロジェクト一覧の描画、新規作成ボタンクリック
- [x] `EditorPage.test.tsx` — タブ切り替え、クリップ選択でインスペクタ表示
- [x] `JobLogPage.test.tsx` — ジョブ一覧の描画

**C. エディタ系コンポーネントのテスト** (`app/frontend/src/components/`)
- [x] `InspectorPanel.test.tsx` — 各クリップタイプの表示、トリム値入力、回転ボタン
- [x] `AssetPanel.test.tsx` — アセット表示、Import ボタン
- [x] `AssetThumbnail.test.tsx` — 各状態の描画、+ ボタンクリック
- [x] `ProjectSettingsPanel.test.tsx` — Duration 入力、View Jobs リンク
- [x] `SaveIndicator.test.tsx` — Undo/Redo ボタンの活性・非活性

**D. タイムライン系コンポーネントのテスト** (`app/frontend/src/components/`)
- [x] `Timeline.test.tsx` — ズームイン・アウト、タイムライン描画
- [x] `TimelineClip.test.tsx` — クリップ表示、選択、右クリックメニュー
- [x] `TimelineRuler.test.tsx` — ルーラー目盛りの描画
- [x] `Playhead.test.tsx` — プレイヘッド位置の描画

**E. その他コンポーネントのテスト** (`app/frontend/src/components/`)
- [x] `PreviewPlayer.test.tsx` — 再生ボタン、時間表示
- [x] `ContextMenu.test.tsx` — メニュー表示・項目クリック
- [x] `CreateProjectDialog.test.tsx` — ダイアログ表示、入力、送信
- [x] `ProjectCard.test.tsx` — カード表示、リンク先
- [x] `JobProgress.test.tsx` — 各状態の描画（プログレスバー表示）

### 75: テーマフォントサイズの一段階拡大

**背景:** Theme Overview の Typography セクションで、全体的にフォントサイズが小さいため一回り大きくしたい。

**対象ファイル:** `app/frontend/src/theme.ts` (L78-88 `fontSize` 定数)

**変更内容:**
- [x] `xs`: 10px → 11px
- [x] `sm`: 11px → 12px
- [x] `md`: 12px → 13px
- [x] `lg`: 13px → 14px
- [x] `xl`: 14px → 16px
- [x] `heading3`: 16px → 18px
- [x] `heading2`: 18px → 20px
- [x] `heading1`: 20px → 22px

**確認方法:** Storybook Theme Overview (`theme--overview`) で Typography セクションの表示を確認

### 76: InspectorPanel セクションラベルの視認性改善

**背景:** InspectorPanel の「File」「Type」「Rotation」「Position」「Scale」「Crop」「Trim」等のラベルが `theme.textMuted`（#939F91）で表示されており、ライト背景（#FDF6E3）に対してコントラストが不十分で視認性が悪い。

**対象ファイル:** `app/frontend/src/components/InspectorPanel.tsx`

**問題箇所:** セクション見出し `<label>` と情報テーブル `<td>` で `theme.textMuted` を使用
- L204: Trim ラベル
- L271: Text ラベル
- L388: Rotation ラベル
- L403: Position ラベル
- L429: Scale ラベル
- L451: Crop ラベル
- L536: Position ラベル (StartEndEditor)
- L570: Row コンポーネント (File, Type, Size, Codec)

**修正方針:** これらのラベルの色を `theme.textMuted`（#939F91）→ `theme.text`（#5C6A72）に変更する。`theme.text` は本文テキスト色であり、背景色との十分なコントラストがある。

**確認方法:** Storybook InspectorPanel (`components-inspectorpanel--video-clip`) でラベルの視認性を確認

### 77: 共有型に canvasWidth / canvasHeight を追加

**背景:** 動画全体の画面サイズ（キャンバスサイズ）を設定可能にする。キャンバスより大きい素材は自動でクロップされ、小さい素材は黒背景にセンタリング表示される。まず共有型定義とデフォルト定数を追加する。

**対象ファイル:**
- `app/shared/src/types/project.ts`
- `app/shared/src/utils/constants.ts`
- `app/backend/src/services/project-service.ts`

**変更内容:**
- [x] `ProjectSettings` に `canvasWidth: number` と `canvasHeight: number` を追加
- [x] `constants.ts` に `DEFAULT_CANVAS_WIDTH = 1920` と `DEFAULT_CANVAS_HEIGHT = 1080` を追加
- [x] `project-service.ts` の新規プロジェクト作成時に `canvasWidth` / `canvasHeight` のデフォルト値を設定
- ~~既存プロジェクトの後方互換性~~ → 既存プロジェクトを削除して対応

**確認方法:** TypeScript コンパイルが通ること、既存テストが Pass すること

### 78: Settings タブにキャンバスサイズ設定 UI を追加

**背景:** ユーザーがキャンバスサイズを Settings タブから変更できるようにする。

**対象ファイル:**
- `app/frontend/src/components/ProjectSettingsPanel.tsx`
- `app/frontend/src/components/ProjectSettingsPanel.stories.tsx`

**変更内容:**
- [x] ProjectSettingsPanel に「Canvas Size」セクションを追加
- [x] 幅 (Width) と高さ (Height) の数値入力フィールド（最小: 320、最大: 3840）
- [x] よく使うプリセットの選択ボタン: 1920×1080 (16:9)、1280×720 (16:9)、1080×1920 (9:16 縦動画)、1080×1080 (1:1 正方形)
- [x] 入力値のバリデーション（偶数制約: FFmpeg の要件により幅・高さは偶数が必要）
- [x] onUpdateSettings コールバック経由で canvasWidth / canvasHeight を親に通知
- [x] Storybook の Story を更新

**確認方法:** Storybook ProjectSettingsPanel でキャンバスサイズ入力・プリセット選択が機能すること

### 79: プレビュープレーヤーのキャンバスサイズ対応

**背景:** プレビュー表示をキャンバスサイズに基づく固定アスペクト比で行い、素材がキャンバスからはみ出す場合はクロップ、小さい場合は黒背景にセンタリングする。

**対象ファイル:**
- `app/frontend/src/components/PreviewPlayer.tsx`
- `app/frontend/src/components/PreviewPlayer.stories.tsx`

**変更内容:**
- [x] プレビュー表示領域をキャンバスのアスペクト比（canvasWidth:canvasHeight）で固定
  - 親コンテナ内で letterbox/pillarbox 表示（黒帯で余白を埋める）
- [x] 素材の表示サイズをキャンバスサイズとの比率で計算
  - `displayWidth = (assetWidth / canvasWidth) * containerWidth`
  - `displayHeight = (assetHeight / canvasHeight) * containerHeight`
- [x] 素材がキャンバスより大きい場合: `overflow: hidden` ではみ出し部分を非表示（自動クロップ効果）
- [x] 素材がキャンバスより小さい場合: 黒背景にセンタリング表示
- [x] クリップの transform (position/scale) をキャンバス座標系で適用
- [x] Storybook の Story を更新（異なるキャンバスサイズでの表示確認用バリエーション追加）

**確認方法:** プレビューで以下を確認
- 1920×1080 キャンバスに 4K 素材 → 画面内に収まり、はみ出し部分がクロップ
- 1920×1080 キャンバスに 640×480 素材 → 黒背景の中央に小さく表示
- 1080×1080 正方形キャンバスでの表示

### 80: エクスポートのキャンバスサイズ対応

**背景:** エクスポート時の FFmpeg フィルタチェーンでキャンバスサイズを使用し、プレビューと同じ見た目の動画を出力する。

**対象ファイル:**
- `app/backend/src/services/export-service.ts`

**変更内容:**
- [x] `buildExportArgs` でキャンバスサイズ（`project.settings.canvasWidth` / `canvasHeight`）をエクスポート解像度として使用
  - `exportPreset` が未指定の場合、キャンバスサイズをそのまま出力解像度にする
  - `exportPreset` が指定されている場合、`exportPreset` の width/height を優先（キャンバスサイズと異なる解像度でのエクスポートも可能）
- [x] 素材がキャンバスより大きい場合の FFmpeg フィルタ:
  - `pad+crop` 方式: `pad=w='max(iw,W)':h='max(ih,H)'` で最低キャンバスサイズまで拡張後、`crop=W:H` で中央クロップ
- [x] 素材がキャンバスより小さい場合の FFmpeg フィルタ:
  - `pad` で黒背景を追加しキャンバスサイズに拡張（中央配置）— pad+crop で自動対応
- [x] `buildTransformFilter` は既にキャンバスサイズ（preset）を参照しているため変更不要

**確認方法:** 以下のケースでエクスポートが正しく動作すること
- 大きい素材 → キャンバスサイズで中央クロップされた動画が出力
- 小さい素材 → 黒背景にセンタリングされた動画が出力
- transform (position/scale) 適用時の正しい表示

### 81: キャンバスサイズ機能のテスト・Story 更新

**背景:** キャンバスサイズ機能の追加に伴い、テストデータとストーリーを更新する。

**対象ファイル:**
- `app/frontend/src/stories/fixtures.ts`
- `app/frontend/src/components/ProjectSettingsPanel.stories.tsx`
- `app/frontend/src/components/PreviewPlayer.stories.tsx`
- `app/frontend/src/components/EditorLayout.stories.tsx`
- `app/frontend/src/pages/EditorPage.stories.tsx`
- `app/backend/src/services/__tests__/` (export-service テスト)

**変更内容:**
- [x] `fixtures.ts` のモックプロジェクトデータに `canvasWidth` / `canvasHeight` を追加
- [x] ProjectSettingsPanel Story にキャンバスサイズプリセット選択のインタラクションテスト追加
- [x] PreviewPlayer Story にキャンバスサイズバリエーション追加（16:9、9:16、1:1）
- [x] EditorPage / EditorLayout Story のモックデータ更新
- [x] export-service テストにキャンバスサイズ考慮のケース追加（大きい素材、小さい素材）

**確認方法:** `bun run test` と `bun run storybook` で全テスト・Story が正常動作すること

### 82: エクスポートへの clip.crop 反映

**背景:** クリップに crop（x, y, width, height）を設定するとプレビューでは CSS `clipPath: inset()` により正しく切り抜きが表示されるが、エクスポートした動画には crop が反映されない。`buildExportArgs()` が `clip.crop` フィールドを読み取っていないことが原因。

**問題の詳細:**
- プレビュー（`PreviewPlayer.tsx:474-483` `cropContainerStyle`）は `clip.crop` を CSS `clipPath` で適用
- エクスポート（`export-service.ts:126-131`）のフィルタチェーンは `trim → pad → crop(center)` で、ユーザー crop を無視
- `clip.crop` は `ClipCrop` 型（x, y, width, height）として共有型に定義済み

**対象ファイル:**
- `app/backend/src/services/export-service.ts`

**変更内容:**
- [x] `buildExportArgs()` 内で各クリップの `clip.crop` を参照し、値がある場合は FFmpeg `crop` フィルタを挿入
- [x] フィルタ挿入位置: `trim` / `setpts` の直後、`pad` の前（ソース映像から先に切り抜く）
- [x] 動画クリップ: `[i:v]trim=...,setpts=...,crop=W:H:X:Y,pad=...,crop=...` の順
- [x] 画像クリップ: `[i:v]crop=W:H:X:Y,pad=...,crop=...,setsar=1` の順
- [x] crop 未設定（undefined）のクリップは従来通り変更なし

**FFmpeg crop フィルタ仕様:**
```
crop=width:height:x:y
```
- width, height: 切り抜き後のサイズ（ピクセル）
- x, y: 切り抜き開始位置（ソース映像の左上が原点）

**確認方法:**
- crop を設定したプロジェクトをエクスポートし、出力動画が crop 範囲のみ含むこと
- crop 未設定のクリップは従来通り全体が表示されること
- crop + transform（position/scale）の組み合わせが正しく動作すること

### 83: エクスポート crop のテスト追加

**背景:** タスク 82 の変更に対するユニットテストを追加する。

**対象ファイル:**
- `app/backend/src/services/export-service.test.ts`

**変更内容:**
- [x] crop 設定ありのクリップでフィルタに `crop=W:H:X:Y` が含まれることを確認するテスト
- [x] crop 未設定のクリップでフィルタに余分な crop が追加されないことを確認するテスト
- [x] crop + transform 併用時にフィルタ順序が正しいことを確認するテスト
- [x] 画像クリップの crop テスト

**確認方法:** `bun run test` で全テストが通ること

### 84: buildTransformFilter の scale > 1 pad エラー修正

**背景:** iPhone 16 Pro Max で撮影した MOV ファイル（1920x1080 HEVC）を含むプロジェクトをエクスポートすると、`[Parsed_pad_6] Padded dimensions cannot be smaller than input dimensions` エラーで失敗する。

**原因分析:**
`buildTransformFilter()` (`export-service.ts:32-38`) の scale 処理で、`scale > 1` の場合に映像がキャンバスサイズより大きくなるが、直後の `pad=${preset.width}:${preset.height}` が入力より小さい出力サイズを指定するため FFmpeg がエラーを返す。

例: キャンバス 1920x1080、scale=2 の場合
- `scale=iw*2:ih*2` → 3840x2160
- `pad=1920:1080:(ow-iw)/2:(oh-ih)/2` → 出力 1920x1080 < 入力 3840x2160 → **エラー**

フィルタインデックス `pad_6` の内訳（clip に crop + transform scale > 1 がある場合）:
```
trim(0), setpts(1), crop(2), pad(3), crop(4), scale(5), pad(6) ← ここ
```

**対象ファイル:**
- `app/backend/src/services/export-service.ts`

**変更内容:**

**A. scale ブランチの pad+crop パターン修正** (`buildTransformFilter` L32-38)
- [ ] 現在のコード:
  ```typescript
  if (scale !== 1) {
    parts.push(
      `scale=iw*${scale}:ih*${scale}`,
      `pad=${preset.width}:${preset.height}:(ow-iw)/2:(oh-ih)/2`,
    );
  }
  ```
- [ ] 修正後（メインフィルタチェーンと同じ pad+crop パターンを適用）:
  ```typescript
  if (scale !== 1) {
    parts.push(
      `scale=iw*${scale}:ih*${scale}`,
      `pad=w='max(iw,${preset.width})':h='max(ih,${preset.height})':x=(ow-iw)/2:y=(oh-ih)/2:color=black`,
      `crop=${preset.width}:${preset.height}:(iw-${preset.width})/2:(ih-${preset.height})/2`,
    );
  }
  ```
- [ ] これにより:
  - scale > 1（拡大）: pad は入力サイズをそのまま維持 → crop でキャンバスサイズに切り抜き
  - scale < 1（縮小）: pad で黒背景をキャンバスサイズまで追加 → crop は実質 no-op
  - scale = 1: ブランチに入らないので影響なし

**確認方法:**
- crop + transform (scale > 1) を設定したクリップのエクスポートがエラーなく完了すること
- scale < 1 のクリップも従来通り正しくエクスポートされること
- transform なしのクリップに影響がないこと

### 85: iPhone MOV 未対応コーデックストリームへの対策

**背景:** iPhone 16 Pro Max で撮影した MOV ファイルには以下のような複数ストリームが含まれる:
- Stream 0: HEVC (Main 10) 映像
- Stream 1: AAC 音声（メイン）
- Stream 2: APAC 音声（Apple Positional Audio Codec — 空間オーディオ）
- Stream 3-8: メタデータ (mebx)

FFmpeg 4.4.2 は APAC コーデックをサポートしておらず、以下の警告が出る:
```
Could not find codec parameters for stream 2 (Audio: none (apac / 0x63617061), 48000 Hz, 4 channels, 380 kb/s): unknown codec
```

現在の `filter_complex` は `[i:v]` / `[i:a]` で最初の映像・音声ストリームを正しく選択しており、APAC ストリームは実質的に無視されるが、警告が stderr に出力されノイズとなる。また、HEVC Dolby Vision メタデータ（NAL unit 62）のスキップ警告も大量に出る。

**対象ファイル:**
- `app/backend/src/services/export-service.ts`

**変更内容:**

**A. FFmpeg 入力オプションの追加** (`buildExportArgs` の inputArgs 構築部分)
- [ ] 動画アセットの `-i` の前に `-ignore_unknown` オプションを追加し、未対応コーデックストリームの警告を抑制する
- [ ] 現在のコード (L128):
  ```typescript
  inputArgs.push("-i", assetPath);
  ```
- [ ] 修正後:
  ```typescript
  inputArgs.push("-ignore_unknown", "-i", assetPath);
  ```

**B. stderr ログの改善** (`startExport` のエラーハンドリング)
- [ ] エクスポート失敗時の stderr 出力から `[hevc @...] Skipping NAL unit` 行をフィルタリングし、ユーザーに表示されるエラーメッセージのノイズを削減する
- [ ] 現在のコード (L386-389):
  ```typescript
  const stderr = proc.stderr
    ? await new Response(proc.stderr).text()
    : "";
  throw new Error(`Export failed (exit ${exitCode}): ${stderr}`);
  ```
- [ ] 修正後:
  ```typescript
  const rawStderr = proc.stderr
    ? await new Response(proc.stderr).text()
    : "";
  const stderr = rawStderr
    .split("\n")
    .filter((line) => !line.includes("Skipping NAL unit"))
    .join("\n");
  throw new Error(`Export failed (exit ${exitCode}): ${stderr}`);
  ```

**確認方法:**
- iPhone MOV ファイルを含むプロジェクトのエクスポートで APAC 関連の警告が出ないこと
- エクスポート失敗時のエラーメッセージから NAL unit スキップ行が除去されていること
- 通常のファイル（APAC ストリームなし）のエクスポートに影響がないこと

### 86: タスク 84・85 のテスト追加

**背景:** タスク 84（scale > 1 pad エラー修正）と タスク 85（iPhone MOV 未対応ストリーム対策）の変更に対するユニットテストを追加する。

**対象ファイル:**
- `app/backend/src/services/export-service.test.ts`

**変更内容:**

**A. scale > 1 のテスト追加**
- [ ] scale > 1（例: 2.0）のクリップで `buildExportArgs` を実行し、フィルタチェーンに `scale=iw*2:ih*2` → `pad=w='max(iw,...` → `crop=W:H:...` が含まれることを確認
- [ ] scale > 1 + crop 併用時にエラーが発生しないことを確認
- [ ] scale < 1（例: 0.5）のクリップでも pad+crop パターンが正しく生成されることを確認

**B. -ignore_unknown オプションのテスト追加**
- [ ] 動画クリップの入力引数に `-ignore_unknown` が含まれることを確認
- [ ] 画像クリップの入力引数に `-ignore_unknown` が含まれないことを確認（画像には不要）

**C. stderr フィルタリングのテスト**
- [ ] `startExport` のエラーハンドリングは統合テストの範囲のため、ユニットテストでは `buildExportArgs` の出力検証に集中する

**確認方法:** `bun run test` で全テストが通ること

### 87: プレビューの Crop 表示位置をエクスポートと一致させる

**背景:** プレビューとエクスポートで Crop 済みクリップの表示位置が異なる。エクスポート側が意図通りの表示であり、プレビュー側を修正する。

**根本原因:** Crop の適用順序がプレビューとエクスポートで異なる。

- エクスポート（FFmpeg）: `crop=w:h:x:y`（ピクセル除去）→ pad/center でキャンバスにセンタリング → scale/position
- プレビュー（CSS）: アセットをフルサイズでキャンバス中央に配置 → `clipPath: inset(...)` で視覚的にマスク → scale/position

CSS clipPath はフルサイズのアセット上にマスクをかけるだけなので、crop 後の可視領域はキャンバス中央に来ない。エクスポートでは crop 後の画像（crop.width × crop.height）がキャンバス中央にセンタリングされる。

例: アセット 1920×1080、キャンバス 1920×1080、crop (100, 100, 800, 600) の場合:
- エクスポート: 800×600 にクロップ → キャンバス中央に配置（中央に表示）
- プレビュー: 1920×1080 をキャンバス中央に配置 → clipPath でマスク → 可視領域 800×600 がオフセットされた位置に表示

**対象ファイル:**
- `app/frontend/src/components/PreviewPlayer.tsx`

**変更内容:**

**A. cropContainerStyle 関数の廃止とクロップ表示方式の変更** (L474-483, L345-355)

現在の clipPath 方式を、overflow: hidden + 内部要素オフセット方式に変更する。

- [ ] crop がある場合のコンテナサイズ計算を変更:
  - 現在: `assetWidthPct = (assetW / canvasW) * 100 * scale`（フルアセットサイズ基準）
  - 修正後: `effectiveW = crop ? crop.width : assetW` を使い、`containerWidthPct = (effectiveW / canvasW) * 100 * scale` とする
  - 同様に height も `effectiveH = crop ? crop.height : assetH` を使用

- [ ] コンテナの CSS を変更:
  ```
  現在: clipPath: inset(...)
  修正後: overflow: "hidden"（crop がある場合）
  ```

- [ ] 内部の video/img 要素のサイズとオフセットを設定:
  - crop がない場合: 従来通り `width: 100%, height: 100%`
  - crop がある場合:
    - `width: (assetW / crop.width) * 100 + "%"`（コンテナより大きくなる）
    - `height: (assetH / crop.height) * 100 + "%"`
    - `marginLeft: -(crop.x / crop.width) * 100 + "%"`（crop 開始位置にオフセット）
    - `marginTop: -(crop.y / crop.height) * 100 + "%"`

- [ ] `cropContainerStyle` 関数を削除し、上記のロジックに置き換える

**B. scale/position との相互作用の確認** (L278-295)

- [ ] scale は effectiveW/effectiveH ベースのコンテナに適用されるため、エクスポートと同じ順序（crop → scale）になることを確認
- [ ] translateX/translateY のオフセット計算は canvas 基準のまま変更不要であることを確認

**確認方法:**
- crop 設定済みクリップのプレビュー表示がエクスポート結果と一致すること
- crop + scale、crop + position、crop + scale + position の組み合わせでも一致すること
- crop なしのクリップに影響がないこと
- 動画・画像の両方で動作すること

### 88: プレビューのテキストオーバーレイ位置をエクスポートと一致させる

**背景:** テキストオーバーレイの表示位置がプレビューとエクスポートで異なる。エクスポート側が意図通りの表示であり、プレビュー側を修正する。

**差異の詳細:**

| 項目 | プレビュー | エクスポート |
|------|-----------|-------------|
| 下端からの距離 | `padding: 16px` + `marginBottom: 8px` = 約24px | `y=h-th-40` = 40px |
| デフォルト背景色 | `transparent` | `black@0.5` |
| ボックス余白 | `padding: 4px 12px` | `boxborderw=8`（上下左右8px） |

**対象ファイル:**
- `app/frontend/src/components/PreviewPlayer.tsx`

**変更内容:**

**A. テキスト垂直位置の修正** (L381-413)

- [ ] テキストオーバーレイコンテナの `padding: "16px"` を `padding: "40px"` に変更
- [ ] 各テキスト要素の `marginBottom: "8px"` を `marginBottom: "0px"` に変更（エクスポートでは複数テキスト間のスペーシングは drawtext の y 座標で固定のため）

**B. デフォルト背景色の修正** (L398)

- [ ] `backgroundColor: text.backgroundColor ?? "transparent"` を `backgroundColor: text.backgroundColor ?? "rgba(0,0,0,0.5)"` に変更
  - エクスポートの `black@0.5` = 不透明度50%の黒に合わせる

**C. ボックス余白の修正** (L401)

- [ ] `padding: "4px 12px"` を `padding: "8px"` に変更
  - エクスポートの `boxborderw=8` は上下左右均等8px

**D. テキストピクセル値のキャンバス解像度スケーリング**

- [x] キャンバスコンテナの描画幅を ResizeObserver で監視し、`canvasScale = renderedWidth / canvasW` を算出
- [x] テキストオーバーレイの fontSize, padding, borderRadius に `canvasScale` を乗算
  - CSS ピクセル値はキャンバスの描画サイズに対するものだが、エクスポートはキャンバスのネイティブ解像度（1920×1080 等）基準のため、スケーリングしないとプレビューでテキストが巨大に表示される

**確認方法:**
- テキストオーバーレイの表示位置がエクスポート結果と一致すること
- 複数テキストクリップが同時表示される場合もレイアウトが一致すること
- カスタム背景色が設定されている場合はそちらが優先されること
- ブラウザウィンドウのリサイズ時にテキストサイズが追従すること

### 89: プレビュー・エクスポート一致性のテスト追加

**背景:** タスク 87（Crop 位置修正）と タスク 88（テキスト位置修正）の変更に対するテストを追加する。

**対象ファイル:**
- `app/frontend/src/components/PreviewPlayer.test.tsx`（既存 or 新規）
- `app/frontend/src/components/PreviewPlayer.stories.tsx`（既存 Story の更新）

**変更内容:**

**A. Crop 表示のテスト追加**

- [ ] crop 設定済みクリップの描画で、コンテナサイズが crop.width/crop.height ベースであることを確認するテスト
- [ ] crop 設定済みクリップの描画で、内部 video/img 要素に正しいオフセット（marginLeft, marginTop）が設定されていることを確認するテスト
- [ ] crop + scale 併用時のコンテナサイズが正しいことを確認するテスト
- [ ] crop なしのクリップで従来通りの表示（100% サイズ、オフセットなし）であることを確認するテスト

**B. テキストオーバーレイのテスト追加**

- [ ] テキストオーバーレイコンテナの padding が 40px であることを確認するテスト
- [ ] テキスト要素のデフォルト背景色が rgba(0,0,0,0.5) であることを確認するテスト
- [ ] テキスト要素の padding が 8px であることを確認するテスト

**C. Story の更新**

- [ ] Crop 設定済みクリップの Story を追加（crop 前後の表示比較用）
- [ ] テキストオーバーレイの Story が更新後のスタイルで表示されることを確認

**確認方法:** `bun run test` と `bun run storybook` で全テスト・Story が正常動作すること

### 90: プレビューのウィンドウ内フルスクリーン表示

**背景:** 現在のプレビューはエディタ画面左カラム（グリッド `1fr 2fr` の左側）に固定表示されており、映像を大きく確認したい場合に不便。プレビューをウィンドウ全体に拡大して表示する機能を追加する。

**対象ファイル:**
- `app/frontend/src/components/PreviewPlayer.tsx`
- `app/frontend/src/components/EditorLayout.tsx`
- `app/frontend/src/pages/EditorPage.tsx`

**変更内容:**

**A. フルスクリーン状態管理の追加** (`EditorPage.tsx`)

- [ ] `isPreviewFullscreen` state を追加（`useState<boolean>(false)`）
- [ ] `togglePreviewFullscreen` コールバックを定義し、`PreviewPlayer` に props として渡す

**B. PreviewPlayer にフルスクリーントグルボタンを追加** (`PreviewPlayer.tsx`)

- [ ] props に `isFullscreen?: boolean` と `onToggleFullscreen?: () => void` を追加
- [ ] トランスポートコントロール右端に拡大ボタン（`⛶` or 適切なアイコン）を追加
  - クリックで `onToggleFullscreen` を呼び出す
  - フルスクリーン時はアイコンを縮小表示用に切り替え
- [ ] Esc キーでフルスクリーン解除するキーボードイベントリスナーを追加（`useEffect` で `keydown` を監視）

**C. フルスクリーン時のオーバーレイレイアウト** (`EditorLayout.tsx`)

- [ ] `isPreviewFullscreen` prop を追加
- [ ] フルスクリーン時、プレビューコンテナを `position: fixed; inset: 0; z-index: 1000` のオーバーレイとして描画
  - 背景色は `theme.bg`（他パネルを完全に覆う）
  - プレビューキャンバスは `width: 100vw; height: calc(100vh - トランスポートコントロール高さ)` に拡大
  - トランスポートコントロールは下部に固定表示
- [ ] フルスクリーン時もタイムラインの再生状態・シーク操作は引き続き連動すること（状態は EditorPage で一元管理のため特別な対応は不要）

**D. キャンバススケーリングの対応** (`PreviewPlayer.tsx`)

- [ ] 既存の `ResizeObserver` による `canvasScale` 計算がフルスクリーン時のコンテナサイズ変更にも追従することを確認
  - コンテナが `100vw` に拡大されると `renderedWidth` が変わるため、`canvasScale` が自動的に再計算される
- [ ] テキストオーバーレイのスケーリングがフルスクリーン時にも正しく動作することを確認

**確認方法:**
- 拡大ボタンクリックでプレビューがウィンドウ全体に表示されること
- フルスクリーン中も再生・一時停止・シークが正常動作すること
- フルスクリーン中もテキストオーバーレイ・Crop 表示が正しくスケーリングされること
- Esc キーまたは縮小ボタンで元のレイアウトに戻ること
- ブラウザウィンドウのリサイズに追従すること

### 91: プレビューの別ウィンドウ表示

**背景:** デュアルモニター環境やプレビューを独立して確認したい場合に、プレビューを別ウィンドウ（ポップアウト）で開く機能を追加する。タスク 90 のフルスクリーン機能と並行して利用可能にする。

**対象ファイル:**
- `app/frontend/src/components/PreviewPlayer.tsx`
- `app/frontend/src/pages/EditorPage.tsx`
- `app/frontend/src/components/PreviewPopout.tsx`（新規）
- `app/frontend/src/hooks/usePreviewPopout.ts`（新規）

**変更内容:**

**A. ポップアウト用カスタムフックの作成** (`usePreviewPopout.ts` 新規)

- [ ] `usePreviewPopout()` フックを作成
  - `window.open()` で子ウィンドウを作成（初期サイズ: 960×540 + コントロール領域）
  - 戻り値: `{ popoutWindow, isPopout, openPopout, closePopout }`
  - 子ウィンドウの `beforeunload` イベントで `isPopout` を `false` にリセット
  - 親ウィンドウの `beforeunload` / ページ遷移時に子ウィンドウを `close()` する cleanup

**B. ポップアウトコンテナコンポーネント** (`PreviewPopout.tsx` 新規)

- [ ] `createPortal` を使い、子ウィンドウの `document.body` にプレビューを描画する React コンポーネント
  - 子ウィンドウに親のスタイルシート（テーマ CSS 変数等）をコピーして適用
  - `PreviewPlayer` をそのまま子ウィンドウ内にレンダリング
- [ ] 子ウィンドウのタイトルを「Preview — {プロジェクト名}」に設定

**C. PreviewPlayer にポップアウトボタンを追加** (`PreviewPlayer.tsx`)

- [ ] props に `isPopout?: boolean` と `onTogglePopout?: () => void` を追加
- [ ] トランスポートコントロールにポップアウトボタン（`↗` or 適切なアイコン）を追加
  - フルスクリーンボタンの隣に配置
  - ポップアウト中は「↙」アイコンに切り替え（クリックでウィンドウを閉じて元に戻す）
- [ ] ポップアウト中はメインウィンドウ側のプレビュー領域に「別ウィンドウで表示中」のプレースホルダーを表示

**D. EditorPage での状態統合** (`EditorPage.tsx`)

- [ ] `usePreviewPopout` を呼び出し、`isPopout` / `openPopout` / `closePopout` を管理
- [ ] ポップアウト中:
  - メインウィンドウのプレビュー領域にプレースホルダーを表示
  - 子ウィンドウに `PreviewPopout` をレンダリング（`PreviewPlayer` を内包）
  - 再生状態・シーク・タイムラインとの連動は React の状態が共有されているため自動的に維持
- [ ] フルスクリーンとポップアウトの排他制御: ポップアウト中にフルスクリーンは無効化（ボタンを disabled にする）、逆も同様

**確認方法:**
- ポップアウトボタンクリックで新しいウィンドウにプレビューが表示されること
- 別ウィンドウ内の再生操作がメインウィンドウのタイムラインと同期すること
- メインウィンドウでのシーク操作が別ウィンドウのプレビューに反映されること
- 別ウィンドウを閉じるとメインウィンドウのプレビューが復帰すること
- メインウィンドウでページ遷移した場合に別ウィンドウが自動的に閉じること
- テキストオーバーレイ・Crop 表示が別ウィンドウ内でも正しく表示されること

### 92: プレビュー拡大表示のテスト・Story 追加

**背景:** タスク 90（ウィンドウ内フルスクリーン）と タスク 91（別ウィンドウ表示）の変更に対するテストと Story を追加する。

**対象ファイル:**
- `app/frontend/src/components/PreviewPlayer.stories.tsx`（既存 Story の更新）
- `app/frontend/src/components/PreviewPlayer.test.tsx`（既存 or 新規）
- `app/frontend/src/hooks/usePreviewPopout.test.ts`（新規）

**変更内容:**

**A. フルスクリーン関連の Story 追加** (`PreviewPlayer.stories.tsx`)

- [ ] `Fullscreen` Story を追加: `isFullscreen: true` 状態のプレビュー表示
- [ ] `FullscreenWithTextOverlay` Story を追加: フルスクリーン + テキストオーバーレイ表示

**B. フルスクリーン関連のテスト追加** (`PreviewPlayer.test.tsx`)

- [ ] フルスクリーントグルボタンが表示されること
- [ ] ボタンクリックで `onToggleFullscreen` が呼ばれること
- [ ] Esc キーで `onToggleFullscreen` が呼ばれること（フルスクリーン中のみ）
- [ ] `isFullscreen: true` 時にオーバーレイスタイル（`position: fixed`）が適用されていること

**C. ポップアウトフックのテスト追加** (`usePreviewPopout.test.ts`)

- [ ] `openPopout` で `window.open` が呼ばれること
- [ ] `closePopout` で子ウィンドウの `close` が呼ばれること
- [ ] 子ウィンドウ close 時に `isPopout` が `false` になること
- [ ] cleanup 時に子ウィンドウが close されること

**D. ポップアウト関連の Story 追加** (`PreviewPlayer.stories.tsx`)

- [ ] `PopoutPlaceholder` Story を追加: ポップアウト中のメインウィンドウ側プレースホルダー表示

**確認方法:** `bun run test` と `bun run storybook` で全テスト・Story が正常動作すること

---

## Refactoring Phase: 拡張可能な設計への移行

### 設計方針

GoF デザインパターン（Registry / Strategy / Factory / Template Method）と Open/Closed 原則に基づき、以下の拡張ポイントを新規コード追加のみで対応可能にする:

1. **新しいトラック種別の追加**（例: subtitle, effect, transition）
2. **あらゆるファイル形式のインポート**（例: PSD, SVG, GIF, FLAC）
3. **Inspector での様々なフィルタ制御の追加**（例: 色調補正、ブラー、不透明度）
4. **将来のプラグイン機構**への段階的な基盤整備

各タスクは既存の動作を一切変更せず、内部構造のみをリファクタリングする。

### 93: TrackKind / AssetKind レジストリの導入

**背景:** 現在 `TrackKind` は `"video" | "audio" | "title"` のリテラル型、`AssetKind` は `"video" | "image" | "audio"` のリテラル型でハードコードされており、新しい種別を追加するたびにコードベース全体の条件分岐を修正する必要がある。種別ごとのメタデータ（ラベル、色、対応エディタ、レンダラ等）を一元管理するレジストリを導入し、後続タスクの基盤とする。

**対象ファイル:**
- `app/shared/src/types/track-kind.ts`（新規）
- `app/shared/src/types/asset-kind.ts`（新規）
- `app/frontend/src/lib/track-kind-registry.ts`（新規）
- `app/frontend/src/lib/asset-kind-registry.ts`（新規）
- `app/shared/src/types/project.ts`（型の参照元を更新）
- `app/shared/src/types/asset.ts`（型の参照元を更新）

**変更内容:**

**A. TrackKind レジストリの定義** (`track-kind-registry.ts`)

- [ ] `TrackKindDescriptor` 型を定義:
  ```typescript
  type TrackKindDescriptor = {
    kind: string;
    label: string;            // タイムラインラベル（例: "V", "A", "T"）
    clipColor: string;        // クリップのデフォルト背景色
    clipSelectedColor: string;
    hasSourceTrim: boolean;   // ソーストリム編集の有無
    hasAsset: boolean;        // アセット紐付きか（title は false）
  };
  ```
- [ ] `TrackKindRegistry` クラスを実装:
  - `register(descriptor: TrackKindDescriptor): void`
  - `get(kind: string): TrackKindDescriptor | undefined`
  - `all(): TrackKindDescriptor[]`
- [ ] デフォルトの 3 種別（video, audio, title）を登録
- [ ] シングルトンエクスポート: `export const trackKindRegistry = new TrackKindRegistry()`

**B. AssetKind レジストリの定義** (`asset-kind-registry.ts`)

- [ ] `AssetKindDescriptor` 型を定義:
  ```typescript
  type AssetKindDescriptor = {
    kind: string;
    label: string;
    extensions: string[];       // 対応拡張子（例: [".mp4", ".mov"]）
    mimePatterns: string[];     // MIME パターン（例: ["video/*"]）
    defaultTrackKind: string;   // この種別がドロップされるデフォルトトラック
    hasDuration: boolean;       // 時間長があるか（image は false）
    defaultDurationMs?: number; // image 等のデフォルト時間長
  };
  ```
- [ ] `AssetKindRegistry` クラスを実装:
  - `register(descriptor: AssetKindDescriptor): void`
  - `get(kind: string): AssetKindDescriptor | undefined`
  - `detectByExtension(ext: string): AssetKindDescriptor | undefined`
  - `all(): AssetKindDescriptor[]`
- [ ] デフォルトの 3 種別（video, image, audio）を登録

**C. 既存の型定義を拡張可能にする**

- [ ] `Track.kind` の型を `string` に拡張（ランタイムバリデーションはレジストリで行う）
- [ ] `AssetKind` の型を `string` に拡張
- [ ] 既存コードとの互換性を維持するために `"video" | "audio" | "title"` のユーティリティ型も残す

**確認方法:**
- 既存の全テストが変更なく通ること
- `trackKindRegistry.get("video")` 等でメタデータが取得できること
- レジストリに新しい種別を `register()` で追加できること

### 94: Inspector パネルのエディタプラグインレジストリ化

**背景:** 現在の `InspectorPanel.tsx` はトラック種別ごとの表示ロジックを if/else チェーンで分岐している（50 行目: `isTextClip = trackKind === "title"`, 87 行目: `trackKind === "video"`, 95 行目: `trackKind === "audio"`）。新しいトラック種別やフィルタ制御を追加するたびにこのコンポーネントを修正する必要があり、Open/Closed 原則に違反している。

**対象ファイル:**
- `app/frontend/src/lib/inspector-editor-registry.ts`（新規）
- `app/frontend/src/components/editors/TrimEditor.tsx`（`InspectorPanel.tsx` から分離）
- `app/frontend/src/components/editors/TextEditor.tsx`（`InspectorPanel.tsx` から分離）
- `app/frontend/src/components/editors/TransformEditor.tsx`（`InspectorPanel.tsx` から分離）
- `app/frontend/src/components/editors/AudioVolumeEditor.tsx`（`InspectorPanel.tsx` から分離）
- `app/frontend/src/components/editors/index.ts`（新規: 全エディタを登録）
- `app/frontend/src/components/InspectorPanel.tsx`（リファクタリング）

**変更内容:**

**A. エディタプラグインインターフェースの定義** (`inspector-editor-registry.ts`)

- [x] `InspectorEditorPlugin` 型を定義:
  ```typescript
  type InspectorEditorContext = {
    clip: Clip;
    asset: Asset | undefined;
    trackKind: string;
    onUpdate: (updates: Partial<Clip>) => void;
  };

  type InspectorEditorPlugin = {
    id: string;
    label: string;
    order: number;            // 表示順序
    canHandle: (ctx: InspectorEditorContext) => boolean;
    Component: React.ComponentType<InspectorEditorContext>;
  };
  ```
- [x] `InspectorEditorRegistry` クラスを実装:
  - `register(plugin: InspectorEditorPlugin): void`
  - `getEditorsFor(ctx: InspectorEditorContext): InspectorEditorPlugin[]`（`canHandle` でフィルタし `order` でソート）

**B. 既存エディタの分離・プラグイン化**

- [x] `TrimEditor` を独立コンポーネントファイルに抽出し、`InspectorEditorPlugin` として登録
  - `canHandle`: 常に `true`（全クリップに表示）
- [x] `TextEditor` を独立コンポーネントファイルに抽出し、プラグインとして登録
  - `canHandle`: `trackKind === "title"`
- [x] `TransformEditor` を独立コンポーネントファイルに抽出し、プラグインとして登録
  - `canHandle`: `trackKind === "video"`
- [x] `AudioVolumeEditor` を独立コンポーネントファイルに抽出し、プラグインとして登録（現在は `InspectorPanel` 内にインラインで記述: 95〜111 行目）
  - `canHandle`: `trackKind === "audio"`

**C. InspectorPanel のリファクタリング**

- [x] if/else チェーンを削除し、レジストリから取得したエディタを動的にレンダリング:
  ```typescript
  const editors = inspectorEditorRegistry.getEditorsFor(ctx);
  {editors.map((editor) => (
    <editor.Component key={editor.id} {...ctx} />
  ))}
  ```
- [x] メタ情報テーブル（File, Type, Size, Codec）の表示も `TrackKindDescriptor.hasAsset` を参照して分岐

**確認方法:**
- Inspector の表示・操作が全く同じであること
- 新しいエディタプラグインを `register()` で追加すると Inspector に表示されること
- 既存の全テスト・Story が通ること

### 95: タイムラインクリップの外観レジストリ化

**背景:** `TimelineClip.tsx` の 42〜53 行目で `isTextClip` / `isAudioClip` による if/else チェーンでクリップの背景色・ボーダー色を決定しており、`TimelineTrack.tsx` の 19〜23 行目で `TRACK_LABEL` のハードコード Record がある。新しいトラック種別を追加するたびにこれらのファイルを修正する必要がある。

**対象ファイル:**
- `app/frontend/src/components/TimelineClip.tsx`
- `app/frontend/src/components/TimelineTrack.tsx`

**変更内容:**

**A. TimelineClip のリファクタリング**

- [x] 42〜53 行目の色決定ロジックを `TrackKindRegistry` からの取得に置換:
  ```typescript
  const descriptor = trackKindRegistry.get(trackKind);
  const bgColor = isSelected ? descriptor?.clipColor : descriptor?.clipSelectedColor;
  const borderColor = isSelected ? theme.text : descriptor?.clipSelectedColor;
  ```
- [x] `TimelineClip` の props に `trackKind: string` を追加（現在は `asset?.kind` と `clip.text` から推測しているため）
- [x] `TimelineTrack` から `trackKind` を `TimelineClip` に渡すように修正

**B. TimelineTrack のリファクタリング**

- [x] 19〜23 行目の `TRACK_LABEL` 定数を削除し、`TrackKindDescriptor.label` を使用:
  ```typescript
  const descriptor = trackKindRegistry.get(track.kind);
  const label = descriptor?.label ?? track.kind[0].toUpperCase();
  ```

**確認方法:**
- タイムラインの見た目が完全に同一であること
- 新しいトラック種別をレジストリに追加するとタイムラインに自動で対応すること

### 96: プレビュープレーヤーの描画 Strategy 化

**背景:** `PreviewPlayer.tsx` では `findActiveClip` (30〜44 行目) が `track.kind !== "video"` で video トラックのみをフィルタし、`findActiveTextClips` (46〜57 行目) が `track.kind !== "title"` で title トラックをフィルタしている。また再生ループ内 (224〜254 行目) で `asset.kind === "video"` / `asset.kind === "image"` の分岐がある。新しいトラック/アセット種別追加時にこのファイルを修正する必要がある。

**対象ファイル:**
- `app/frontend/src/lib/preview-renderer-registry.ts`（新規）
- `app/frontend/src/components/renderers/VideoClipRenderer.tsx`（新規）
- `app/frontend/src/components/renderers/ImageClipRenderer.tsx`（新規）
- `app/frontend/src/components/renderers/TextOverlayRenderer.tsx`（新規）
- `app/frontend/src/components/renderers/index.ts`（新規: 全レンダラ登録）
- `app/frontend/src/components/PreviewPlayer.tsx`（リファクタリング）

**変更内容:**

**A. プレビューレンダラインターフェースの定義** (`preview-renderer-registry.ts`)

- [x] `PreviewLayerRenderer` 型を定義:
  ```typescript
  type PreviewRenderContext = {
    project: Project;
    currentTimeMs: number;
    canvasW: number;
    canvasH: number;
    canvasScale: number;
    isPlaying: boolean;
  };

  type PreviewLayerRenderer = {
    id: string;
    zOrder: number;         // 描画レイヤー順（0: 最背面）
    findActiveContent: (ctx: PreviewRenderContext) => unknown | null;
    Component: React.ComponentType<{ content: unknown; ctx: PreviewRenderContext }>;
  };
  ```
- [x] `PreviewRendererRegistry` クラスを実装:
  - `register(renderer: PreviewLayerRenderer): void`
  - `all(): PreviewLayerRenderer[]`（zOrder 順でソート）

**B. 既存レンダラの分離**

- [x] video/image のメディアレンダラを `VideoClipRenderer` / `ImageClipRenderer` として抽出
- [x] テキストオーバーレイを `TextOverlayRenderer` として抽出
- [x] 各レンダラを `PreviewLayerRenderer` インターフェースに準拠させて登録

**C. PreviewPlayer のリファクタリング**

- [x] `findActiveClip` / `findActiveTextClips` を各レンダラの `findActiveContent` に移動
- [x] レンダリング部分をレジストリからの動的レイヤー合成に変更
- [x] 再生ループ内の `asset.kind` 分岐を Strategy の `tick` メソッドに委譲

**D. 再生ティック Strategy**

- [x] `PlaybackTickStrategy` インターフェースを定義:
  ```typescript
  type PlaybackTickStrategy = {
    assetKind: string;
    tick: (clip: ActiveClip, deltaMs: number, videoRef: HTMLVideoElement | null) => number; // 新しいタイムライン位置を返す
  };
  ```
- [x] video / image 用の tick strategy をそれぞれ実装し、レジストリに登録
- [x] 再生ループ内の if/else を strategy の dispatch に置換

**確認方法:**
- プレビュー再生（video, image, text）が完全に同一動作であること
- 新しいレンダラを `register()` で追加するとプレビューにレイヤーが追加されること

### 97: sequence-ops のトラックルーティング Strategy 化

**背景:** `sequence-ops.ts` の `addClipFromAsset` (10〜14 行目) で `asset.kind === "audio" ? "audio" : "video"` というハードコードでトラックルーティングが行われ、`addTextClip` (163 行目) で `t.kind === "title"` が直書きされている。新しいアセット種別（例: subtitle, effect）を追加すると、このファイルの修正が必要になる。

**対象ファイル:**
- `app/frontend/src/lib/sequence-ops.ts`

**変更内容:**

**A. トラックルーティングの Strategy 化**

- [x] `addClipFromAsset` のトラック選択を `AssetKindRegistry.get(asset.kind).defaultTrackKind` で解決:
  ```typescript
  const descriptor = assetKindRegistry.get(asset.kind);
  const trackKind = descriptor?.defaultTrackKind ?? "video";
  let track = tracks.find((t) => t.kind === trackKind);
  ```
- [x] `addTextClip` のトラック選択を `"title"` 定数ではなく引数で受け取れるようにする（デフォルト値は `"title"`）

**B. クリップデフォルト値の外部化**

- [x] image アセットのデフォルト duration を `AssetKindDescriptor.defaultDurationMs` から取得:
  ```typescript
  const descriptor = assetKindRegistry.get(asset.kind);
  const durationMs = descriptor?.hasDuration
    ? (asset.durationMs ?? descriptor.defaultDurationMs ?? DEFAULT_IMAGE_DURATION_MS)
    : (descriptor?.defaultDurationMs ?? DEFAULT_IMAGE_DURATION_MS);
  ```

**確認方法:**
- クリップ追加の動作が完全に同一であること
- 新しいアセット種別を登録するとその `defaultTrackKind` に自動でルーティングされること

### 98: アセット種別検出のプラグイン化

**背景:** `asset-service.ts` の `detectKind` (11〜16 行目) で拡張子のハードコードリストにより種別判定しており、未知の拡張子はすべて `"image"` にフォールバックする。新しいファイル形式（PSD, SVG, GIF アニメ, FLAC 等）に対応するにはこの関数を修正する必要がある。

**対象ファイル:**
- `app/backend/src/lib/asset-detector-registry.ts`（新規）
- `app/backend/src/lib/asset-detectors/extension-detector.ts`（新規）
- `app/backend/src/lib/asset-detectors/index.ts`（新規: 全ディテクタ登録）
- `app/backend/src/services/asset-service.ts`（リファクタリング）

**変更内容:**

**A. アセットディテクタインターフェースの定義** (`asset-detector-registry.ts`)

- [x] `AssetDetector` インターフェースを定義:
  ```typescript
  type AssetDetectionContext = {
    filename: string;
    extension: string;   // 小文字化済み（例: ".mp4"）
    filePath?: string;   // ファイルシステムパス（Magic byte 検出用）
  };

  type AssetDetector = {
    name: string;
    priority: number;     // 高い値ほど先に評価（Magic byte > MIME > 拡張子）
    detect: (ctx: AssetDetectionContext) => string | null;  // AssetKind を返す or null（判定不能）
  };
  ```
- [x] `AssetDetectorRegistry` クラスを実装:
  - `register(detector: AssetDetector): void`
  - `detect(ctx: AssetDetectionContext): string`（priority 順に評価、全て null なら `"image"` フォールバック）

**B. 既存の拡張子判定をディテクタに移行**

- [x] `extension-detector.ts`: 現在の `detectKind` のロジックを `AssetDetector` として実装
  - `AssetKindRegistry` の `extensions` フィールドを参照して判定
- [x] `asset-service.ts` の `detectKind` を `assetDetectorRegistry.detect()` 呼び出しに置換

**C. 将来の拡張例（コメントで記載）**

- [x] `magic-byte-detector.ts` の stub をコメントで記載（将来的にファイルヘッダを読んで判定する想定）
- [x] `mime-type-detector.ts` の stub をコメントで記載

**確認方法:**
- アセットインポートの動作が完全に同一であること
- 新しいディテクタを `register()` で追加するとインポート時に使用されること

### 99: エクスポートのトラック/アセットハンドラ Strategy 化

**背景:** `export-service.ts` の `buildExportArgs` は 300 行超の巨大関数で、video (129 行目) / image (140 行目) / title (159 行目) / audio (192 行目以降) のトラック/アセット種別ごとのロジックが if/else で密結合している。新しいトラック種別（例: subtitle）やアセット種別の追加、フィルタ制御の追加のたびにこの関数全体を理解・修正する必要がある。

**対象ファイル:**
- `app/backend/src/lib/export-handler-registry.ts`（新規）
- `app/backend/src/lib/export-handlers/video-clip-handler.ts`（新規）
- `app/backend/src/lib/export-handlers/image-clip-handler.ts`（新規）
- `app/backend/src/lib/export-handlers/text-overlay-handler.ts`（新規）
- `app/backend/src/lib/export-handlers/audio-mix-handler.ts`（新規）
- `app/backend/src/lib/export-handlers/index.ts`（新規: 全ハンドラ登録）
- `app/backend/src/services/export-service.ts`（リファクタリング）

**変更内容:**

**A. エクスポートハンドラインターフェースの定義** (`export-handler-registry.ts`)

- [x] `ExportClipHandler` 型を定義（ビジュアルクリップ用）:
  ```typescript
  type ExportBuildContext = {
    project: Project;
    preset: ExportPreset;
    assetsBase: string;
    inputArgs: string[];
    filterParts: string[];
    inputIndex: number;       // 現在の FFmpeg 入力インデックス
  };

  type ExportClipHandler = {
    assetKind: string;
    buildInput: (clip: Clip, asset: Asset, ctx: ExportBuildContext) => void;
    // inputArgs, filterParts を ctx に push し、inputIndex をインクリメント
  };
  ```
- [x] `ExportOverlayHandler` 型を定義（テキスト等のオーバーレイ用）:
  ```typescript
  type ExportOverlayHandler = {
    trackKind: string;
    buildOverlay: (clips: Clip[], ctx: ExportBuildContext, videoOutLabel: string) => string;
    // filterParts を ctx に push し、新しい videoOut ラベルを返す
  };
  ```
- [x] `ExportAudioHandler` 型を定義（オーディオミキシング用）:
  ```typescript
  type ExportAudioHandler = {
    trackKind: string;
    buildAudio: (clips: Clip[], ctx: ExportBuildContext, videoClips: Clip[]) => string;
    // filterParts を ctx に push し、audioOut ラベルを返す（空文字 = 音声なし）
  };
  ```
- [x] `ExportHandlerRegistry` を実装:
  - `registerClipHandler(handler: ExportClipHandler): void`
  - `registerOverlayHandler(handler: ExportOverlayHandler): void`
  - `registerAudioHandler(handler: ExportAudioHandler): void`

**B. 既存ロジックのハンドラ分離**

- [x] `video-clip-handler.ts`: video アセットの FFmpeg 入力・フィルタ構築（現在の 129〜139 行目）を移行
- [x] `image-clip-handler.ts`: image アセットの FFmpeg 入力・フィルタ構築（現在の 140〜149 行目）を移行
- [x] `text-overlay-handler.ts`: drawtext フィルタ構築（現在の 159〜187 行目）を移行
- [x] `audio-mix-handler.ts`: オーディオストリーム結合・BGM ミキシング（現在の 192〜287 行目）を移行

**C. buildExportArgs のリファクタリング**

- [x] `buildExportArgs` をオーケストレータとしてリファクタリング:
  1. video トラックのクリップをループし、`clipHandlerRegistry.get(asset.kind).buildInput()` を呼ぶ
  2. concat フィルタを構築
  3. overlay ハンドラを順番に適用
  4. audio ハンドラを適用
  5. 出力引数を構築
- [x] 各ハンドラは独立してテスト可能であること

**確認方法:**
- `buildExportArgs` のテストが全て変更なく通ること
- エクスポート結果の映像・音声が完全に同一であること

### 100: プラグインシステムの基盤設計

**背景:** タスク 93〜99 で各レイヤーにレジストリ/Strategy を導入した結果、新しいトラック種別・アセット種別・エディタ・レンダラ・エクスポートハンドラを「register 呼び出しのみ」で追加可能になっている。これらを統合し、将来のプラグイン機構の土台となる `Plugin` インターフェースとプラグインローダを設計する。

**対象ファイル:**
- `app/shared/src/types/plugin.ts`（新規）
- `app/frontend/src/lib/plugin-loader.ts`（新規）
- `app/backend/src/lib/plugin-loader.ts`（新規）

**変更内容:**

**A. Plugin インターフェースの定義** (`plugin.ts`)

- [x] `Plugin` 型を定義:
  ```typescript
  type PluginManifest = {
    id: string;
    name: string;
    version: string;
    description?: string;
  };

  type FrontendPlugin = PluginManifest & {
    registerTrackKinds?: (registry: TrackKindRegistry) => void;
    registerInspectorEditors?: (registry: InspectorEditorRegistry) => void;
    registerPreviewRenderers?: (registry: PreviewRendererRegistry) => void;
  };

  type BackendPlugin = PluginManifest & {
    registerAssetKinds?: (registry: AssetKindRegistry) => void;
    registerAssetDetectors?: (registry: AssetDetectorRegistry) => void;
    registerPipelineSteps?: (registry: PipelineStepRegistry) => void;
    registerExportHandlers?: (registry: ExportHandlerRegistry) => void;
  };
  ```

**B. プラグインローダの実装**

- [x] フロントエンド用 `loadPlugins(plugins: FrontendPlugin[]): void`
  - 各プラグインの `register*` メソッドを順番に呼び出し、各レジストリに登録
- [x] バックエンド用 `loadPlugins(plugins: BackendPlugin[]): void`
  - 同様にバックエンドの各レジストリにプラグインを登録

**C. ビルトインプラグインとしてデフォルト種別を登録**

- [x] 現在の video/audio/title/image の登録コードを `builtin-plugin.ts` にまとめる
  - フロントエンド: TrackKind 登録、Inspector エディタ登録、プレビューレンダラ登録
  - バックエンド: AssetKind 登録、ディテクタ登録、パイプラインステップ登録、エクスポートハンドラ登録
- [x] アプリ起動時に `loadPlugins([builtinPlugin])` を呼び出し

**確認方法:**
- アプリの動作が完全に同一であること
- サードパーティプラグインの追加が `loadPlugins([builtinPlugin, myPlugin])` のみで可能な構造であること

### 101: リファクタリング全体のテスト・Story 更新

**背景:** タスク 93〜99 のリファクタリングに伴い、既存テストの更新と新しいレジストリ・Strategy のユニットテストを追加する。

**対象ファイル:**
- `app/frontend/src/lib/track-kind-registry.test.ts`（新規）
- `app/frontend/src/lib/asset-kind-registry.test.ts`（新規）
- `app/frontend/src/lib/inspector-editor-registry.test.ts`（新規）
- `app/frontend/src/lib/preview-renderer-registry.test.ts`（新規）
- `app/backend/src/lib/asset-detector-registry.test.ts`（新規）
- `app/backend/src/lib/export-handler-registry.test.ts`（新規）
- `app/frontend/src/components/editors/*.stories.tsx`（新規: 分離された各エディタの Story）
- 既存テスト・Story の更新（import パス変更等）

**変更内容:**

**A. レジストリのユニットテスト**

- [x] `track-kind-registry.test.ts`:
  - デフォルト 3 種別が登録されていること
  - `register` で新しい種別が追加できること
  - `get` で未登録の種別は `undefined` を返すこと
- [x] `asset-kind-registry.test.ts`:
  - `detectByExtension` が正しい種別を返すこと
  - 未知の拡張子は `undefined` を返すこと
- [x] `inspector-editor-registry.test.ts`:
  - `getEditorsFor` が `canHandle` でフィルタされること
  - `order` 順でソートされること
- [x] `preview-renderer-registry.test.ts`:
  - `all()` が `zOrder` 順で返すこと
- [x] `asset-detector-registry.test.ts`:
  - `priority` 順に評価されること
  - 全ディテクタが null を返した場合のフォールバック
- [x] `export-handler-registry.test.ts`:
  - 各ハンドラが正しい FFmpeg フィルタを生成すること
  - 複数ハンドラの合成が正しく動作すること

**B. 分離されたエディタの Story**

- [x] `TrimEditor.stories.tsx`: video / audio / title クリップそれぞれの Story
- [x] `TextEditor.stories.tsx`: テキスト編集の Story
- [x] `TransformEditor.stories.tsx`: Transform + Crop 編集の Story
- [x] `AudioVolumeEditor.stories.tsx`: 音量スライダーの Story

**C. 既存テストの更新**

- [x] import パスの変更に伴う既存テストファイルの修正
- [x] `buildExportArgs` テストが新しい内部構造でも同一の結果を返すことを確認
- [x] `sequence-ops` テストが同一の結果を返すことを確認

**確認方法:** `bun run test` と `cd app/frontend && bun run storybook` で全テスト・Story が正常動作すること

### 102: エクスポートへの clip.transform.rotation 反映

**背景:** プレビューでは CSS `rotate()` により回転が正しく表示されるが、エクスポート時に `buildTransformFilter()` が `clip.transform.rotation` を無視しており、出力動画に回転が反映されない。FFmpeg の `rotate` フィルタを生成する必要がある。

**対象ファイル:**
- `app/backend/src/services/export-service.ts`（`buildTransformFilter` の修正）

**変更内容:**

**A. `buildTransformFilter` に回転フィルタを追加**

- [x] `clip.transform.rotation` を取得し、0 以外の場合に FFmpeg フィルタを生成する
- [x] FFmpeg の `rotate` フィルタを使用してラジアン単位で角度を指定する:
  ```
  rotate=<angle_in_radians>:ow=rotw(<angle_in_radians>):oh=roth(<angle_in_radians>):c=black
  ```
  - `rotate` フィルタは入力をラジアン単位で受け取るため `rotation * PI / 180` に変換する
  - `ow=rotw(a):oh=roth(a)` で回転後のバウンディングボックスにフィット
  - `c=black` で回転で生じた余白を黒埋め
- [x] 回転後にキャンバスサイズへのリサイズ（pad + crop）を適用する:
  ```
  pad=w='max(iw,<width>)':h='max(ih,<height>)':x=(ow-iw)/2:y=(oh-ih)/2:color=black,
  crop=<width>:<height>:(iw-<width>)/2:(ih-<height>)/2
  ```
- [x] 回転は scale/translate より先に適用する（既存の scale → translate の順序の前に rotate を挿入）
- [x] `rotation === 0` の場合はフィルタを追加しない（既存動作を維持）

**B. 早期リターン条件の更新**

- [x] 現在の早期リターン条件 `tx === 0 && ty === 0 && scale === 1` に `rotation === 0` を追加する:
  ```typescript
  const rotation = clip.transform?.rotation ?? 0;
  if (tx === 0 && ty === 0 && scale === 1 && rotation === 0) return "";
  ```

**確認方法:**
- Rotation を指定したクリップをエクスポートし、出力動画に回転が正しく反映されること
- 90°/180°/270° および任意角度（例: 45°, -30°）で正しく動作すること
- Rotation 未指定のクリップのエクスポートに影響がないこと

### 103: Rotation UI の改善: 自由入力 + 回転ボタン

**背景:** 現在の Rotation UI は 0°/90°/180°/270° の 4 つのボタンのみ。ユーザーが -360〜360 の任意の整数を入力できるようにし、±90° 回転ボタンとリセットボタンを追加して操作性を向上させる。

**対象ファイル:**
- `app/frontend/src/components/editors/TransformEditor.tsx`（UI 修正）

**変更内容:**

**A. 数値入力フィールドの追加**

- [x] `ROTATIONS` 定数の 4 ボタンを削除し、代わりに `type="number"` の入力フィールドを追加する:
  ```tsx
  <input
    type="number"
    value={currentRotation}
    onChange={(e) => {
      const v = Math.max(-360, Math.min(360, Math.round(Number(e.target.value))));
      updateTransform({ rotation: v });
    }}
    min={-360}
    max={360}
    step={1}
    style={inputStyle}
  />
  ```
- [x] 入力値を -360〜360 の整数にクランプする

**B. 回転ボタンの追加**

- [x] 入力フィールドの横に 3 つのボタンを並べる:
  - **左回転 (↶)**: 現在の値から -90° する（-360 未満にならないようクランプ）
  - **右回転 (↷)**: 現在の値から +90° する（360 超にならないようクランプ）
  - **リセット (↺ / 0°)**: 回転を 0° にリセット
- [x] ボタンのレイアウト: 入力フィールドと同じ行に配置し、コンパクトにする:
  ```
  [↶] [↷] [ 数値入力 ] [リセット]
  ```

**C. プレビューとの整合性**

- [x] `computeMediaContainerStyle()` は既に任意の角度に対応しているため、変更不要であることを確認する

**確認方法:**
- -360〜360 の任意の整数値を入力でき、プレビューに即座に反映されること
- 左回転・右回転ボタンで 90° 単位の回転が正しく動作すること
- リセットボタンで 0° に戻ること
- 範囲外の値（-361, 361 等）が自動的にクランプされること

### 104: Rotation 改善のテスト・Story 更新

**背景:** タスク 102・103 の変更に対するテストと Storybook Story の追加・更新。

**対象ファイル:**
- `app/backend/src/services/export-service.test.ts`（テスト追加）
- `app/frontend/src/components/editors/TransformEditor.stories.tsx`（Story 更新）

**変更内容:**

**A. エクスポートの回転テスト追加** (`export-service.test.ts`)

- [x] `buildTransformFilter` の回転テストを追加:
  - `rotation: 90` → `rotate=rad:ow=iw:oh=ih:c=black` が含まれること
  - `rotation: 180` → `rotate=rad:ow=iw:oh=ih:c=black` が含まれること
  - `rotation: 45` → `rotate=rad:ow=iw:oh=ih:c=black` が含まれること
  - `rotation: -90` → 負の角度が正しく処理されること
  - `rotation: 0` / `rotation: undefined` → 回転フィルタが生成されないこと
- [x] `buildExportArgs` に回転付きクリップを含むプロジェクトのテストを追加:
  - 出力される filter_complex 文字列に rotate フィルタが含まれること

**B. TransformEditor の Story 更新** (`TransformEditor.stories.tsx`)

- [x] 数値入力フィールドで任意角度を入力する Story を追加
- [x] 左回転・右回転ボタンの操作を示す Story を追加
- [x] リセットボタンの動作を示す Story を追加
- [x] 既存の 90°/180° の Story が新 UI でも動作することを確認・更新

**確認方法:** `bun run test` と `cd app/frontend && bun run storybook` で全テスト・Story が正常動作すること

### 105: シークバーの画面下端延長 + トラック下部空白クリックシーク

**背景:** 現在のタイムライン UI では、プレイヘッド（シークバー）の縦線が最後のトラック行までしか描画されず、トラック下部の空白スペースではクリック・ドラッグによるシーク操作ができない。シークバーをタイムライン領域の下端まで延長し、空白領域でもクリック・ドラッグでシーク可能にすることで操作性を向上させる。

**対象ファイル:**
- `app/frontend/src/components/Timeline.tsx`（レイアウト・イベント修正）

**変更内容:**

**A. タイムライン内コンテナの高さをスクロール領域全体に拡張**

- [x] スクロール領域内の内側コンテナ（`position: relative` の div）に `display: "flex"`, `flexDirection: "column"`, `minHeight: "100%"` を追加し、スクロール領域の高さいっぱいに広げる
- [x] "Seek bar + Tracks wrapper"（`position: relative` の div）に `flex: 1` を追加し、トラック下部の残りスペースを埋める
- [x] これにより `Playhead` コンポーネント（`position: absolute`, `top: 0`, `bottom: 0`）が自動的にタイムライン領域の下端まで描画される

**B. トラック下部の空白領域でクリック・ドラッグシークを有効化**

- [x] "Seek bar + Tracks wrapper" div に `onMouseDown={handleRulerMouseDown}` を追加する
- [x] `TimelineClip` の `handleMouseDown` は既に `e.stopPropagation()` を呼んでいるため、クリップ上のクリックではシークが発動しないことを確認する
- [x] 空白領域のカーソルを `col-resize` に設定する（`cursor: "col-resize"` を wrapper に追加）

**確認方法:**
- タイムラインのプレイヘッド縦線がトラック下部の空白領域まで描画されること
- トラック下部の空白領域を左クリックするとその位置にシークすること
- 空白領域をドラッグするとシーク位置がマウスに追従すること
- クリップのクリック・ドラッグ操作（移動・トリム・選択）が従来通り動作すること

### 106: タスク 105 のテスト・Story 更新

**背景:** タスク 105 の変更に対するテストと Storybook Story の追加・更新。

**対象ファイル:**
- `app/frontend/src/components/Timeline.stories.tsx`（Story 更新）

**変更内容:**

**A. Timeline Story の更新**

- [x] 既存の Timeline Story がレイアウト変更後も正常に表示されることを確認・更新
- [x] トラック下部の空白領域が表示される Story を追加（少数トラックで高さに余裕がある状態）

**確認方法:** `cd app/frontend && bun run storybook` で全 Story が正常表示されること

### 107: 共有型の拡張 — Clip.clipKind・Clip.blendMode 追加 + Track.kind 廃止

**背景:** 現在のアーキテクチャでは `Track.kind`（"video" / "audio" / "title"）によりクリップの種類が決定されている。トラックをレイヤー管理の単位にするため、クリップ自身が種別（`clipKind`）を持つよう型を変更する。また、動画クリップのトラック間重なり合成方法を指定する `blendMode` フィールドを追加する。

**対象ファイル:**
- `app/shared/src/types/project.ts`（型定義変更）
- `app/shared/src/index.ts`（re-export 追加）

**変更内容:**

**A. Clip 型に clipKind フィールドを追加**

- [x] `Clip` 型に `clipKind: string` フィールドを追加する
- [x] `BuiltinClipKind` 型を定義する: `"video" | "audio" | "title" | "image"`

**B. Clip 型に blendMode フィールドを追加**

- [x] `Clip` 型に `blendMode?: string` フィールドを追加する（省略時は `"cover"` として扱う）
- [x] `BuiltinBlendMode` 型を定義する: `"cover"`（将来の拡張用に string ベース）

**C. Track 型から kind を削除**

- [x] `Track` 型から `kind: string` フィールドを削除する
- [x] `BuiltinTrackKind` 型を削除する

**D. マイグレーションユーティリティの追加**

- [x] `utils/migration.ts` に `migrateProject(project: unknown): Project` 関数を追加する
- [x] 旧形式（Track.kind あり・Clip.clipKind なし）のプロジェクトを新形式に変換する
  - Track.kind が "video" のクリップ → asset.kind に応じて clipKind を "video" / "image" に設定
  - Track.kind が "audio" のクリップ → clipKind を "audio" に設定
  - Track.kind が "title" のクリップ → clipKind を "title" に設定
- [x] `project-service.ts` の読み込み時にマイグレーションを適用する

**確認方法:** `bun run test` で既存テストが通ること。型変更に伴うコンパイルエラーを全て解消すること。

### 108: CompositeStrategy インターフェース設計 + CoverStrategy 実装

**背景:** 動画クリップがトラック間で重なる場合の合成方法を GoF Strategy パターンで設計する。Open/Closed 原則に従い、新しい合成方法を既存コードの修正なしに追加できるレジストリ方式とする。`blendMode` フィールドは「そのクリップが上に重なるとき」の合成方法を指定する。

**対象ファイル:**
- `app/shared/src/types/composite.ts`（新規: Strategy インターフェース定義）
- `app/frontend/src/lib/composite-strategy-registry.ts`（新規: フロントエンド用レジストリ）
- `app/frontend/src/lib/composite-strategies/cover-strategy.ts`（新規: Cover Strategy のプレビュー実装）
- `app/backend/src/lib/composite-strategy-registry.ts`（新規: バックエンド用レジストリ）
- `app/backend/src/lib/composite-strategies/cover-strategy.ts`（新規: Cover Strategy のエクスポート実装）
- `app/frontend/src/lib/builtin-plugin.ts`（Strategy 登録追加）
- `app/backend/src/lib/builtin-plugin.ts`（Strategy 登録追加）

**変更内容:**

**A. 共有型定義: CompositeStrategy インターフェース**

- [x] `app/shared/src/types/composite.ts` に以下を定義する:
  - `CompositeStrategyDescriptor`: `{ id: string; label: string }` — Strategy のメタデータ
- [x] `app/shared/src/index.ts` で re-export する

**B. フロントエンド: PreviewCompositeStrategy + レジストリ**

- [x] `PreviewCompositeStrategy` インターフェースを定義する:
  - `id: string` — blendMode と一致する識別子
  - `label: string` — UI 表示用ラベル
  - `containerStyle(ctx: { canvasW: number; canvasH: number }): CSSProperties` — 上レイヤーのコンテナに適用する CSS（opacity, mix-blend-mode 等）
- [x] `CompositeStrategyRegistry` クラスを作成する:
  - `register(strategy: PreviewCompositeStrategy): void`
  - `get(id: string): PreviewCompositeStrategy | undefined`
  - `all(): PreviewCompositeStrategy[]`
- [x] シングルトンインスタンス `compositeStrategyRegistry` をエクスポートする

**C. フロントエンド: CoverPreviewStrategy の実装**

- [x] `cover-strategy.ts` に `CoverPreviewStrategy` を実装する:
  - `id: "cover"`, `label: "Cover (覆い隠す)"`
  - `containerStyle()`: `{ position: "relative" }` を返す（上レイヤーが下を完全に覆う = 特殊なスタイル不要）

**D. バックエンド: ExportCompositeStrategy + レジストリ**

- [x] `ExportCompositeStrategy` インターフェースを定義する:
  - `id: string` — blendMode と一致する識別子
  - `buildOverlayFilter(bottomLabel: string, topLabel: string, enable: string): string` — FFmpeg overlay フィルタ式を生成
- [x] `CompositeStrategyRegistry` クラスを作成する（フロントエンドと同様の構造）
- [x] シングルトンインスタンス `exportCompositeStrategyRegistry` をエクスポートする

**E. バックエンド: CoverExportStrategy の実装**

- [x] `cover-strategy.ts` に `CoverExportStrategy` を実装する:
  - `id: "cover"`
  - `buildOverlayFilter(bottom, top, enable)`: `${bottom}${top}overlay=0:0:enable='${enable}'` を返す（上で下を完全に覆う）

**F. builtin-plugin への登録**

- [x] フロントエンド `builtin-plugin.ts` に `registerCompositeStrategies(registry)` を追加し、CoverPreviewStrategy を登録する
- [x] バックエンド `builtin-plugin.ts` に `registerCompositeStrategies(registry)` を追加し、CoverExportStrategy を登録する

**確認方法:** レジストリに Strategy が登録され、`get("cover")` で取得できること。`bun run test` で既存テストが通ること。

### 109: ClipKind レジストリの導入と TrackKind レジストリの廃止

**背景:** トラックがレイヤー管理の単位となり `Track.kind` が廃止されるため、既存の `TrackKindDescriptor` / `TrackKindRegistry` を `ClipKindDescriptor` / `ClipKindRegistry` に置き換える。各コンポーネントがクリップの種別を `clip.clipKind` から判定するようにする。

**対象ファイル:**
- `app/frontend/src/lib/clip-kind-registry.ts`（新規: TrackKindRegistry の後継）
- `app/frontend/src/lib/track-kind-registry.ts`（削除）
- `app/frontend/src/lib/builtin-plugin.ts`（登録先変更）
- `app/frontend/src/lib/plugin-loader.ts`（プラグインインターフェース変更）
- `app/frontend/src/components/TimelineClip.tsx`（track.kind → clip.clipKind 参照変更）
- `app/frontend/src/components/TimelineTrack.tsx`（トラックラベル表示変更）
- `app/frontend/src/components/InspectorPanel.tsx`（trackKind 参照変更）

**変更内容:**

**A. ClipKindDescriptor / ClipKindRegistry の作成**

- [ ] `clip-kind-registry.ts` に以下を定義する:
  - `ClipKindDescriptor`: `{ kind: string; label: string; clipColor: string; clipSelectedColor: string; hasSourceTrim: boolean; hasAsset: boolean }`（TrackKindDescriptor と同構造だがクリップ単位）
  - `ClipKindRegistry` クラス: `register()`, `get(kind)`, `all()`
  - シングルトン `clipKindRegistry` をエクスポート

**B. builtin-plugin の登録変更**

- [ ] `registerTrackKinds(registry)` を `registerClipKinds(registry)` に変更する
- [ ] 登録内容は同一（"video", "audio", "title"）だがクリップ種別としての登録に変更

**C. plugin-loader の変更**

- [ ] `FrontendPlugin` インターフェースの `registerTrackKinds` を `registerClipKinds` に変更する
- [ ] プラグイン読み込み処理で `clipKindRegistry` を渡すように変更する

**D. 全コンポーネントの参照変更**

- [ ] `TimelineClip.tsx`: `trackKindRegistry.get(track.kind)` → `clipKindRegistry.get(clip.clipKind)` に変更し、クリップ種別に応じた色を取得する
- [ ] `TimelineTrack.tsx`: トラックラベルを `track.kind` ベースの "V" / "A" / "T" からレイヤー番号（トラックインデックス + 1）に変更する
- [ ] `InspectorPanel.tsx`: `InspectorEditorContext.trackKind` → `InspectorEditorContext.clipKind`（= `clip.clipKind`）に変更する

**E. TrackKindRegistry の削除**

- [ ] `track-kind-registry.ts` を削除する
- [ ] 全 import パスを更新する

**確認方法:** `bun run test` でコンパイルが通り、既存テストが通ること。タイムラインのクリップ色とトラックラベルが正しく表示されること。

### 110: タイムライン UI の混在クリップ対応

**背景:** 1 トラックに複数種類のクリップ（動画・画像・テキスト・音声）を配置できるようにする。クリップの見た目はクリップ種別に応じて個別に描画される。トラック追加 UI とクリップ追加 UI を更新する。

**対象ファイル:**
- `app/frontend/src/components/Timeline.tsx`（トラック追加 UI 変更）
- `app/frontend/src/components/TimelineTrack.tsx`（混在表示対応）
- `app/frontend/src/components/TimelineClip.tsx`（クリップ種別に応じた表示）
- `app/frontend/src/components/EditorPage.tsx`（クリップ追加ロジック変更）

**変更内容:**

**A. トラック追加 UI の変更**

- [x] 現在のトラック種別ごとの追加ボタン（"Add Video Track" 等）を、単一の "Add Layer" ボタンに変更する
- [x] 新規トラック作成時に `kind` を指定しない（レイヤーとして作成）

**B. クリップ追加ロジックの変更**

- [x] アセットパネルからクリップを追加するとき、選択中のトラック（レイヤー）に追加する
- [x] トラックが未選択の場合は最も上のトラックに追加するか、新規トラックを作成する
- [x] テキストクリップ追加も同様に選択中トラックに追加する

**C. TimelineClip の種別別表示**

- [x] クリップの背景色を `clip.clipKind` に基づいて `clipKindRegistry` から取得する
- [x] クリップのアイコン（🎬 / 🖼 / 🔤 / 🎵 等）を `clipKind` に応じて表示する

**D. TimelineTrack の混在表示**

- [x] 1 トラック内に異なる `clipKind` のクリップが混在しても正しく描画されることを確認する
- [x] 各クリップが独立した色・アイコンで表示されることを確認する

**確認方法:** 1 つのトラックに動画クリップとテキストクリップを並べて配置できること。クリップ種別に応じた色分けが表示されること。

### 111: sequence-ops の混在トラック対応

**背景:** `sequence-ops.ts` の各操作関数は現在 `Track.kind` に基づいてクリップのルーティングを行っている。トラックがレイヤー単位になるため、クリップ追加先の決定方法を変更する。

**対象ファイル:**
- `app/frontend/src/lib/sequence-ops.ts`（追加・削除・移動ロジック変更）

**変更内容:**

**A. addClipFromAsset の変更**

- [x] 引数にオプショナルな `targetTrackId?: string` を追加する
- [x] `targetTrackId` が指定されていればそのトラックに追加する
- [x] 指定がなければ、最後のトラック（最上位レイヤー）の末尾に追加する
- [x] トラックが 1 つもなければ新規トラックを作成する（`kind` フィールドなし）
- [x] 作成するクリップに `clipKind` を設定する（`assetKindRegistry` の `kind` をそのまま使用。ただし `defaultTrackKind` が "video" のアセット種別は asset.kind を使う）

**B. addTextClip の変更**

- [x] 引数の `trackKind` を `targetTrackId?: string` に変更する
- [x] 指定トラックに追加する。指定がなければ新規トラックを作成する
- [x] 作成するクリップに `clipKind: "title"` を設定する

**C. removeClip の変更**

- [x] クリップ削除後に空になったトラックを削除するロジックは維持する

**D. moveClip の変更**

- [x] 同一トラック内の重なり防止ロジックは維持する
- [x] 将来的なトラック間移動（ドラッグでレイヤー変更）に備え、`targetTrackId` 引数をオプショナルで追加する（今回は未実装）

**確認方法:** `bun run test` で既存テストが通ること。異なる種類のクリップを同一トラックに追加できること。

### 112: Inspector の clipKind ベース判定 + BlendModeEditor 追加

**背景:** Inspector エディタの表示条件（`canHandle`）は現在 `ctx.trackKind` で判定している。これを `ctx.clipKind`（= `clip.clipKind`）ベースに変更する。また、動画クリップの合成方法を設定する `BlendModeEditor` を追加する。

**対象ファイル:**
- `app/frontend/src/lib/inspector-editor-registry.ts`（コンテキスト型変更）
- `app/frontend/src/lib/builtin-plugin.ts`（canHandle 条件更新）
- `app/frontend/src/components/editors/BlendModeEditor.tsx`（新規）
- `app/frontend/src/components/InspectorPanel.tsx`（clipKind 渡し変更）

**変更内容:**

**A. InspectorEditorContext の変更**

- [x] `trackKind: string` を `clipKind: string` に変更する

**B. 各エディタの canHandle 条件更新**

- [x] `TrimEditor`: `() => true` のまま維持（全クリップ共通）
- [x] `TextEditor`: `ctx.trackKind === "title"` → `ctx.clipKind === "title"` に変更
- [x] `TransformEditor`: `ctx.trackKind === "video"` → `ctx.clipKind === "video" || ctx.clipKind === "image"` に変更
- [x] `AudioVolumeEditor`: `ctx.trackKind === "audio"` → `ctx.clipKind === "audio"` に変更

**C. BlendModeEditor の新規作成**

- [x] `BlendModeEditor.tsx` コンポーネントを作成する
- [x] `canHandle`: `ctx.clipKind === "video" || ctx.clipKind === "image"`（映像系クリップのみ）
- [x] `compositeStrategyRegistry.all()` からドロップダウンの選択肢を生成する
- [x] 現在の `clip.blendMode ?? "cover"` を表示し、変更時に `onUpdate({ blendMode: value })` を呼ぶ
- [x] `order: 25`（TransformEditor の後）

**D. builtin-plugin への登録**

- [x] `registerInspectorEditors` に BlendModeEditor を追加する

**E. InspectorPanel の変更**

- [x] `InspectorEditorContext` に渡す値を `trackKind` から `clipKind: clip.clipKind` に変更する

**確認方法:** 動画クリップ選択時に BlendModeEditor が表示され、"Cover (覆い隠す)" が選択されていること。テキストクリップ選択時には BlendModeEditor が表示されないこと。

### 113: プレビューレンダラーのトラック間レイヤー合成対応

**背景:** プレビューレンダラーは現在、トラック種別ごとに 1 つのアクティブクリップを検索して描画している。レイヤーモデルでは、全トラックを下（インデックス 0）から上へ走査し、同一時間帯のアクティブな映像クリップをすべて合成して描画する必要がある。合成方法は各クリップの `blendMode` に基づく `CompositeStrategy` で決定する。

**対象ファイル:**
- `app/frontend/src/lib/preview-renderer-registry.ts`（findActiveClipInTracks の変更）
- `app/frontend/src/components/PreviewPlayer.tsx`（レイヤー合成描画の変更）
- `app/frontend/src/components/renderers/VideoClipRenderer.tsx`（複数クリップ対応）
- `app/frontend/src/components/renderers/ImageClipRenderer.tsx`（複数クリップ対応）
- `app/frontend/src/components/renderers/TextOverlayRenderer.tsx`（clipKind ベース検索対応）
- `app/frontend/src/lib/builtin-plugin.ts`（レンダラー登録変更）

**変更内容:**

**A. findActiveClipInTracks の変更**

- [ ] 現在の `trackKind` フィルタを `clipKind` フィルタに変更する
- [ ] 複数のアクティブクリップを返す `findAllActiveClips(project, timeMs, clipKind?, assetKind?): ActiveClip[]` を追加する
- [ ] 結果はトラック順序（インデックス昇順 = 下から上）で返す

**B. PreviewPlayer のレイヤー合成描画**

- [ ] 映像レンダラー（Video / Image）を各トラックの全アクティブクリップに対して描画するように変更する
- [ ] 描画順: トラックインデックス 0（最下層）から順に描画し、DOM の z-index でレイヤーを実現する
- [ ] 各クリップの `blendMode` に応じて `compositeStrategyRegistry.get(blendMode)` から CSS スタイルを取得し適用する
- [ ] テキストオーバーレイは最上位に描画する（従来通り）

**C. VideoClipRenderer / ImageClipRenderer の変更**

- [ ] 単一クリップではなく、アクティブクリップの配列を受け取るように変更する
- [ ] 各クリップを独立した `<div>` / `<video>` / `<img>` として描画する

**D. TextOverlayRenderer の変更**

- [ ] `track.kind === "title"` ではなく `clip.clipKind === "title"` でテキストクリップを検索するように変更する

**E. 再生制御の変更**

- [ ] 複数の動画クリップが同時にアクティブな場合、最上位の動画クリップの `<video>` 要素を基準に再生進行を制御する
- [ ] `videoRef` の管理を複数動画対応に拡張する（最上位の動画に追従）

**確認方法:** 2 つのトラックに動画クリップを配置し、重なり部分で上トラックの映像が下トラックを覆い隠すこと。重なりのない部分では各トラックの映像が独立して表示されること。

### 114: エクスポートのトラック間レイヤー合成対応

**背景:** エクスポート処理は現在、単一の video トラックの全クリップを concat で結合している。レイヤーモデルでは、各トラックの映像クリップを個別に処理した後、トラック順（下→上）で FFmpeg の `overlay` フィルタを使って合成する。合成方法はクリップの `blendMode` に基づく `ExportCompositeStrategy` で決定する。

**対象ファイル:**
- `app/backend/src/services/export-service.ts`（buildExportArgs の大幅変更）
- `app/backend/src/lib/export-handler-registry.ts`（必要に応じてインターフェース変更）
- `app/backend/src/lib/export-handlers/video-clip-handler.ts`（レイヤー対応）
- `app/backend/src/lib/export-handlers/image-clip-handler.ts`（レイヤー対応）
- `app/backend/src/lib/export-handlers/text-overlay-handler.ts`（clipKind ベース検索対応）
- `app/backend/src/lib/export-handlers/audio-mix-handler.ts`（clipKind ベース検索対応）

**変更内容:**

**A. buildExportArgs のレイヤー合成対応**

- [ ] 現在の「video トラック → concat」方式から「全トラック → レイヤー合成」方式に変更する
- [ ] 処理フロー:
  1. 全トラックを下（インデックス 0）から上へ走査する
  2. 各トラックの映像クリップ（clipKind が "video" / "image"）を時間順にソートする
  3. 各トラックの映像を時間位置に合わせた個別ストリームとして入力する
  4. トラック 0 のストリームをベースとし、トラック 1 以降のストリームを `overlay` フィルタで順に合成する
  5. 各 overlay のパラメータはクリップの `blendMode` に応じた `ExportCompositeStrategy` から生成する

**B. 各クリップの時間位置合わせ**

- [ ] 各映像クリップは `clip.startMs` / `clip.durationMs` に基づいて、タイムライン上の正しい位置で表示されるよう `overlay` フィルタの `enable` 条件を設定する
- [ ] 時間的に隙間がある場合は、下のレイヤーの映像がそのまま表示される

**C. テキストオーバーレイの変更**

- [ ] `track.kind === "title"` ではなく `clip.clipKind === "title"` でテキストクリップを全トラックから収集するように変更する

**D. オーディオミックスの変更**

- [ ] `track.kind === "audio"` ではなく `clip.clipKind === "audio"` でオーディオクリップを全トラックから収集するように変更する
- [ ] 映像クリップの音声トラックも全トラック分をミックスする

**確認方法:** 2 つのトラックに動画クリップを配置してエクスポートし、重なり部分で上トラックの映像が表示されること。音声が全トラック分ミックスされること。

### 115: レイヤーモデル移行のテスト・Story 追加

**背景:** タスク 107〜114 の全変更に対するテストと Storybook Story の追加・更新。

**対象ファイル:**
- `app/shared/src/__tests__/`（マイグレーション・型テスト追加）
- `app/frontend/src/components/*.stories.tsx`（Story 更新）
- `app/frontend/src/lib/__tests__/`（sequence-ops テスト更新）
- `app/backend/src/__tests__/`（export テスト更新）

**変更内容:**

**A. 共有型・マイグレーションのテスト**

- [ ] `migrateProject` が旧形式 → 新形式に正しく変換することのテスト
- [ ] `Clip.clipKind` / `Clip.blendMode` のデフォルト値テスト

**B. CompositeStrategy のテスト**

- [ ] `CoverPreviewStrategy` の `containerStyle()` テスト
- [ ] `CoverExportStrategy` の `buildOverlayFilter()` テスト
- [ ] レジストリの登録・取得テスト

**C. タイムライン Story の更新**

- [ ] 1 トラックに複数種類のクリップが混在する Story の追加
- [ ] 複数トラック（レイヤー）の Story の追加
- [ ] トラックラベルがレイヤー番号で表示される確認

**D. Inspector Story の更新**

- [ ] BlendModeEditor の Story 追加
- [ ] clipKind ベースの各エディタ表示条件テスト

**E. sequence-ops テストの更新**

- [ ] `addClipFromAsset` の `targetTrackId` 指定テスト
- [ ] 混在トラックへのクリップ追加テスト
- [ ] `addTextClip` の `targetTrackId` 指定テスト

**F. プレビューレンダラーのテスト**

- [ ] 複数トラックの映像クリップ重なりプレビュー Story の追加
- [ ] CoverStrategy 適用時のレイヤー表示テスト

**G. エクスポートのテスト**

- [ ] `buildExportArgs` の複数トラックレイヤー合成テスト
- [ ] 重なりあり・なし両方のケースのテスト
- [ ] テキスト・オーディオの clipKind ベース収集テスト

**確認方法:** `bun run test` で全テストが通ること。`cd app/frontend && bun run storybook` で全 Story が正常表示されること。
