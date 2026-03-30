import { DEFAULT_IMAGE_DURATION_MS } from "@video/shared";
import type { FrontendPlugin } from "./plugin-loader";
import type { ClipKindRegistry } from "./clip-kind-registry";
import type { AssetKindRegistry } from "./asset-kind-registry";
import type { InspectorEditorRegistry } from "./inspector-editor-registry";
import type { PreviewRendererRegistry } from "./preview-renderer-registry";
import type { CompositeStrategyRegistry } from "./composite-strategy-registry";
import type { TransitionPreviewRegistry } from "./transition-preview-registry";
import { theme } from "../theme";
import { TrimEditor } from "../components/editors/TrimEditor";
import { TextEditor } from "../components/editors/TextEditor";
import { TransformEditor } from "../components/editors/TransformEditor";
import { AudioVolumeEditor } from "../components/editors/AudioVolumeEditor";
import { BlendModeEditor } from "../components/editors/BlendModeEditor";
import { TransitionEditor } from "../components/editors/TransitionEditor";
import { P5jsEditor } from "../components/editors/P5jsEditor";
import { KeyframeEditor } from "../components/editors/KeyframeEditor";
import { SpeedEditor } from "../components/editors/SpeedEditor";
import { ColorCorrectionEditor } from "../components/editors/ColorCorrectionEditor";
import { VideoFilterEditor } from "../components/editors/VideoFilterEditor";
import { videoClipRenderer, p5jsClipRenderer } from "../components/renderers/VideoClipRenderer";
import { imageClipRenderer } from "../components/renderers/ImageClipRenderer";
import { textOverlayRenderer } from "../components/renderers/TextOverlayRenderer";
import { emptyAssetRenderer } from "../components/renderers/EmptyAssetRenderer";
import { audioClipRenderer } from "../components/renderers/AudioClipRenderer";
import type { ActiveClip, TickContext } from "./preview-renderer-registry";
import { coverPreviewStrategy } from "./composite-strategies/cover-strategy";
import { opacityPreviewStrategy } from "./composite-strategies/opacity-strategy";
import {
  multiplyPreviewStrategy,
  screenPreviewStrategy,
  overlayPreviewStrategy,
  addPreviewStrategy,
  differencePreviewStrategy,
} from "./composite-strategies/blend-strategies";
import {
  fadePreviewHandler,
  fadeBlackPreviewHandler,
  fadeWhitePreviewHandler,
} from "./transition-preview-handlers/fade-handlers";
import {
  slideLeftPreviewHandler,
  slideRightPreviewHandler,
  slideUpPreviewHandler,
  slideDownPreviewHandler,
} from "./transition-preview-handlers/slide-handlers";

