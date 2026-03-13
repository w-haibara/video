# 111: sequence-ops の混在トラック対応

**背景:** `sequence-ops.ts` の各操作関数は現在 `Track.kind` に基づいてクリップのルーティングを行っている。トラックがレイヤー単位になるため、クリップ追加先の決定方法を変更する。

**対象ファイル:**
- `app/frontend/src/lib/sequence-ops.ts`（追加・削除・移動ロジック変更）

**変更内容:**

**A. addClipFromAsset の変更**

- [x] 引数にオプショナルな `targetTrackId?: string` を追加する
- [x] `targetTrackId` が指定されていればそのトラックに追加する
- [x] 指定がなければ、最後のトラック（最上位レイヤー）の末尾に追加する
- [x] トラックが 1 つもなければ新規トラックを作成する（`kind` フィールドなし）
- [x] 作成するクリップに `clipKind` を設定する（`assetKindRegistry` の `kind` をそのまま使用。ただし `defaultTrackKind` が "video" のアセット種別は asset.kind を使う）

**B. addTextClip の変更**

- [x] 引数の `trackKind` を `targetTrackId?: string` に変更する
- [x] 指定トラックに追加する。指定がなければ新規トラックを作成する
- [x] 作成するクリップに `clipKind: "title"` を設定する

**C. removeClip の変更**

- [x] クリップ削除後に空になったトラックを削除するロジックは維持する

**D. moveClip の変更**

- [x] 同一トラック内の重なり防止ロジックは維持する
- [x] 将来的なトラック間移動（ドラッグでレイヤー変更）に備え、`targetTrackId` 引数をオプショナルで追加する（今回は未実装）

**確認方法:** `bun run test` で既存テストが通ること。異なる種類のクリップを同一トラックに追加できること。
