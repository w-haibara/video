# 99: エクスポートのトラック/アセットハンドラ Strategy 化

**背景:** `export-service.ts` の `buildExportArgs` は 300 行超の巨大関数で、video (129 行目) / image (140 行目) / title (159 行目) / audio (192 行目以降) のトラック/アセット種別ごとのロジックが if/else で密結合している。新しいトラック種別（例: subtitle）やアセット種別の追加、フィルタ制御の追加のたびにこの関数全体を理解・修正する必要がある。

**対象ファイル:**
- `app/backend/src/lib/export-handler-registry.ts`（新規）
- `app/backend/src/lib/export-handlers/video-clip-handler.ts`（新規）
- `app/backend/src/lib/export-handlers/image-clip-handler.ts`（新規）
- `app/backend/src/lib/export-handlers/text-overlay-handler.ts`（新規）
- `app/backend/src/lib/export-handlers/audio-mix-handler.ts`（新規）
- `app/backend/src/lib/export-handlers/index.ts`（新規: 全ハンドラ登録）
- `app/backend/src/services/export-service.ts`（リファクタリング）

**変更内容:**

**A. エクスポートハンドラインターフェースの定義** (`export-handler-registry.ts`)

- [x] `ExportClipHandler` 型を定義（ビジュアルクリップ用）:
  ```typescript
  type ExportBuildContext = {
    project: Project;
    preset: ExportPreset;
    assetsBase: string;
    inputArgs: string[];
    filterParts: string[];
    inputIndex: number;       // 現在の FFmpeg 入力インデックス
  };

  type ExportClipHandler = {
    assetKind: string;
    buildInput: (clip: Clip, asset: Asset, ctx: ExportBuildContext) => void;
    // inputArgs, filterParts を ctx に push し、inputIndex をインクリメント
  };
  ```
- [x] `ExportOverlayHandler` 型を定義（テキスト等のオーバーレイ用）:
  ```typescript
  type ExportOverlayHandler = {
    trackKind: string;
    buildOverlay: (clips: Clip[], ctx: ExportBuildContext, videoOutLabel: string) => string;
    // filterParts を ctx に push し、新しい videoOut ラベルを返す
  };
  ```
- [x] `ExportAudioHandler` 型を定義（オーディオミキシング用）:
  ```typescript
  type ExportAudioHandler = {
    trackKind: string;
    buildAudio: (clips: Clip[], ctx: ExportBuildContext, videoClips: Clip[]) => string;
    // filterParts を ctx に push し、audioOut ラベルを返す（空文字 = 音声なし）
  };
  ```
- [x] `ExportHandlerRegistry` を実装:
  - `registerClipHandler(handler: ExportClipHandler): void`
  - `registerOverlayHandler(handler: ExportOverlayHandler): void`
  - `registerAudioHandler(handler: ExportAudioHandler): void`

**B. 既存ロジックのハンドラ分離**

- [x] `video-clip-handler.ts`: video アセットの FFmpeg 入力・フィルタ構築（現在の 129〜139 行目）を移行
- [x] `image-clip-handler.ts`: image アセットの FFmpeg 入力・フィルタ構築（現在の 140〜149 行目）を移行
- [x] `text-overlay-handler.ts`: drawtext フィルタ構築（現在の 159〜187 行目）を移行
- [x] `audio-mix-handler.ts`: オーディオストリーム結合・BGM ミキシング（現在の 192〜287 行目）を移行

**C. buildExportArgs のリファクタリング**

- [x] `buildExportArgs` をオーケストレータとしてリファクタリング:
  1. video トラックのクリップをループし、`clipHandlerRegistry.get(asset.kind).buildInput()` を呼ぶ
  2. concat フィルタを構築
  3. overlay ハンドラを順番に適用
  4. audio ハンドラを適用
  5. 出力引数を構築
- [x] 各ハンドラは独立してテスト可能であること

**確認方法:**
- `buildExportArgs` のテストが全て変更なく通ること
- エクスポート結果の映像・音声が完全に同一であること
