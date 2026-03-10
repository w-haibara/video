import { previewRendererRegistry } from "../../lib/preview-renderer-registry";
import type { ActiveClip, TickContext } from "../../lib/preview-renderer-registry";
import { videoClipRenderer } from "./VideoClipRenderer";
import { imageClipRenderer } from "./ImageClipRenderer";
import { textOverlayRenderer } from "./TextOverlayRenderer";

// Register renderers (order matters for same-zOrder: video checked before image)
previewRendererRegistry.register(videoClipRenderer);
previewRendererRegistry.register(imageClipRenderer);
previewRendererRegistry.register(textOverlayRenderer);

// Register tick strategies
previewRendererRegistry.registerTickStrategy({
  assetKind: "video",
  tick: (clip: ActiveClip, deltaMs: number, tickCtx: TickContext): number | null => {
    const { currentTimeMs, videoRef, lastClipId, videoEnded, resetVideoEnded } = tickCtx;
    const clipEndMs = clip.clip.startMs + clip.clip.durationMs;
    const videoReady = clip.clip.id === lastClipId;

    if (!videoRef) {
      return null;
    } else if (!videoReady) {
      return Math.min(currentTimeMs + deltaMs, clipEndMs);
    } else if (videoRef.ended || videoEnded) {
      resetVideoEnded();
      return Math.min(currentTimeMs + deltaMs, clipEndMs);
    } else if (videoRef.readyState >= 2 && !videoRef.paused) {
      const videoTimeMs = videoRef.currentTime * 1000;
      const expectedVideoTime = clip.clip.inMs + (currentTimeMs - clip.clip.startMs);
      if (Math.abs(videoTimeMs - expectedVideoTime) > 500) {
        return Math.min(currentTimeMs + deltaMs, clipEndMs);
      }
      const timelineMs = clip.clip.startMs + (videoTimeMs - clip.clip.inMs);
      return Math.max(clip.clip.startMs, Math.min(timelineMs, clipEndMs));
    }
    return null;
  },
});

previewRendererRegistry.registerTickStrategy({
  assetKind: "image",
  tick: (clip: ActiveClip, deltaMs: number, tickCtx: TickContext): number | null => {
    const clipEndMs = clip.clip.startMs + clip.clip.durationMs;
    return Math.min(tickCtx.currentTimeMs + deltaMs, clipEndMs);
  },
});
