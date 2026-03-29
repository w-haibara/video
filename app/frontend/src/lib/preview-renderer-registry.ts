import type { CSSProperties, RefObject } from "react";
import type { Project, Clip, Asset, ClipCrop, ClipText } from "@video/shared";
import { transitionPreviewRegistry } from "./transition-preview-registry";

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

/** Check whether a clip has an empty (unassigned) asset. */
export function isEmptyAssetClip(clip: Clip): boolean {
  return clip.assetId === "";
}

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
      if (isEmptyAssetClip(clip)) continue;
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
      if (isEmptyAssetClip(clip)) continue;
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

/** Active clip placeholder for clips with empty assetId. */
export type ActiveEmptyClip = {
  clip: Clip;
  trackIndex: number;
};

/** Find all active clips that have an empty assetId (no asset assigned). */
export function findAllActiveEmptyClips(
  project: Project,
  timeMs: number,
): ActiveEmptyClip[] {
  const result: ActiveEmptyClip[] = [];
  for (let i = 0; i < project.sequence.tracks.length; i++) {
    const track = project.sequence.tracks[i];
    for (const clip of track.clips) {
      if (!isEmptyAssetClip(clip)) continue;
      // title clips with text are handled by the text overlay renderer
      if (clip.clipKind === "title" && clip.text) continue;
      if (timeMs >= clip.startMs && timeMs < clip.startMs + clip.durationMs) {
        result.push({ clip, trackIndex: i });
      }
    }
  }
  return result;
}

/** Find the next clip on the same track that has a transition overlapping this clip. */
function findNextTransitionClip(clip: Clip, project: Project): Clip | null {
  const clipEnd = clip.startMs + clip.durationMs;
  for (const track of project.sequence.tracks) {
    const idx = track.clips.findIndex((c) => c.id === clip.id);
    if (idx < 0) continue;
    for (let i = idx + 1; i < track.clips.length; i++) {
      const next = track.clips[i];
      if (!next.transition) continue;
      if (next.startMs < clipEnd && next.startMs > clip.startMs) return next;
    }
    break;
  }
  return null;
}

/** Compute transition progress (0..1) for a clip's fade-in. Returns -1 if not in transition. */
function incomingProgress(clip: Clip, currentTimeMs: number): number {
  if (!clip.transition) return -1;
  const elapsed = currentTimeMs - clip.startMs;
  if (elapsed >= clip.transition.durationMs) return -1;
  return Math.max(0, Math.min(1, elapsed / clip.transition.durationMs));
}

/** Compute outgoing transition info. Returns null if not in transition. */
function outgoingTransition(
  clip: Clip,
  project: Project,
  currentTimeMs: number,
): { progress: number; next: Clip } | null {
  const next = findNextTransitionClip(clip, project);
  if (!next) return null;
  const fadeOutStart = next.startMs;
  if (currentTimeMs < fadeOutStart) return null;
  const progress = Math.max(0, Math.min(1, (currentTimeMs - fadeOutStart) / next.transition!.durationMs));
  return { progress, next };
}

/**
 * Compute transition CSS styles for a clip at a given time.
 * Returns {} when no transition is active.
 */
export function computeTransitionStyle(
  clip: Clip,
  project: Project,
  currentTimeMs: number,
): CSSProperties {
  const style: CSSProperties = {};
  const transType = clip.transition?.type;

  // ── Incoming transition (this clip fades/slides in) ──
  const inProg = incomingProgress(clip, currentTimeMs);
  if (inProg >= 0 && transType) {
    const handler = transitionPreviewRegistry.get(transType);
    if (handler) {
      Object.assign(style, handler.computeIncomingStyle(inProg));
    }
  }

  // ── Outgoing transition (this clip fades/slides out for the NEXT clip's transition) ──
  const out = outgoingTransition(clip, project, currentTimeMs);
  if (out) {
    const nextType = out.next.transition?.type;
    const handler = nextType ? transitionPreviewRegistry.get(nextType) : undefined;
    if (handler?.computeOutgoingStyle) {
      const outStyle = handler.computeOutgoingStyle(out.progress);
      // Multiply opacity with existing value (don't replace)
      const outOpacity = (outStyle.opacity as number) ?? 1;
      style.opacity = ((style.opacity as number) ?? 1) * outOpacity;
      // Copy other properties (e.g. filter)
      for (const [key, value] of Object.entries(outStyle)) {
        if (key !== "opacity") {
          (style as Record<string, unknown>)[key] = value;
        }
      }
    }
    // Transitions without computeOutgoingStyle (e.g. slide-*): outgoing clip stays fully visible
  }

  return style;
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
