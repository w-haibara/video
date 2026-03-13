# 101: リファクタリング全体のテスト・Story 更新

**背景:** タスク 93〜99 のリファクタリングに伴い、既存テストの更新と新しいレジストリ・Strategy のユニットテストを追加する。

**対象ファイル:**
- `app/frontend/src/lib/track-kind-registry.test.ts`（新規）
- `app/frontend/src/lib/asset-kind-registry.test.ts`（新規）
- `app/frontend/src/lib/inspector-editor-registry.test.ts`（新規）
- `app/frontend/src/lib/preview-renderer-registry.test.ts`（新規）
- `app/backend/src/lib/asset-detector-registry.test.ts`（新規）
- `app/backend/src/lib/export-handler-registry.test.ts`（新規）
- `app/frontend/src/components/editors/*.stories.tsx`（新規: 分離された各エディタの Story）
- 既存テスト・Story の更新（import パス変更等）

**変更内容:**

**A. レジストリのユニットテスト**

- [x] `track-kind-registry.test.ts`:
  - デフォルト 3 種別が登録されていること
  - `register` で新しい種別が追加できること
  - `get` で未登録の種別は `undefined` を返すこと
- [x] `asset-kind-registry.test.ts`:
  - `detectByExtension` が正しい種別を返すこと
  - 未知の拡張子は `undefined` を返すこと
- [x] `inspector-editor-registry.test.ts`:
  - `getEditorsFor` が `canHandle` でフィルタされること
  - `order` 順でソートされること
- [x] `preview-renderer-registry.test.ts`:
  - `all()` が `zOrder` 順で返すこと
- [x] `asset-detector-registry.test.ts`:
  - `priority` 順に評価されること
  - 全ディテクタが null を返した場合のフォールバック
- [x] `export-handler-registry.test.ts`:
  - 各ハンドラが正しい FFmpeg フィルタを生成すること
  - 複数ハンドラの合成が正しく動作すること

**B. 分離されたエディタの Story**

- [x] `TrimEditor.stories.tsx`: video / audio / title クリップそれぞれの Story
- [x] `TextEditor.stories.tsx`: テキスト編集の Story
- [x] `TransformEditor.stories.tsx`: Transform + Crop 編集の Story
- [x] `AudioVolumeEditor.stories.tsx`: 音量スライダーの Story

**C. 既存テストの更新**

- [x] import パスの変更に伴う既存テストファイルの修正
- [x] `buildExportArgs` テストが新しい内部構造でも同一の結果を返すことを確認
- [x] `sequence-ops` テストが同一の結果を返すことを確認

**確認方法:** `bun run test` と `cd app/frontend && bun run storybook` で全テスト・Story が正常動作すること
