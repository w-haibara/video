# 116: sequence-ops のトラック操作拡張 — moveClipToTrack・removeTrack

**背景:** クリップのトラック間移動とトラック削除を実現するために、まず純粋関数レイヤー（sequence-ops）に必要な操作を追加する。既存の `moveClip` 関数は `targetTrackId` 引数を受け取れるが、実際のトラック間移動ロジックは未実装。また、トラック削除は `removeClip` のようにクリップ削除後の空トラック自動除去しかなく、トラック自体を明示的に削除する関数がない。GoF の Strategy パターンに沿い、移動先トラックの重なり判定は既存の `findNonOverlappingPosition` を再利用する（Open/Closed 原則: 新関数の追加のみで既存関数は変更しない）。

**対象ファイル:**
- `app/frontend/src/lib/sequence-ops.ts`（moveClip 拡張・removeTrack 追加）

**変更内容:**

**A. moveClip のトラック間移動対応**

- [x] `moveClip` に `targetTrackId` が指定された場合、クリップを元トラックから削除し、対象トラックに移動するロジックを追加する
- [x] 移動先トラックで `findNonOverlappingPosition` を適用し、重なりを防止する
- [x] 元トラックが空になった場合は自動削除する（既存の `removeClip` と同じ方針）
- [x] `targetTrackId` が未指定の場合は従来通り同一トラック内での移動とする（後方互換性維持）

**B. removeTrack 関数の追加**

- [x] `removeTrack(sequence: Sequence, trackId: string): Sequence` — 指定トラックとそのクリップをすべて削除する
- [x] トラックが 1 つしかない場合の動作を定義する（空の sequence を返す）

**確認方法:** `bun run test` で既存テストが通ること。新しい関数が正しく動作すること。
