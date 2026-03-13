# 115: レイヤーモデル移行のテスト・Story 追加

**背景:** タスク 107〜114 の全変更に対するテストと Storybook Story の追加・更新。

**対象ファイル:**
- `app/shared/src/__tests__/`（マイグレーション・型テスト追加）
- `app/frontend/src/components/*.stories.tsx`（Story 更新）
- `app/frontend/src/lib/__tests__/`（sequence-ops テスト更新）
- `app/backend/src/__tests__/`（export テスト更新）

**変更内容:**

**A. 共有型・マイグレーションのテスト**

- [x] `migrateProject` が旧形式 → 新形式に正しく変換することのテスト
- [x] `Clip.clipKind` / `Clip.blendMode` のデフォルト値テスト

**B. CompositeStrategy のテスト**

- [x] `CoverPreviewStrategy` の `containerStyle()` テスト
- [x] `CoverExportStrategy` の `buildOverlayFilter()` テスト
- [x] レジストリの登録・取得テスト

**C. タイムライン Story の更新**

- [x] 1 トラックに複数種類のクリップが混在する Story の追加
- [x] 複数トラック（レイヤー）の Story の追加
- [x] トラックラベルがレイヤー番号で表示される確認

**D. Inspector Story の更新**

- [x] BlendModeEditor の Story 追加
- [x] clipKind ベースの各エディタ表示条件テスト

**E. sequence-ops テストの更新**

- [x] `addClipFromAsset` の `targetTrackId` 指定テスト
- [x] 混在トラックへのクリップ追加テスト
- [x] `addTextClip` の `targetTrackId` 指定テスト

**F. プレビューレンダラーのテスト**

- [x] 複数トラックの映像クリップ重なりプレビュー Story の追加
- [x] CoverStrategy 適用時のレイヤー表示テスト

**G. エクスポートのテスト**

- [x] `buildExportArgs` の複数トラックレイヤー合成テスト
- [x] 重なりあり・なし両方のケースのテスト
- [x] テキスト・オーディオの clipKind ベース収集テスト

**確認方法:** `bun run test` で全テストが通ること。`cd app/frontend && bun run storybook` で全 Story が正常表示されること。
