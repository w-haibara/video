import type { PluginManifest } from "@video/shared";
import type { TrackKindRegistry } from "./track-kind-registry";
import type { AssetKindRegistry } from "./asset-kind-registry";
import type { InspectorEditorRegistry } from "./inspector-editor-registry";
import type { PreviewRendererRegistry } from "./preview-renderer-registry";
import { trackKindRegistry } from "./track-kind-registry";
import { assetKindRegistry } from "./asset-kind-registry";
import { inspectorEditorRegistry } from "./inspector-editor-registry";
import { previewRendererRegistry } from "./preview-renderer-registry";

export type FrontendPlugin = PluginManifest & {
  registerTrackKinds?: (registry: TrackKindRegistry) => void;
  registerAssetKinds?: (registry: AssetKindRegistry) => void;
  registerInspectorEditors?: (registry: InspectorEditorRegistry) => void;
  registerPreviewRenderers?: (registry: PreviewRendererRegistry) => void;
};

export function loadPlugins(plugins: FrontendPlugin[]): void {
  for (const plugin of plugins) {
    plugin.registerTrackKinds?.(trackKindRegistry);
    plugin.registerAssetKinds?.(assetKindRegistry);
    plugin.registerInspectorEditors?.(inspectorEditorRegistry);
    plugin.registerPreviewRenderers?.(previewRendererRegistry);
  }
}
