# 87: プレビューの Crop 表示位置をエクスポートと一致させる

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
