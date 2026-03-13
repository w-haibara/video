# 84: buildTransformFilter の scale > 1 pad エラー修正

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
