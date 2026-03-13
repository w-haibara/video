# 71: ボタンスタイルの統一

現状: ボタンのスタイル（padding, fontSize, borderRadius）がコンポーネントごとに異なり、視覚的な一貫性がない。

目標:
- `theme.ts` にボタンスタイルのプリセットを定義し、全コンポーネントで統一する

**A. theme.ts にボタンスタイルプリセットを追加** (`app/frontend/src/theme.ts`)
- [x] `buttonStyle` オブジェクトを追加:
  - `primary`: `{ background: theme.button, color: theme.buttonText, border: "none", borderRadius: radius.md, padding: "6px 12px", fontSize: fontSize.md, cursor: "pointer" }`
  - `secondary`: `{ background: theme.bgDark, color: theme.text, border: "none", borderRadius: radius.md, padding: "6px 12px", fontSize: fontSize.md, cursor: "pointer" }`
  - `danger`: `{ background: theme.buttonDanger, color: theme.buttonText, ... }`
  - `small`: `{ padding: "2px 8px", fontSize: fontSize.sm }`（サイズバリアント）

**B. AssetPanel の Import ボタン統一** (`app/frontend/src/components/AssetPanel.tsx`)
- [x] L64-70: ボタンスタイルを `buttonStyle.primary` ベースに統一

**C. PreviewPlayer のトランスポートボタン統一** (`app/frontend/src/components/PreviewPlayer.tsx`)
- [x] L427, L461 等: トランスポートボタン（⏮, Play, etc.）のスタイルを `buttonStyle.secondary` ベースに統一
- [x] ホバー時の `background` を `theme.bgHover` に統一

**D. EditorPage の "+ Add Text" ボタン統一** (`app/frontend/src/pages/EditorPage.tsx`)
- [x] L202-211: `theme.clipText` 背景は意図的だが、padding/fontSize/borderRadius を `buttonStyle.primary` ベースに合わせる

**E. InspectorPanel のリセットボタン統一** (`app/frontend/src/components/InspectorPanel.tsx`)
- [x] L459, L526 等: `buttonStyle.small` + `secondary` ベースに統一

**F. CreateProjectDialog のボタン統一** (`app/frontend/src/components/CreateProjectDialog.tsx`)
- [x] L85-92: `buttonStyle.primary` ベースに統一（borderRadius を `radius.md` に）
