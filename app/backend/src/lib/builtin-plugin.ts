import type { BackendPlugin } from "./plugin-loader";
import { extensionDetector } from "./asset-detectors/extension-detector";
import { p5jsDetector } from "./asset-detectors/p5js-detector";
import { probeStep } from "../pipeline/steps/probe";
import { thumbnailStep } from "../pipeline/steps/thumbnail";
import { proxyStep } from "../pipeline/steps/proxy";
import { imageConvertStep } from "../pipeline/steps/image-convert";
import { webRenderStep } from "../pipeline/steps/web-render";
import { generativePrepareStep } from "../pipeline/steps/generative-prepare";
import { webRenderCommitStep } from "../pipeline/steps/web-render-commit";
import { p5jsHandler } from "./generative-asset-handlers/p5js-handler";

export const builtinPlugin: BackendPlugin = {
  id: "builtin",
  name: "Built-in",
  version: "1.0.0",
  description: "Default asset detection and pipeline steps",

  registerAssetDetectors(registry) {
    registry.register(extensionDetector);
    registry.register(p5jsDetector);
  },

  registerPipelineSteps(reg) {
    reg.registerStep(probeStep);
    reg.registerStep(thumbnailStep);
    reg.registerStep(proxyStep);
    reg.registerStep(imageConvertStep);
    reg.registerStep(webRenderStep);
    reg.registerStep(generativePrepareStep);
    reg.registerStep(webRenderCommitStep);

    reg.definePipeline("video", ["probe", "thumbnail", "proxy"]);
    reg.definePipeline("image", ["probe", "thumbnail", "image-convert"]);
    reg.definePipeline("audio", ["probe"]);
    reg.definePipeline("p5js", [
      "generative-prepare",
      "web-render",
      "probe",
      "thumbnail",
      "proxy",
      "web-render-commit",
    ]);
  },

  registerGenerativeAssetHandlers(registry) {
    registry.register(p5jsHandler);
  },
};
