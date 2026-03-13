# 106: タスク 105 のテスト・Story 更新

**背景:** タスク 105 の変更に対するテストと Storybook Story の追加・更新。

**対象ファイル:**
- `app/frontend/src/components/Timeline.stories.tsx`（Story 更新）

**変更内容:**

**A. Timeline Story の更新**

- [x] 既存の Timeline Story がレイアウト変更後も正常に表示されることを確認・更新
- [x] トラック下部の空白領域が表示される Story を追加（少数トラックで高さに余裕がある状態）

**確認方法:** `cd app/frontend && bun run storybook` で全 Story が正常表示されること
