# 52: Crop 初期値をアセットサイズに合わせる

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
