# 75: テーマフォントサイズの一段階拡大

**背景:** Theme Overview の Typography セクションで、全体的にフォントサイズが小さいため一回り大きくしたい。

**対象ファイル:** `app/frontend/src/theme.ts` (L78-88 `fontSize` 定数)

**変更内容:**
- [x] `xs`: 10px → 11px
- [x] `sm`: 11px → 12px
- [x] `md`: 12px → 13px
- [x] `lg`: 13px → 14px
- [x] `xl`: 14px → 16px
- [x] `heading3`: 16px → 18px
- [x] `heading2`: 18px → 20px
- [x] `heading1`: 20px → 22px

**確認方法:** Storybook Theme Overview (`theme--overview`) で Typography セクションの表示を確認
