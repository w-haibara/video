# 79: プレビュープレーヤーのキャンバスサイズ対応

**背景:** プレビュー表示をキャンバスサイズに基づく固定アスペクト比で行い、素材がキャンバスからはみ出す場合はクロップ、小さい場合は黒背景にセンタリングする。

**対象ファイル:**
- `app/frontend/src/components/PreviewPlayer.tsx`
- `app/frontend/src/components/PreviewPlayer.stories.tsx`

**変更内容:**
- [x] プレビュー表示領域をキャンバスのアスペクト比（canvasWidth:canvasHeight）で固定
  - 親コンテナ内で letterbox/pillarbox 表示（黒帯で余白を埋める）
- [x] 素材の表示サイズをキャンバスサイズとの比率で計算
  - `displayWidth = (assetWidth / canvasWidth) * containerWidth`
  - `displayHeight = (assetHeight / canvasHeight) * containerHeight`
- [x] 素材がキャンバスより大きい場合: `overflow: hidden` ではみ出し部分を非表示（自動クロップ効果）
- [x] 素材がキャンバスより小さい場合: 黒背景にセンタリング表示
- [x] クリップの transform (position/scale) をキャンバス座標系で適用
- [x] Storybook の Story を更新（異なるキャンバスサイズでの表示確認用バリエーション追加）

**確認方法:** プレビューで以下を確認
- 1920×1080 キャンバスに 4K 素材 → 画面内に収まり、はみ出し部分がクロップ
- 1920×1080 キャンバスに 640×480 素材 → 黒背景の中央に小さく表示
- 1080×1080 正方形キャンバスでの表示
