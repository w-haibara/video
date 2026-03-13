# 72: 入力フィールド・見出し・ラベルスタイルの統一

現状: 入力フィールドの padding、見出しの h タグレベル・マージン、セクションラベルのスタイルがコンポーネント間で不統一。

目標:
- 共通の入力スタイル・見出しスタイルを `theme.ts` に定義し、全コンポーネントで適用する

**A. theme.ts に共通スタイルを追加** (`app/frontend/src/theme.ts`)
- [x] `inputStyle` オブジェクトを追加:
  - `{ background: theme.bgPanel, color: theme.text, border: "1px solid " + theme.border, borderRadius: radius.sm, padding: "4px 6px", fontSize: fontSize.md, boxSizing: "border-box" }`
- [x] `sectionHeadingStyle` を追加:
  - `{ fontSize: fontSize.heading3, fontWeight: 600, margin: "0 0 8px" }`

**B. InspectorPanel の inputStyle を theme から参照** (`app/frontend/src/components/InspectorPanel.tsx`)
- [x] L126-135: ローカル `inputStyle` を削除し、theme からの `inputStyle` を import

**C. CreateProjectDialog の入力フィールド統一** (`app/frontend/src/components/CreateProjectDialog.tsx`)
- [x] L55: `padding: "10px 12px"` → theme の `inputStyle` に合わせる（ダイアログ用に padding のみオーバーライド）

**D. EditorPage の Export ファイル名入力統一** (`app/frontend/src/pages/EditorPage.tsx`)
- [x] L229: `padding: "6px 8px"` → theme の `inputStyle` に合わせる

**E. ProjectSettingsPanel の入力フィールド統一** (`app/frontend/src/components/ProjectSettingsPanel.tsx`)
- [x] L38: ローカル `inputStyle` を削除し、theme からの `inputStyle` を import

**F. 見出しタグの統一**
- [x] `InspectorPanel.tsx` L55: `<h4>` → `<h3>` に変更し `sectionHeadingStyle` を適用
- [x] `AssetPanel.tsx` L59: `<h3>` の margin を `sectionHeadingStyle` に合わせる
- [x] `ProjectSettingsPanel.tsx` L45: `<h4>` → `<h3>` に変更、`sectionHeadingStyle` を適用
