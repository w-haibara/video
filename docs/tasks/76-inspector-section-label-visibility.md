# 76: InspectorPanel セクションラベルの視認性改善

**背景:** InspectorPanel の「File」「Type」「Rotation」「Position」「Scale」「Crop」「Trim」等のラベルが `theme.textMuted`（#939F91）で表示されており、ライト背景（#FDF6E3）に対してコントラストが不十分で視認性が悪い。

**対象ファイル:** `app/frontend/src/components/InspectorPanel.tsx`

**問題箇所:** セクション見出し `<label>` と情報テーブル `<td>` で `theme.textMuted` を使用
- L204: Trim ラベル
- L271: Text ラベル
- L388: Rotation ラベル
- L403: Position ラベル
- L429: Scale ラベル
- L451: Crop ラベル
- L536: Position ラベル (StartEndEditor)
- L570: Row コンポーネント (File, Type, Size, Codec)

**修正方針:** これらのラベルの色を `theme.textMuted`（#939F91）→ `theme.text`（#5C6A72）に変更する。`theme.text` は本文テキスト色であり、背景色との十分なコントラストがある。

**確認方法:** Storybook InspectorPanel (`components-inspectorpanel--video-clip`) でラベルの視認性を確認
