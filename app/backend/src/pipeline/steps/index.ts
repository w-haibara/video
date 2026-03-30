import { registerStep } from "../registry";
import { probeStep } from "./probe";
import { thumbnailStep } from "./thumbnail";
import { proxyStep } from "./proxy";
import { imageConvertStep } from "./image-convert";
import { webRenderStep } from "./web-render";
import { generativePrepareStep } from "./generative-prepare";
import { webRenderCommitStep } from "./web-render-commit";

registerStep(probeStep);
registerStep(thumbnailStep);
registerStep(proxyStep);
registerStep(imageConvertStep);
registerStep(webRenderStep);
registerStep(generativePrepareStep);
registerStep(webRenderCommitStep);
