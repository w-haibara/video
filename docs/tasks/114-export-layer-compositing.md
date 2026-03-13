# 114: エクスポートのトラック間レイヤー合成対応

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

- [x] 現在の「video トラック → concat」方式から「全トラック → レイヤー合成」方式に変更する
- [x] 処理フロー:
  1. 全トラックを下（インデックス 0）から上へ走査する
  2. 各トラックの映像クリップ（clipKind が "video" / "image"）を時間順にソートする
  3. 各トラックの映像を時間位置に合わせた個別ストリームとして入力する
  4. トラック 0 のストリームをベースとし、トラック 1 以降のストリームを `overlay` フィルタで順に合成する
  5. 各 overlay のパラメータはクリップの `blendMode` に応じた `ExportCompositeStrategy` から生成する

**B. 各クリップの時間位置合わせ**

- [x] 各映像クリップは `clip.startMs` / `clip.durationMs` に基づいて、タイムライン上の正しい位置で表示されるよう `overlay` フィルタの `enable` 条件を設定する
- [x] 時間的に隙間がある場合は、下のレイヤーの映像がそのまま表示される

**C. テキストオーバーレイの変更**

- [x] `track.kind === "title"` ではなく `clip.clipKind === "title"` でテキストクリップを全トラックから収集するように変更する

**D. オーディオミックスの変更**

- [x] `track.kind === "audio"` ではなく `clip.clipKind === "audio"` でオーディオクリップを全トラックから収集するように変更する
- [x] 映像クリップの音声トラックも全トラック分をミックスする

**確認方法:** 2 つのトラックに動画クリップを配置してエクスポートし、重なり部分で上トラックの映像が表示されること。音声が全トラック分ミックスされること。
