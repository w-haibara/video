# 100: プラグインシステムの基盤設計

**背景:** タスク 93〜99 で各レイヤーにレジストリ/Strategy を導入した結果、新しいトラック種別・アセット種別・エディタ・レンダラ・エクスポートハンドラを「register 呼び出しのみ」で追加可能になっている。これらを統合し、将来のプラグイン機構の土台となる `Plugin` インターフェースとプラグインローダを設計する。

**対象ファイル:**
- `app/shared/src/types/plugin.ts`（新規）
- `app/frontend/src/lib/plugin-loader.ts`（新規）
- `app/backend/src/lib/plugin-loader.ts`（新規）

**変更内容:**

**A. Plugin インターフェースの定義** (`plugin.ts`)

- [x] `Plugin` 型を定義:
  ```typescript
  type PluginManifest = {
    id: string;
    name: string;
    version: string;
    description?: string;
  };

  type FrontendPlugin = PluginManifest & {
    registerTrackKinds?: (registry: TrackKindRegistry) => void;
    registerInspectorEditors?: (registry: InspectorEditorRegistry) => void;
    registerPreviewRenderers?: (registry: PreviewRendererRegistry) => void;
  };

  type BackendPlugin = PluginManifest & {
    registerAssetKinds?: (registry: AssetKindRegistry) => void;
    registerAssetDetectors?: (registry: AssetDetectorRegistry) => void;
    registerPipelineSteps?: (registry: PipelineStepRegistry) => void;
    registerExportHandlers?: (registry: ExportHandlerRegistry) => void;
  };
  ```

**B. プラグインローダの実装**

- [x] フロントエンド用 `loadPlugins(plugins: FrontendPlugin[]): void`
  - 各プラグインの `register*` メソッドを順番に呼び出し、各レジストリに登録
- [x] バックエンド用 `loadPlugins(plugins: BackendPlugin[]): void`
  - 同様にバックエンドの各レジストリにプラグインを登録

**C. ビルトインプラグインとしてデフォルト種別を登録**

- [x] 現在の video/audio/title/image の登録コードを `builtin-plugin.ts` にまとめる
  - フロントエンド: TrackKind 登録、Inspector エディタ登録、プレビューレンダラ登録
  - バックエンド: AssetKind 登録、ディテクタ登録、パイプラインステップ登録、エクスポートハンドラ登録
- [x] アプリ起動時に `loadPlugins([builtinPlugin])` を呼び出し

**確認方法:**
- アプリの動作が完全に同一であること
- サードパーティプラグインの追加が `loadPlugins([builtinPlugin, myPlugin])` のみで可能な構造であること
