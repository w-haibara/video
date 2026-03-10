import { exportHandlerRegistry } from "../export-handler-registry";
import { videoClipHandler } from "./video-clip-handler";
import { imageClipHandler } from "./image-clip-handler";
import { textOverlayHandler } from "./text-overlay-handler";
import { audioMixHandler } from "./audio-mix-handler";

exportHandlerRegistry.registerClipHandler(videoClipHandler);
exportHandlerRegistry.registerClipHandler(imageClipHandler);
exportHandlerRegistry.registerOverlayHandler(textOverlayHandler);
exportHandlerRegistry.registerAudioHandler(audioMixHandler);
