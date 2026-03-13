# 86: タスク 84・85 のテスト追加

**背景:** タスク 84（scale > 1 pad エラー修正）と タスク 85（iPhone MOV 未対応ストリーム対策）の変更に対するユニットテストを追加する。

**対象ファイル:**
- `app/backend/src/services/export-service.test.ts`

**変更内容:**

**A. scale > 1 のテスト追加**
- [ ] scale > 1（例: 2.0）のクリップで `buildExportArgs` を実行し、フィルタチェーンに `scale=iw*2:ih*2` → `pad=w='max(iw,...` → `crop=W:H:...` が含まれることを確認
- [ ] scale > 1 + crop 併用時にエラーが発生しないことを確認
- [ ] scale < 1（例: 0.5）のクリップでも pad+crop パターンが正しく生成されることを確認

**B. -ignore_unknown オプションのテスト追加**
- [ ] 動画クリップの入力引数に `-ignore_unknown` が含まれることを確認
- [ ] 画像クリップの入力引数に `-ignore_unknown` が含まれないことを確認（画像には不要）

**C. stderr フィルタリングのテスト**
- [ ] `startExport` のエラーハンドリングは統合テストの範囲のため、ユニットテストでは `buildExportArgs` の出力検証に集中する

**確認方法:** `bun run test` で全テストが通ること
