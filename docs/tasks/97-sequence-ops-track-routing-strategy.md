# 97: sequence-ops のトラックルーティング Strategy 化

**背景:** `sequence-ops.ts` の `addClipFromAsset` (10〜14 行目) で `asset.kind === "audio" ? "audio" : "video"` というハードコードでトラックルーティングが行われ、`addTextClip` (163 行目) で `t.kind === "title"` が直書きされている。新しいアセット種別（例: subtitle, effect）を追加すると、このファイルの修正が必要になる。

**対象ファイル:**
- `app/frontend/src/lib/sequence-ops.ts`

**変更内容:**

**A. トラックルーティングの Strategy 化**

- [x] `addClipFromAsset` のトラック選択を `AssetKindRegistry.get(asset.kind).defaultTrackKind` で解決:
  ```typescript
  const descriptor = assetKindRegistry.get(asset.kind);
  const trackKind = descriptor?.defaultTrackKind ?? "video";
  let track = tracks.find((t) => t.kind === trackKind);
  ```
- [x] `addTextClip` のトラック選択を `"title"` 定数ではなく引数で受け取れるようにする（デフォルト値は `"title"`）

**B. クリップデフォルト値の外部化**

- [x] image アセットのデフォルト duration を `AssetKindDescriptor.defaultDurationMs` から取得:
  ```typescript
  const descriptor = assetKindRegistry.get(asset.kind);
  const durationMs = descriptor?.hasDuration
    ? (asset.durationMs ?? descriptor.defaultDurationMs ?? DEFAULT_IMAGE_DURATION_MS)
    : (descriptor?.defaultDurationMs ?? DEFAULT_IMAGE_DURATION_MS);
  ```

**確認方法:**
- クリップ追加の動作が完全に同一であること
- 新しいアセット種別を登録するとその `defaultTrackKind` に自動でルーティングされること
