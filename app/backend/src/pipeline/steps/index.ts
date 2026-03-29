import { registerStep } from "../registry";
import { probeStep } from "./probe";
import { thumbnailStep } from "./thumbnail";
import { proxyStep } from "./proxy";
import { imageConvertStep } from "./image-convert";
import { webRenderStep } from "./web-render";
import { p5jsPrepareStep } from "./p5js-prepare";

registerStep(probeStep);
registerStep(thumbnailStep);
registerStep(proxyStep);
registerStep(imageConvertStep);
registerStep(webRenderStep);
registerStep(p5jsPrepareStep);
