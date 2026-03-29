import type { BackendPlugin, PipelineRegistration } from "./plugin-loader";
import type { AssetDetectorRegistry } from "./asset-detector-registry";
import type { ExportHandlerRegistry } from "./export-handler-registry";
import type { CompositeStrategyRegistry } from "./composite-strategy-registry";
import type { TransitionExportRegistry } from "./transition-export-registry";
import { extensionDetector } from "./asset-detectors/extension-detector";
import { videoClipHandler } from "./export-handlers/video-clip-handler";
import { imageClipHandler } from "./export-handlers/image-clip-handler";
import { textOverlayHandler } from "./export-handlers/text-overlay-handler";
import { audioMixHandler } from "./export-handlers/audio-mix-handler";
import { probeStep } from "../pipeline/steps/probe";
import { thumbnailStep } from "../pipeline/steps/thumbnail";
import { proxyStep } from "../pipeline/steps/proxy";
import { imageConvertStep } from "../pipeline/steps/image-convert";
import { p5jsPrepareStep } from "../pipeline/steps/p5js-prepare";
import { webRenderStep } from "../pipeline/steps/web-render";
import { coverExportStrategy } from "./composite-strategies/cover-strategy";
import { opacityExportStrategy } from "./composite-strategies/opacity-strategy";
import {
  multiplyExportStrategy,
  screenExportStrategy,
  overlayExportStrategy,
  addExportStrategy,
  differenceExportStrategy,
} from "./composite-strategies/blend-strategies";
import {
  fadeExportHandler,
  fadeBlackExportHandler,
  fadeWhiteExportHandler,
} from "./transition-export-handlers/fade-handlers";
import {
  slideLeftExportHandler,
  slideRightExportHandler,
  slideUpExportHandler,
  slideDownExportHandler,
} from "./transition-export-handlers/slide-handlers";

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
    reg.registerStep(p5jsPrepareStep);
    reg.registerStep(webRenderStep);

    reg.definePipeline("video", ["probe", "thumbnail", "proxy"]);
    reg.definePipeline("image", ["probe", "thumbnail", "image-convert"]);
    reg.definePipeline("audio", ["probe"]);
    reg.definePipeline("p5js", [
      "p5js-prepare",
      "web-render",
      "probe",
      "thumbnail",
      "proxy",
    ]);
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

  registerTransitions(registry: TransitionExportRegistry) {
    registry.register(fadeExportHandler);
    registry.register(fadeBlackExportHandler);
    registry.register(fadeWhiteExportHandler);
    registry.register(slideLeftExportHandler);
    registry.register(slideRightExportHandler);
    registry.register(slideUpExportHandler);
    registry.register(slideDownExportHandler);
  },
};
