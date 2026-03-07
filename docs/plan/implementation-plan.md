# Implementation Plan

## 技術スタック

| レイヤー | 技術 |
|----------|------|
| フロントエンド | React + TypeScript + Vite |
| バックエンド | Bun (`Bun.serve()`) |
| メディア処理 | FFmpeg / ffprobe (`Bun.spawn()`) |
| 共有型定義 | TypeScript (app/shared/) |
| テスト | Bun test (backend) + Vitest (frontend) |

## アーキテクチャ

```
[React UI]  ←→  [Vite dev server :5173]
                      ↓ proxy
               [Bun API server :3000]
                      ↓ Bun.spawn()
               [FFmpeg / ffprobe]
                      ↓
               [workspace/projects/]
```

- 開発時: Vite dev serverがAPIリクエストをBunサーバーにプロキシ
- 本番: Viteビルド成果物をBunから静的配信

## Phase 1: 基盤 + Import

目標: 素材をインポートしてサムネイル表示できる状態

### Backend
- [ ] Bunサーバー骨格（`Bun.serve()`、ルーティング）
- [ ] FFmpeg/ffprobe存在チェック
- [ ] Project CRUD API
- [ ] Asset import API（ファイル受信、コピー、メタデータ抽出）
- [ ] サムネイル生成
- [ ] Proxy生成（動画）
- [ ] HEIC → JPEG変換
- [ ] Job管理（status、progress、error）
- [ ] 静的ファイル配信（proxy、thumbnail）

### Frontend
- [ ] Vite + React セットアップ
- [ ] ホーム画面（プロジェクト一覧、新規作成）
- [ ] エディタ画面の枠組み
- [ ] アセットパネル（サムネイル一覧、ドラッグ&ドロップインポート）
- [ ] Job進捗表示

### Shared
- [ ] 型定義（Project, Asset, Sequence, Track, Clip, ExportPreset）
- [ ] ID生成ユーティリティ

## Phase 2: Timeline + Preview

目標: タイムラインでクリップを並べてプレビュー再生できる状態

### Backend
- [ ] プレビュー用マニフェスト生成（クリップ順序とproxy URLのリスト）

### Frontend
- [ ] タイムラインUI（クリップ表示、ドラッグ並べ替え）
- [ ] プレビュープレーヤー（proxy動画の連続再生）
- [ ] シークバー
- [ ] トリムUI（クリップの前後をドラッグ）
- [ ] インスペクター（選択クリップの情報表示・編集）
- [ ] Undo / Redo（JSONスナップショット + キーボードショートカット）
- [ ] 自動保存（debounce付きPUT）

## Phase 3: テロップ + BGM + Export

目標: テロップとBGMを追加してMP4を書き出せる状態

### Backend
- [ ] Export API（project.json → FFmpeg filtergraph組み立て → エンコード）
- [ ] Export job進捗（FFmpeg stderr パース）
- [ ] Export済みファイル一覧API

### Frontend
- [ ] テロップ追加UI（テキスト入力、位置・サイズ調整）
- [ ] テロップのタイムライン上での配置
- [ ] BGM追加UI（ファイル選択、開始位置、音量）
- [ ] 回転補正UI
- [ ] 簡易クロップUI
- [ ] Exportダイアログ（解像度選択、ファイル名、進捗表示）
- [ ] ジョブログ画面

## Phase 4: 安定化

目標: エラー処理を改善し、実用レベルにする

- [ ] エラーメッセージの改善
- [ ] 元素材欠損時のハンドリング
- [ ] project.jsonバリデーション
- [ ] キャッシュ手動削除UI
- [ ] プロジェクト削除UI
- [ ] パフォーマンス改善（大量クリップ時のタイムライン描画）
