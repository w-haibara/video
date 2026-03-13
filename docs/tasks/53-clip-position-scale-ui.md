# 53: クリップの位置・拡大縮小 UI とプレビュー対応

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
