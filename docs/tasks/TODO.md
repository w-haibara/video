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
