import type { PipelineStep } from "../pipeline/types";
import type { AssetKind } from "@video/shared";
import { registerStep, definePipeline } from "../pipeline/registry";
import { assetDetectorRegistry } from "./asset-detector-registry";
import { generativeAssetHandlerRegistry } from "./generative-asset-handler-registry";

export type PipelineRegistration = {
  registerStep: (step: PipelineStep) => void;
  definePipeline: (kind: AssetKind, stepNames: string[]) => void;
};

export type BackendPlugin = {
  id: string;
  name: string;
  version: string;
  description: string;
  registerAssetDetectors?: (registry: typeof assetDetectorRegistry) => void;
  registerPipelineSteps?: (reg: PipelineRegistration) => void;
  registerGenerativeAssetHandlers?: (registry: typeof generativeAssetHandlerRegistry) => void;
};

export function loadPlugins(plugins: BackendPlugin[]): void {
  const reg: PipelineRegistration = { registerStep, definePipeline };
  for (const plugin of plugins) {
    plugin.registerAssetDetectors?.(assetDetectorRegistry);
    plugin.registerPipelineSteps?.(reg);
    plugin.registerGenerativeAssetHandlers?.(generativeAssetHandlerRegistry);
  }
}
