import { DEFAULT_IMAGE_DURATION_MS } from "@video/shared";
import type { FrontendPlugin } from "./plugin-loader";
import type { TrackKindRegistry } from "./track-kind-registry";
import type { AssetKindRegistry } from "./asset-kind-registry";
import type { InspectorEditorRegistry } from "./inspector-editor-registry";
import type { PreviewRendererRegistry } from "./preview-renderer-registry";
import { theme } from "../theme";
import { TrimEditor } from "../components/editors/TrimEditor";
import { TextEditor } from "../components/editors/TextEditor";
import { TransformEditor } from "../components/editors/TransformEditor";
import { AudioVolumeEditor } from "../components/editors/AudioVolumeEditor";
import { videoClipRenderer } from "../components/renderers/VideoClipRenderer";
import { imageClipRenderer } from "../components/renderers/ImageClipRenderer";
import { textOverlayRenderer } from "../components/renderers/TextOverlayRenderer";
import type { ActiveClip, TickContext } from "./preview-renderer-registry";

export const builtinPlugin: FrontendPlugin = {
  id: "builtin",
  name: "Built-in",
  version: "1.0.0",
  description: "Default video/audio/image/title support",

  registerTrackKinds(registry: TrackKindRegistry) {
    registry.register({
      kind: "video",
      label: "V",
      clipColor: theme.clipVideo,
      clipSelectedColor: theme.clipVideoSelect,
      hasSourceTrim: true,
      hasAsset: true,
    });
    registry.register({
      kind: "audio",
      label: "A",
      clipColor: theme.clipAudio,
      clipSelectedColor: theme.clipAudioSelect,
      hasSourceTrim: true,
      hasAsset: true,
    });
    registry.register({
      kind: "title",
      label: "T",
      clipColor: theme.clipText,
      clipSelectedColor: theme.clipTextSelect,
      hasSourceTrim: false,
      hasAsset: false,
    });
  },

  registerAssetKinds(registry: AssetKindRegistry) {
    registry.register({
      kind: "video",
      label: "Video",
      extensions: [".mp4", ".mov", ".avi", ".mkv", ".webm"],
      mimePatterns: ["video/*"],
      defaultTrackKind: "video",
      hasDuration: true,
    });
    registry.register({
      kind: "image",
      label: "Image",
      extensions: [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp", ".heic", ".tiff", ".svg"],
      mimePatterns: ["image/*"],
      defaultTrackKind: "video",
      hasDuration: false,
      defaultDurationMs: DEFAULT_IMAGE_DURATION_MS,
    });
    registry.register({
      kind: "audio",
      label: "Audio",
      extensions: [".mp3", ".wav", ".aac", ".m4a", ".ogg", ".flac"],
      mimePatterns: ["audio/*"],
      defaultTrackKind: "audio",
      hasDuration: true,
    });
  },

  registerInspectorEditors(registry: InspectorEditorRegistry) {
    registry.register({
      id: "trim",
      label: "Trim",
      order: 0,
      canHandle: () => true,
      Component: TrimEditor,
    });
    registry.register({
      id: "text",
      label: "Text",
      order: 10,
      canHandle: (ctx) => ctx.trackKind === "title",
      Component: TextEditor,
    });
    registry.register({
      id: "transform",
      label: "Transform",
      order: 20,
      canHandle: (ctx) => ctx.trackKind === "video",
      Component: TransformEditor,
    });
    registry.register({
      id: "audio-volume",
      label: "Volume",
      order: 30,
      canHandle: (ctx) => ctx.trackKind === "audio",
      Component: AudioVolumeEditor,
    });
  },

  registerPreviewRenderers(registry: PreviewRendererRegistry) {
    registry.register(videoClipRenderer);
    registry.register(imageClipRenderer);
    registry.register(textOverlayRenderer);

    registry.registerTickStrategy({
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

    registry.registerTickStrategy({
      assetKind: "image",
      tick: (clip: ActiveClip, deltaMs: number, tickCtx: TickContext): number | null => {
        const clipEndMs = clip.clip.startMs + clip.clip.durationMs;
        return Math.min(tickCtx.currentTimeMs + deltaMs, clipEndMs);
      },
    });
  },
};
