# 96: プレビュープレーヤーの描画 Strategy 化

**背景:** `PreviewPlayer.tsx` では `findActiveClip` (30〜44 行目) が `track.kind !== "video"` で video トラックのみをフィルタし、`findActiveTextClips` (46〜57 行目) が `track.kind !== "title"` で title トラックをフィルタしている。また再生ループ内 (224〜254 行目) で `asset.kind === "video"` / `asset.kind === "image"` の分岐がある。新しいトラック/アセット種別追加時にこのファイルを修正する必要がある。

**対象ファイル:**
- `app/frontend/src/lib/preview-renderer-registry.ts`（新規）
- `app/frontend/src/components/renderers/VideoClipRenderer.tsx`（新規）
- `app/frontend/src/components/renderers/ImageClipRenderer.tsx`（新規）
- `app/frontend/src/components/renderers/TextOverlayRenderer.tsx`（新規）
- `app/frontend/src/components/renderers/index.ts`（新規: 全レンダラ登録）
- `app/frontend/src/components/PreviewPlayer.tsx`（リファクタリング）

**変更内容:**

**A. プレビューレンダラインターフェースの定義** (`preview-renderer-registry.ts`)

- [x] `PreviewLayerRenderer` 型を定義:
  ```typescript
  type PreviewRenderContext = {
    project: Project;
    currentTimeMs: number;
    canvasW: number;
    canvasH: number;
    canvasScale: number;
    isPlaying: boolean;
  };

  type PreviewLayerRenderer = {
    id: string;
    zOrder: number;         // 描画レイヤー順（0: 最背面）
    findActiveContent: (ctx: PreviewRenderContext) => unknown | null;
    Component: React.ComponentType<{ content: unknown; ctx: PreviewRenderContext }>;
  };
  ```
- [x] `PreviewRendererRegistry` クラスを実装:
  - `register(renderer: PreviewLayerRenderer): void`
  - `all(): PreviewLayerRenderer[]`（zOrder 順でソート）

**B. 既存レンダラの分離**

- [x] video/image のメディアレンダラを `VideoClipRenderer` / `ImageClipRenderer` として抽出
- [x] テキストオーバーレイを `TextOverlayRenderer` として抽出
- [x] 各レンダラを `PreviewLayerRenderer` インターフェースに準拠させて登録

**C. PreviewPlayer のリファクタリング**

- [x] `findActiveClip` / `findActiveTextClips` を各レンダラの `findActiveContent` に移動
- [x] レンダリング部分をレジストリからの動的レイヤー合成に変更
- [x] 再生ループ内の `asset.kind` 分岐を Strategy の `tick` メソッドに委譲

**D. 再生ティック Strategy**

- [x] `PlaybackTickStrategy` インターフェースを定義:
  ```typescript
  type PlaybackTickStrategy = {
    assetKind: string;
    tick: (clip: ActiveClip, deltaMs: number, videoRef: HTMLVideoElement | null) => number; // 新しいタイムライン位置を返す
  };
  ```
- [x] video / image 用の tick strategy をそれぞれ実装し、レジストリに登録
- [x] 再生ループ内の if/else を strategy の dispatch に置換

**確認方法:**
- プレビュー再生（video, image, text）が完全に同一動作であること
- 新しいレンダラを `register()` で追加するとプレビューにレイヤーが追加されること
