import type { BackendPlugin, PipelineRegistration } from "./plugin-loader";
import type { AssetDetectorRegistry } from "./asset-detector-registry";
import type { ExportHandlerRegistry } from "./export-handler-registry";
import type { CompositeStrategyRegistry } from "./composite-strategy-registry";
import { extensionDetector } from "./asset-detectors/extension-detector";
import { videoClipHandler } from "./export-handlers/video-clip-handler";
import { imageClipHandler } from "./export-handlers/image-clip-handler";
import { textOverlayHandler } from "./export-handlers/text-overlay-handler";
import { audioMixHandler } from "./export-handlers/audio-mix-handler";
import { probeStep } from "../pipeline/steps/probe";
import { thumbnailStep } from "../pipeline/steps/thumbnail";
import { proxyStep } from "../pipeline/steps/proxy";
import { imageConvertStep } from "../pipeline/steps/image-convert";
import { coverExportStrategy } from "./composite-strategies/cover-strategy";
import { opacityExportStrategy } from "./composite-strategies/opacity-strategy";
import {
  multiplyExportStrategy,
  screenExportStrategy,
  overlayExportStrategy,
  addExportStrategy,
  differenceExportStrategy,
} from "./composite-strategies/blend-strategies";

export const builtinPlugin: BackendPlugin = {
  id: "builtin",
  name: "Built-in",
  version: "1.0.0",
  description: "Default asset detection, pipeline steps, and export handlers",

  registerAssetDetectors(registry: AssetDetectorRegistry) {
    registry.register(extensionDetector);
  },

  registerExportHandlers(registry: ExportHandlerRegistry) {
    registry.registerClipHandler(videoClipHandler);
    registry.registerClipHandler(imageClipHandler);
    registry.registerOverlayHandler(textOverlayHandler);
    registry.registerAudioHandler(audioMixHandler);
  },

  registerPipelineSteps(reg: PipelineRegistration) {
    reg.registerStep(probeStep);
    reg.registerStep(thumbnailStep);
    reg.registerStep(proxyStep);
    reg.registerStep(imageConvertStep);

    reg.definePipeline("video", ["probe", "thumbnail", "proxy"]);
    reg.definePipeline("image", ["probe", "thumbnail", "image-convert"]);
    reg.definePipeline("audio", ["probe"]);
  },

  registerCompositeStrategies(registry: CompositeStrategyRegistry) {
    registry.register(coverExportStrategy);
    registry.register(opacityExportStrategy);
    registry.register(multiplyExportStrategy);
    registry.register(screenExportStrategy);
    registry.register(overlayExportStrategy);
    registry.register(addExportStrategy);
    registry.register(differenceExportStrategy);
  },
};
