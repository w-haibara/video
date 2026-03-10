import type { CSSProperties, RefObject } from "react";
import type { Project, Clip, Asset, ClipCrop, ClipText } from "@video/shared";

export type ActiveClip = {
  clip: Clip;
  asset: Asset;
  clipTimeMs: number;
  trackIndex: number;
};

export type ActiveTextClip = {
  clip: Clip;
  text: ClipText;
};

export type PreviewRenderContext = {
  project: Project;
  currentTimeMs: number;
  canvasW: number;
  canvasH: number;
  canvasScale: number;
  isPlaying: boolean;
  videoRef: RefObject<HTMLVideoElement | null>;
};

export type PreviewLayerRenderer = {
  id: string;
  zOrder: number;
  findActiveContent: (ctx: PreviewRenderContext) => unknown | null;
  Component: React.ComponentType<{ content: unknown; ctx: PreviewRenderContext }>;
};

export type TickContext = {
  currentTimeMs: number;
  videoRef: HTMLVideoElement | null;
  lastClipId: string | null;
  videoEnded: boolean;
  resetVideoEnded: () => void;
};

export type PlaybackTickStrategy = {
  assetKind: string;
  tick: (clip: ActiveClip, deltaMs: number, tickCtx: TickContext) => number | null;
};

export class PreviewRendererRegistry {
  private renderers: PreviewLayerRenderer[] = [];
  private tickStrategies = new Map<string, PlaybackTickStrategy>();

  register(renderer: PreviewLayerRenderer): void {
    this.renderers.push(renderer);
  }

  registerTickStrategy(strategy: PlaybackTickStrategy): void {
    this.tickStrategies.set(strategy.assetKind, strategy);
  }

  all(): PreviewLayerRenderer[] {
    return [...this.renderers].sort((a, b) => a.zOrder - b.zOrder);
  }

  getTickStrategy(assetKind: string): PlaybackTickStrategy | undefined {
    return this.tickStrategies.get(assetKind);
  }
}

export const previewRendererRegistry = new PreviewRendererRegistry();

/** Find the first active clip matching the given clipKind, optionally filtered by asset kind. */
export function findActiveClipInTracks(
  project: Project,
  timeMs: number,
  clipKind: string,
  assetKind?: string,
): ActiveClip | null {
  for (let i = 0; i < project.sequence.tracks.length; i++) {
    const track = project.sequence.tracks[i];
    for (const clip of track.clips) {
      if (clip.clipKind !== clipKind) continue;
      if (timeMs >= clip.startMs && timeMs < clip.startMs + clip.durationMs) {
        const asset = project.assets.find((a: Asset) => a.id === clip.assetId);
        if (!asset) continue;
        if (assetKind && asset.kind !== assetKind) continue;
        const offset = timeMs - clip.startMs;
        const clipTimeMs = clip.inMs + offset;
        return { clip, asset, clipTimeMs, trackIndex: i };
      }
    }
  }
  return null;
}

/** Find all active clips matching the given clipKind / assetKind, ordered by track index (bottom to top). */
export function findAllActiveClips(
  project: Project,
  timeMs: number,
  clipKind?: string,
  assetKind?: string,
): ActiveClip[] {
  const result: ActiveClip[] = [];
  for (let i = 0; i < project.sequence.tracks.length; i++) {
    const track = project.sequence.tracks[i];
    for (const clip of track.clips) {
      if (clipKind && clip.clipKind !== clipKind) continue;
      if (timeMs >= clip.startMs && timeMs < clip.startMs + clip.durationMs) {
        const asset = project.assets.find((a: Asset) => a.id === clip.assetId);
        if (!asset) continue;
        if (assetKind && asset.kind !== assetKind) continue;
        const offset = timeMs - clip.startMs;
        const clipTimeMs = clip.inMs + offset;
        result.push({ clip, asset, clipTimeMs, trackIndex: i });
      }
    }
  }
  return result;
}

/** Compute inner media element styles (handles crop offset). */
export function mediaStyle(crop: ClipCrop | undefined, assetW: number, assetH: number): CSSProperties {
  if (!crop) {
    return { width: "100%", height: "100%", objectFit: "fill" as const };
  }
  return {
    width: `${(assetW / crop.width) * 100}%`,
    height: `${(assetH / crop.height) * 100}%`,
    marginLeft: `${-(crop.x / crop.width) * 100}%`,
    marginTop: `${-(crop.y / crop.height) * 100}%`,
    objectFit: "fill" as const,
  };
}

/** Compute the absolute-positioned transform container for a media clip. */
export function computeMediaContainerStyle(
  activeClip: ActiveClip,
  canvasW: number,
  canvasH: number,
): CSSProperties {
  const assetW = activeClip.asset.width ?? canvasW;
  const assetH = activeClip.asset.height ?? canvasH;
  const transform = activeClip.clip.transform;
  const translateX = transform?.x ?? 0;
  const translateY = transform?.y ?? 0;
  const scale = transform?.scale ?? 1;
  const rotation = transform?.rotation ?? 0;
  const crop = activeClip.clip.crop;

  const effectiveW = crop?.width ?? assetW;
  const effectiveH = crop?.height ?? assetH;
  const containerWidthPct = (effectiveW / canvasW) * 100 * scale;
  const containerHeightPct = (effectiveH / canvasH) * 100 * scale;
  const offsetXPct = (translateX / canvasW) * 100;
  const offsetYPct = (translateY / canvasH) * 100;
  const rotationCss = rotation ? `rotate(${rotation}deg)` : undefined;

  return {
    position: "absolute",
    width: `${containerWidthPct}%`,
    height: `${containerHeightPct}%`,
    left: `calc(50% + ${offsetXPct}%)`,
    top: `calc(50% + ${offsetYPct}%)`,
    transform: `translate(-50%, -50%)${rotationCss ? ` ${rotationCss}` : ""}`,
    transformOrigin: "center center",
    overflow: crop ? "hidden" : undefined,
  };
}
