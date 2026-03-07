import { registerStep } from "../registry";
import { probeStep } from "./probe";
import { thumbnailStep } from "./thumbnail";
import { proxyStep } from "./proxy";
import { imageConvertStep } from "./image-convert";

registerStep(probeStep);
registerStep(thumbnailStep);
registerStep(proxyStep);
registerStep(imageConvertStep);
