# 83: エクスポート crop のテスト追加

**背景:** タスク 82 の変更に対するユニットテストを追加する。

**対象ファイル:**
- `app/backend/src/services/export-service.test.ts`

**変更内容:**
- [x] crop 設定ありのクリップでフィルタに `crop=W:H:X:Y` が含まれることを確認するテスト
- [x] crop 未設定のクリップでフィルタに余分な crop が追加されないことを確認するテスト
- [x] crop + transform 併用時にフィルタ順序が正しいことを確認するテスト
- [x] 画像クリップの crop テスト

**確認方法:** `bun run test` で全テストが通ること
