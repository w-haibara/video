# 82: エクスポートへの clip.crop 反映

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
