# 98: アセット種別検出のプラグイン化

**背景:** `asset-service.ts` の `detectKind` (11〜16 行目) で拡張子のハードコードリストにより種別判定しており、未知の拡張子はすべて `"image"` にフォールバックする。新しいファイル形式（PSD, SVG, GIF アニメ, FLAC 等）に対応するにはこの関数を修正する必要がある。

**対象ファイル:**
- `app/backend/src/lib/asset-detector-registry.ts`（新規）
- `app/backend/src/lib/asset-detectors/extension-detector.ts`（新規）
- `app/backend/src/lib/asset-detectors/index.ts`（新規: 全ディテクタ登録）
- `app/backend/src/services/asset-service.ts`（リファクタリング）

**変更内容:**

**A. アセットディテクタインターフェースの定義** (`asset-detector-registry.ts`)

- [x] `AssetDetector` インターフェースを定義:
  ```typescript
  type AssetDetectionContext = {
    filename: string;
    extension: string;   // 小文字化済み（例: ".mp4"）
    filePath?: string;   // ファイルシステムパス（Magic byte 検出用）
  };

  type AssetDetector = {
    name: string;
    priority: number;     // 高い値ほど先に評価（Magic byte > MIME > 拡張子）
    detect: (ctx: AssetDetectionContext) => string | null;  // AssetKind を返す or null（判定不能）
  };
  ```
- [x] `AssetDetectorRegistry` クラスを実装:
  - `register(detector: AssetDetector): void`
  - `detect(ctx: AssetDetectionContext): string`（priority 順に評価、全て null なら `"image"` フォールバック）

**B. 既存の拡張子判定をディテクタに移行**

- [x] `extension-detector.ts`: 現在の `detectKind` のロジックを `AssetDetector` として実装
  - `AssetKindRegistry` の `extensions` フィールドを参照して判定
- [x] `asset-service.ts` の `detectKind` を `assetDetectorRegistry.detect()` 呼び出しに置換

**C. 将来の拡張例（コメントで記載）**

- [x] `magic-byte-detector.ts` の stub をコメントで記載（将来的にファイルヘッダを読んで判定する想定）
- [x] `mime-type-detector.ts` の stub をコメントで記載

**確認方法:**
- アセットインポートの動作が完全に同一であること
- 新しいディテクタを `register()` で追加するとインポート時に使用されること
