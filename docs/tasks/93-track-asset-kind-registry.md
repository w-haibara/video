# 93: TrackKind / AssetKind レジストリの導入

**背景:** 現在 `TrackKind` は `"video" | "audio" | "title"` のリテラル型、`AssetKind` は `"video" | "image" | "audio"` のリテラル型でハードコードされており、新しい種別を追加するたびにコードベース全体の条件分岐を修正する必要がある。種別ごとのメタデータ（ラベル、色、対応エディタ、レンダラ等）を一元管理するレジストリを導入し、後続タスクの基盤とする。

**対象ファイル:**
- `app/shared/src/types/track-kind.ts`（新規）
- `app/shared/src/types/asset-kind.ts`（新規）
- `app/frontend/src/lib/track-kind-registry.ts`（新規）
- `app/frontend/src/lib/asset-kind-registry.ts`（新規）
- `app/shared/src/types/project.ts`（型の参照元を更新）
- `app/shared/src/types/asset.ts`（型の参照元を更新）

**変更内容:**

**A. TrackKind レジストリの定義** (`track-kind-registry.ts`)

- [ ] `TrackKindDescriptor` 型を定義:
  ```typescript
  type TrackKindDescriptor = {
    kind: string;
    label: string;            // タイムラインラベル（例: "V", "A", "T"）
    clipColor: string;        // クリップのデフォルト背景色
    clipSelectedColor: string;
    hasSourceTrim: boolean;   // ソーストリム編集の有無
    hasAsset: boolean;        // アセット紐付きか（title は false）
  };
  ```
- [ ] `TrackKindRegistry` クラスを実装:
  - `register(descriptor: TrackKindDescriptor): void`
  - `get(kind: string): TrackKindDescriptor | undefined`
  - `all(): TrackKindDescriptor[]`
- [ ] デフォルトの 3 種別（video, audio, title）を登録
- [ ] シングルトンエクスポート: `export const trackKindRegistry = new TrackKindRegistry()`

**B. AssetKind レジストリの定義** (`asset-kind-registry.ts`)

- [ ] `AssetKindDescriptor` 型を定義:
  ```typescript
  type AssetKindDescriptor = {
    kind: string;
    label: string;
    extensions: string[];       // 対応拡張子（例: [".mp4", ".mov"]）
    mimePatterns: string[];     // MIME パターン（例: ["video/*"]）
    defaultTrackKind: string;   // この種別がドロップされるデフォルトトラック
    hasDuration: boolean;       // 時間長があるか（image は false）
    defaultDurationMs?: number; // image 等のデフォルト時間長
  };
  ```
- [ ] `AssetKindRegistry` クラスを実装:
  - `register(descriptor: AssetKindDescriptor): void`
  - `get(kind: string): AssetKindDescriptor | undefined`
  - `detectByExtension(ext: string): AssetKindDescriptor | undefined`
  - `all(): AssetKindDescriptor[]`
- [ ] デフォルトの 3 種別（video, image, audio）を登録

**C. 既存の型定義を拡張可能にする**

- [ ] `Track.kind` の型を `string` に拡張（ランタイムバリデーションはレジストリで行う）
- [ ] `AssetKind` の型を `string` に拡張
- [ ] 既存コードとの互換性を維持するために `"video" | "audio" | "title"` のユーティリティ型も残す

**確認方法:**
- 既存の全テストが変更なく通ること
- `trackKindRegistry.get("video")` 等でメタデータが取得できること
- レジストリに新しい種別を `register()` で追加できること
