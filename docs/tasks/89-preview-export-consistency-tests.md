# 89: プレビュー・エクスポート一致性のテスト追加

**背景:** タスク 87（Crop 位置修正）と タスク 88（テキスト位置修正）の変更に対するテストを追加する。

**対象ファイル:**
- `app/frontend/src/components/PreviewPlayer.test.tsx`（既存 or 新規）
- `app/frontend/src/components/PreviewPlayer.stories.tsx`（既存 Story の更新）

**変更内容:**

**A. Crop 表示のテスト追加**

- [ ] crop 設定済みクリップの描画で、コンテナサイズが crop.width/crop.height ベースであることを確認するテスト
- [ ] crop 設定済みクリップの描画で、内部 video/img 要素に正しいオフセット（marginLeft, marginTop）が設定されていることを確認するテスト
- [ ] crop + scale 併用時のコンテナサイズが正しいことを確認するテスト
- [ ] crop なしのクリップで従来通りの表示（100% サイズ、オフセットなし）であることを確認するテスト

**B. テキストオーバーレイのテスト追加**

- [ ] テキストオーバーレイコンテナの padding が 40px であることを確認するテスト
- [ ] テキスト要素のデフォルト背景色が rgba(0,0,0,0.5) であることを確認するテスト
- [ ] テキスト要素の padding が 8px であることを確認するテスト

**C. Story の更新**

- [ ] Crop 設定済みクリップの Story を追加（crop 前後の表示比較用）
- [ ] テキストオーバーレイの Story が更新後のスタイルで表示されることを確認

**確認方法:** `bun run test` と `bun run storybook` で全テスト・Story が正常動作すること
