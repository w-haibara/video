# 120: トラック操作改善のテスト・Story 更新

**背景:** タスク 116〜119 の全変更に対するテストと Storybook Story の追加・更新。

**対象ファイル:**
- `app/frontend/src/lib/__tests__/sequence-ops.test.ts`（moveClip トラック間移動・removeTrack テスト追加）
- `app/frontend/src/components/*.stories.tsx`（Timeline・TimelineTrack Story 更新）
- `app/frontend/src/components/ConfirmDialog.stories.tsx`（新規 Story）

**変更内容:**

**A. sequence-ops のテスト追加**

- [x] `moveClip` に `targetTrackId` を指定してトラック間移動するテスト
- [x] 移動先トラックでの重なり防止テスト
- [x] 元トラックが空になった場合の自動削除テスト
- [x] `removeTrack` の正常削除テスト
- [x] `removeTrack` で存在しないトラック ID を指定した場合のテスト

**B. Timeline Story の更新**

- [x] クリップのトラック間ドラッグ移動を確認できる Story の追加
- [x] トラック末尾の「+」ボタン表示を確認する Story の追加
- [x] トラックヘッダー右クリックメニュー表示を確認する Story の追加

**C. ConfirmDialog の Story 追加**

- [x] ConfirmDialog の基本表示 Story
- [x] ConfirmDialog の操作確認 Story（OK / キャンセル）

**D. TimelineTrack Story の更新**

- [x] トラックヘッダーの右クリックメニュー対応 Story の追加

**確認方法:** `bun run test` で全テストが通ること。`cd app/frontend && bun run storybook` で全 Story が正常表示されること。
