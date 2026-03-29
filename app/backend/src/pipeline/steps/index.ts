import { registerStep } from "../registry";
import { probeStep } from "./probe";
import { thumbnailStep } from "./thumbnail";
import { proxyStep } from "./proxy";
import { imageConvertStep } from "./image-convert";
import { webRenderStep } from "./web-render";

registerStep(probeStep);
registerStep(thumbnailStep);
registerStep(proxyStep);
registerStep(imageConvertStep);
registerStep(webRenderStep);
