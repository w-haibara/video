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
| 59 | エクスポート時のクリップフリーズ・尺ずれバグ修正 | [ ] Todo | 15, 57 |

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
