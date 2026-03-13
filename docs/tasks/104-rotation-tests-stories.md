# 104: Rotation 改善のテスト・Story 更新

**背景:** タスク 102・103 の変更に対するテストと Storybook Story の追加・更新。

**対象ファイル:**
- `app/backend/src/services/export-service.test.ts`（テスト追加）
- `app/frontend/src/components/editors/TransformEditor.stories.tsx`（Story 更新）

**変更内容:**

**A. エクスポートの回転テスト追加** (`export-service.test.ts`)

- [x] `buildTransformFilter` の回転テストを追加:
  - `rotation: 90` → `rotate=rad:ow=iw:oh=ih:c=black` が含まれること
  - `rotation: 180` → `rotate=rad:ow=iw:oh=ih:c=black` が含まれること
  - `rotation: 45` → `rotate=rad:ow=iw:oh=ih:c=black` が含まれること
  - `rotation: -90` → 負の角度が正しく処理されること
  - `rotation: 0` / `rotation: undefined` → 回転フィルタが生成されないこと
- [x] `buildExportArgs` に回転付きクリップを含むプロジェクトのテストを追加:
  - 出力される filter_complex 文字列に rotate フィルタが含まれること

**B. TransformEditor の Story 更新** (`TransformEditor.stories.tsx`)

- [x] 数値入力フィールドで任意角度を入力する Story を追加
- [x] 左回転・右回転ボタンの操作を示す Story を追加
- [x] リセットボタンの動作を示す Story を追加
- [x] 既存の 90°/180° の Story が新 UI でも動作することを確認・更新

**確認方法:** `bun run test` と `cd app/frontend && bun run storybook` で全テスト・Story が正常動作すること
