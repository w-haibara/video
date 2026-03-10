import type { PluginManifest } from "@video/shared";
import type { AssetDetectorRegistry } from "./asset-detector-registry";
import type { ExportHandlerRegistry } from "./export-handler-registry";
import type { PipelineStep } from "../pipeline/types";
import type { AssetKind } from "@video/shared";
import { assetDetectorRegistry } from "./asset-detector-registry";
import { exportHandlerRegistry } from "./export-handler-registry";
import { registerStep, definePipeline } from "../pipeline/registry";

export type PipelineRegistration = {
  registerStep: (step: PipelineStep) => void;
  definePipeline: (kind: AssetKind, stepNames: string[]) => void;
};

export type BackendPlugin = PluginManifest & {
  registerAssetDetectors?: (registry: AssetDetectorRegistry) => void;
  registerExportHandlers?: (registry: ExportHandlerRegistry) => void;
  registerPipelineSteps?: (registration: PipelineRegistration) => void;
};

export function loadPlugins(plugins: BackendPlugin[]): void {
  const pipelineReg: PipelineRegistration = { registerStep, definePipeline };
  for (const plugin of plugins) {
    plugin.registerAssetDetectors?.(assetDetectorRegistry);
    plugin.registerExportHandlers?.(exportHandlerRegistry);
    plugin.registerPipelineSteps?.(pipelineReg);
  }
}
