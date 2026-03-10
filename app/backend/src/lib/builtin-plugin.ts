import type { BackendPlugin, PipelineRegistration } from "./plugin-loader";
import type { AssetDetectorRegistry } from "./asset-detector-registry";
import type { ExportHandlerRegistry } from "./export-handler-registry";
import { extensionDetector } from "./asset-detectors/extension-detector";
import { videoClipHandler } from "./export-handlers/video-clip-handler";
import { imageClipHandler } from "./export-handlers/image-clip-handler";
import { textOverlayHandler } from "./export-handlers/text-overlay-handler";
import { audioMixHandler } from "./export-handlers/audio-mix-handler";
import { probeStep } from "../pipeline/steps/probe";
import { thumbnailStep } from "../pipeline/steps/thumbnail";
import { proxyStep } from "../pipeline/steps/proxy";
import { imageConvertStep } from "../pipeline/steps/image-convert";

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
};
