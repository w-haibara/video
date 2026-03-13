# 80: エクスポートのキャンバスサイズ対応

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
