# 109: ClipKind レジストリの導入と TrackKind レジストリの廃止

**背景:** トラックがレイヤー管理の単位となり `Track.kind` が廃止されるため、既存の `TrackKindDescriptor` / `TrackKindRegistry` を `ClipKindDescriptor` / `ClipKindRegistry` に置き換える。各コンポーネントがクリップの種別を `clip.clipKind` から判定するようにする。

**対象ファイル:**
- `app/frontend/src/lib/clip-kind-registry.ts`（新規: TrackKindRegistry の後継）
- `app/frontend/src/lib/track-kind-registry.ts`（削除）
- `app/frontend/src/lib/builtin-plugin.ts`（登録先変更）
- `app/frontend/src/lib/plugin-loader.ts`（プラグインインターフェース変更）
- `app/frontend/src/components/TimelineClip.tsx`（track.kind → clip.clipKind 参照変更）
- `app/frontend/src/components/TimelineTrack.tsx`（トラックラベル表示変更）
- `app/frontend/src/components/InspectorPanel.tsx`（trackKind 参照変更）

**変更内容:**

**A. ClipKindDescriptor / ClipKindRegistry の作成**

- [x] `clip-kind-registry.ts` に以下を定義する:
  - `ClipKindDescriptor`: `{ kind: string; label: string; clipColor: string; clipSelectedColor: string; hasSourceTrim: boolean; hasAsset: boolean }`（TrackKindDescriptor と同構造だがクリップ単位）
  - `ClipKindRegistry` クラス: `register()`, `get(kind)`, `all()`
  - シングルトン `clipKindRegistry` をエクスポート

**B. builtin-plugin の登録変更**

- [x] `registerTrackKinds(registry)` を `registerClipKinds(registry)` に変更する
- [x] 登録内容は同一（"video", "audio", "title"）だがクリップ種別としての登録に変更

**C. plugin-loader の変更**

- [x] `FrontendPlugin` インターフェースの `registerTrackKinds` を `registerClipKinds` に変更する
- [x] プラグイン読み込み処理で `clipKindRegistry` を渡すように変更する

**D. 全コンポーネントの参照変更**

- [x] `TimelineClip.tsx`: `trackKindRegistry.get(track.kind)` → `clipKindRegistry.get(clip.clipKind)` に変更し、クリップ種別に応じた色を取得する
- [x] `TimelineTrack.tsx`: トラックラベルを `track.kind` ベースの "V" / "A" / "T" からレイヤー番号（トラックインデックス + 1）に変更する
- [x] `InspectorPanel.tsx`: `InspectorEditorContext.trackKind` → `InspectorEditorContext.clipKind`（= `clip.clipKind`）に変更する

**E. TrackKindRegistry の削除**

- [x] `track-kind-registry.ts` を削除する
- [x] 全 import パスを更新する

**確認方法:** `bun run test` でコンパイルが通り、既存テストが通ること。タイムラインのクリップ色とトラックラベルが正しく表示されること。
