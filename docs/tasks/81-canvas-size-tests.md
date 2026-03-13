# 81: キャンバスサイズ機能のテスト・Story 更新

**背景:** キャンバスサイズ機能の追加に伴い、テストデータとストーリーを更新する。

**対象ファイル:**
- `app/frontend/src/stories/fixtures.ts`
- `app/frontend/src/components/ProjectSettingsPanel.stories.tsx`
- `app/frontend/src/components/PreviewPlayer.stories.tsx`
- `app/frontend/src/components/EditorLayout.stories.tsx`
- `app/frontend/src/pages/EditorPage.stories.tsx`
- `app/backend/src/services/__tests__/` (export-service テスト)

**変更内容:**
- [x] `fixtures.ts` のモックプロジェクトデータに `canvasWidth` / `canvasHeight` を追加
- [x] ProjectSettingsPanel Story にキャンバスサイズプリセット選択のインタラクションテスト追加
- [x] PreviewPlayer Story にキャンバスサイズバリエーション追加（16:9、9:16、1:1）
- [x] EditorPage / EditorLayout Story のモックデータ更新
- [x] export-service テストにキャンバスサイズ考慮のケース追加（大きい素材、小さい素材）

**確認方法:** `bun run test` と `bun run storybook` で全テスト・Story が正常動作すること