export const builtinPlugin: FrontendPlugin = {
  id: "builtin",
  name: "Built-in",
  version: "1.0.0",
  description: "Default video/audio/image/title support",

  registerClipKinds(registry: ClipKindRegistry) {
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
      kind: "image",
      label: "I",
      clipColor: theme.clipImage,
      clipSelectedColor: theme.clipImageSelect,
      hasSourceTrim: false,
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
    registry.register({
      kind: "p5js",
      label: "p5.js",
      clipColor: "#ed225d",
      clipSelectedColor: "#ff4081",
      hasSourceTrim: false,
      hasAsset: true,
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
    registry.register({
      kind: "p5js",
      label: "p5.js",
      extensions: [".p5.js"],
      mimePatterns: [],
      defaultTrackKind: "video",
      hasDuration: false,
      defaultDurationMs: 5000,
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
      canHandle: (ctx) => ctx.clipKind === "title",
      Component: TextEditor,
    });
    registry.register({
      id: "transform",
      label: "Transform",
      order: 20,
      canHandle: (ctx) => ctx.clipKind === "video" || ctx.clipKind === "image",
      Component: TransformEditor,
    });
    registry.register({
      id: "blend-mode",
      label: "Blend Mode",
      order: 25,
      canHandle: (ctx) => ctx.clipKind === "video" || ctx.clipKind === "image",
      Component: BlendModeEditor,
    });
    registry.register({
      id: "transition",
      label: "Transition",
      order: 27,
      canHandle: (ctx) => ctx.clipKind === "video" || ctx.clipKind === "image",
      Component: TransitionEditor,
    });
    registry.register({
      id: "speed",
      label: "Speed",
      order: 28,
      canHandle: (ctx) => ctx.clipKind === "video" || ctx.clipKind === "audio",
      Component: SpeedEditor,
    });
    registry.register({
      id: "audio-volume",
      label: "Volume",
      order: 30,
      canHandle: (ctx) => ctx.clipKind === "audio" || ctx.clipKind === "video",
      Component: AudioVolumeEditor,
    });
    registry.register({
      id: "p5js",
      label: "Sketch",
      order: 15,
      canHandle: (ctx) => ctx.clipKind === "p5js",
      Component: P5jsEditor,
    });
    registry.register({
      id: "color-correction",
      label: "Color Correction",
      order: 29,
      canHandle: (ctx) => ctx.clipKind === "video" || ctx.clipKind === "image" || ctx.clipKind === "p5js",
      Component: ColorCorrectionEditor,
    });
    registry.register({
      id: "video-filters",
      label: "Video Filters",
      order: 30,
      canHandle: (ctx) => ctx.clipKind === "video" || ctx.clipKind === "image" || ctx.clipKind === "p5js",
      Component: VideoFilterEditor,
    });
    registry.register({
      id: "keyframe",
      label: "Keyframes",
      order: 50,
      canHandle: (ctx) => ctx.clipKind === "video" || ctx.clipKind === "image" || ctx.clipKind === "audio" || ctx.clipKind === "title",
      Component: KeyframeEditor,
    });
  },

  registerPreviewRenderers(registry: PreviewRendererRegistry) {
    registry.register(videoClipRenderer);
    registry.register(p5jsClipRenderer);
    registry.register(imageClipRenderer);
    registry.register(textOverlayRenderer);
    registry.register(emptyAssetRenderer);
    registry.register(audioClipRenderer);

    registry.registerTickStrategy({
      assetKind: "video",
      tick: (clip: ActiveClip, deltaMs: number, tickCtx: TickContext): number | null => {
        const { currentTimeMs, videoRef, lastClipId, videoEnded, resetVideoEnded } = tickCtx;
        const clipEndMs = clip.clip.startMs + clip.clip.durationMs;
        const speed = clip.clip.speed ?? 1;
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
          // With speed, source media progresses at speed * real time.
          // expectedVideoTime = inMs + (elapsed timeline time) * speed
          const expectedVideoTime = clip.clip.inMs + (currentTimeMs - clip.clip.startMs) * speed;
          if (Math.abs(videoTimeMs - expectedVideoTime) > 500) {
            return Math.min(currentTimeMs + deltaMs, clipEndMs);
          }
          // Map video time back to timeline: timelineMs = startMs + (videoTime - inMs) / speed
          const timelineMs = clip.clip.startMs + (videoTimeMs - clip.clip.inMs) / speed;
          return Math.max(clip.clip.startMs, Math.min(timelineMs, clipEndMs));
        }
        return null;
      },
    });

    registry.registerTickStrategy({
      assetKind: "p5js",
      tick: (clip: ActiveClip, deltaMs: number, tickCtx: TickContext): number | null => {
        const { currentTimeMs, videoRef, lastClipId, videoEnded, resetVideoEnded } = tickCtx;
        const clipEndMs = clip.clip.startMs + clip.clip.durationMs;
        const speed = clip.clip.speed ?? 1;
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
          const expectedVideoTime = clip.clip.inMs + (currentTimeMs - clip.clip.startMs) * speed;
          if (Math.abs(videoTimeMs - expectedVideoTime) > 500) {
            return Math.min(currentTimeMs + deltaMs, clipEndMs);
          }
          const timelineMs = clip.clip.startMs + (videoTimeMs - clip.clip.inMs) / speed;
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

    registry.registerTickStrategy({
      assetKind: "audio",
      tick: (clip: ActiveClip, deltaMs: number, tickCtx: TickContext): number | null => {
        const clipEndMs = clip.clip.startMs + clip.clip.durationMs;
        return Math.min(tickCtx.currentTimeMs + deltaMs, clipEndMs);
      },
    });
  },

  registerCompositeStrategies(registry: CompositeStrategyRegistry) {
    registry.register(coverPreviewStrategy);
    registry.register(opacityPreviewStrategy);
    registry.register(multiplyPreviewStrategy);
    registry.register(screenPreviewStrategy);
    registry.register(overlayPreviewStrategy);
    registry.register(addPreviewStrategy);
    registry.register(differencePreviewStrategy);
  },

  registerTransitions(registry: TransitionPreviewRegistry) {
    registry.register(fadePreviewHandler);
    registry.register(fadeBlackPreviewHandler);
    registry.register(fadeWhitePreviewHandler);
    registry.register(slideLeftPreviewHandler);
    registry.register(slideRightPreviewHandler);
    registry.register(slideUpPreviewHandler);
    registry.register(slideDownPreviewHandler);
  },
};
