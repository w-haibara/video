# 108: CompositeStrategy インターフェース設計 + CoverStrategy 実装

**背景:** 動画クリップがトラック間で重なる場合の合成方法を GoF Strategy パターンで設計する。Open/Closed 原則に従い、新しい合成方法を既存コードの修正なしに追加できるレジストリ方式とする。`blendMode` フィールドは「そのクリップが上に重なるとき」の合成方法を指定する。

**対象ファイル:**
- `app/shared/src/types/composite.ts`（新規: Strategy インターフェース定義）
- `app/frontend/src/lib/composite-strategy-registry.ts`（新規: フロントエンド用レジストリ）
- `app/frontend/src/lib/composite-strategies/cover-strategy.ts`（新規: Cover Strategy のプレビュー実装）
- `app/backend/src/lib/composite-strategy-registry.ts`（新規: バックエンド用レジストリ）
- `app/backend/src/lib/composite-strategies/cover-strategy.ts`（新規: Cover Strategy のエクスポート実装）
- `app/frontend/src/lib/builtin-plugin.ts`（Strategy 登録追加）
- `app/backend/src/lib/builtin-plugin.ts`（Strategy 登録追加）

**変更内容:**

**A. 共有型定義: CompositeStrategy インターフェース**

- [x] `app/shared/src/types/composite.ts` に以下を定義する:
  - `CompositeStrategyDescriptor`: `{ id: string; label: string }` — Strategy のメタデータ
- [x] `app/shared/src/index.ts` で re-export する

**B. フロントエンド: PreviewCompositeStrategy + レジストリ**

- [x] `PreviewCompositeStrategy` インターフェースを定義する:
  - `id: string` — blendMode と一致する識別子
  - `label: string` — UI 表示用ラベル
  - `containerStyle(ctx: { canvasW: number; canvasH: number }): CSSProperties` — 上レイヤーのコンテナに適用する CSS（opacity, mix-blend-mode 等）
- [x] `CompositeStrategyRegistry` クラスを作成する:
  - `register(strategy: PreviewCompositeStrategy): void`
  - `get(id: string): PreviewCompositeStrategy | undefined`
  - `all(): PreviewCompositeStrategy[]`
- [x] シングルトンインスタンス `compositeStrategyRegistry` をエクスポートする

**C. フロントエンド: CoverPreviewStrategy の実装**

- [x] `cover-strategy.ts` に `CoverPreviewStrategy` を実装する:
  - `id: "cover"`, `label: "Cover (覆い隠す)"`
  - `containerStyle()`: `{ position: "relative" }` を返す（上レイヤーが下を完全に覆う = 特殊なスタイル不要）

**D. バックエンド: ExportCompositeStrategy + レジストリ**

- [x] `ExportCompositeStrategy` インターフェースを定義する:
  - `id: string` — blendMode と一致する識別子
  - `buildOverlayFilter(bottomLabel: string, topLabel: string, enable: string): string` — FFmpeg overlay フィルタ式を生成
- [x] `CompositeStrategyRegistry` クラスを作成する（フロントエンドと同様の構造）
- [x] シングルトンインスタンス `exportCompositeStrategyRegistry` をエクスポートする

**E. バックエンド: CoverExportStrategy の実装**

- [x] `cover-strategy.ts` に `CoverExportStrategy` を実装する:
  - `id: "cover"`
  - `buildOverlayFilter(bottom, top, enable)`: `${bottom}${top}overlay=0:0:enable='${enable}'` を返す（上で下を完全に覆う）

**F. builtin-plugin への登録**

- [x] フロントエンド `builtin-plugin.ts` に `registerCompositeStrategies(registry)` を追加し、CoverPreviewStrategy を登録する
- [x] バックエンド `builtin-plugin.ts` に `registerCompositeStrategies(registry)` を追加し、CoverExportStrategy を登録する

**確認方法:** レジストリに Strategy が登録され、`get("cover")` で取得できること。`bun run test` で既存テストが通ること。
