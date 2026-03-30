import { useRef, useEffect } from "react";
import type { ActiveClip, PreviewRenderContext, PreviewLayerRenderer } from "../../lib/preview-renderer-registry";
import { findAllActiveClips, computeMediaContainerStyle, mediaStyle, computeTransitionStyle } from "../../lib/preview-renderer-registry";
import { compositeStrategyRegistry } from "../../lib/composite-strategy-registry";
import { audioManager } from "../../lib/audio-manager";
import type { Asset } from "@video/shared";
import { getAnimatedValue, hasKeyframes } from "@video/shared";

function getVideoMediaUrl(asset: Asset, projectId: string): string {
  if ((asset.kind === "video" || asset.kind === "p5js") && asset.proxyPath) {
    // render-cache paths have the form "render-cache/{assetId}/proxy.mp4"
    if (asset.proxyPath.startsWith("render-cache/")) {
      return `/media/projects/${projectId}/${asset.proxyPath}`;
    }
    const filename = asset.proxyPath.split("/").pop();
    return `/media/projects/${projectId}/proxies/${filename}`;
  }
  return "";
}

/** Compute the effective volume for a clip, evaluating keyframes if present. */
function getClipVolume(activeClip: ActiveClip): number {
  const clip = activeClip.clip;
  const timeMs = activeClip.clipTimeMs - clip.inMs;
  if (hasKeyframes(clip.keyframeTracks, "volume")) {
    return getAnimatedValue(clip.keyframeTracks, "volume", timeMs, clip.volume ?? 1.0);
  }
  return clip.volume ?? 1.0;
}

/** Hook to connect/disconnect a video element to the AudioManager. */
function useAudioConnection(
  clipId: string,
  element: HTMLVideoElement | null,
  volume: number,
  trackMuted: boolean,
) {
  useEffect(() => {
    if (!element || trackMuted) {
      audioManager.disconnectElement(clipId);
      return;
    }
    audioManager.connectElement(clipId, element, volume);
    return () => {
      audioManager.disconnectElement(clipId);
    };
  }, [clipId, element, trackMuted]);

  // Update volume continuously (separate effect so volume changes don't reconnect)
  useEffect(() => {
    if (!element || trackMuted) return;
    audioManager.setVolume(clipId, volume);
  }, [clipId, volume, element, trackMuted]);
}

/** Managed video element for non-topmost clips (handles its own src/seek/play). */
function ManagedVideoElement({
  activeClip,
  projectId,
  isPlaying,
  canvasW,
  canvasH,
  trackMuted,
}: {
  activeClip: ActiveClip;
  projectId: string;
  isPlaying: boolean;
  canvasW: number;
  canvasH: number;
  trackMuted: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const lastClipIdRef = useRef<string>("");
  const lastMediaUrlRef = useRef<string>("");
  const sourceChangingRef = useRef(false);
  const sourceVersionRef = useRef(0);

  const assetW = activeClip.asset.width ?? canvasW;
  const assetH = activeClip.asset.height ?? canvasH;
  const mediaUrl = getVideoMediaUrl(activeClip.asset, projectId);
  const volume = getClipVolume(activeClip);

  // Connect audio through AudioManager
  useAudioConnection(activeClip.clip.id, ref.current, volume, trackMuted);

  // Handle source changes
  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    const clipChanged = lastClipIdRef.current !== activeClip.clip.id;
    const srcMissing = !video.src || video.src === window.location.href;

    if (clipChanged || srcMissing) {
      lastClipIdRef.current = activeClip.clip.id;
      const urlChanged = lastMediaUrlRef.current !== mediaUrl;
      if (urlChanged || srcMissing) {
        lastMediaUrlRef.current = mediaUrl;
        sourceChangingRef.current = true;
        const version = ++sourceVersionRef.current;
        video.src = mediaUrl;
        const seekTarget = activeClip.clipTimeMs / 1000;
        video.addEventListener("loadeddata", () => {
          if (sourceVersionRef.current !== version) return;
          sourceChangingRef.current = false;
          video.currentTime = seekTarget;
          const startPlay = () => {
            if (isPlaying) video.play().catch(() => {});
          };
          if (video.seeking) {
            video.addEventListener("seeked", startPlay, { once: true });
          } else {
            startPlay();
          }
        }, { once: true });
      } else {
        video.currentTime = activeClip.clipTimeMs / 1000;
        if (isPlaying) video.play().catch(() => {});
      }
    }
  }, [activeClip.clip.id, mediaUrl, isPlaying]);

  // Play/pause sync
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (isPlaying) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isPlaying]);

  // Seek when not playing
  useEffect(() => {
    const video = ref.current;
    if (!video || isPlaying) return;
    if (sourceChangingRef.current) return;
    video.currentTime = activeClip.clipTimeMs / 1000;
  }, [activeClip.clipTimeMs, isPlaying]);

  return (
    <video
      ref={ref}
      style={mediaStyle(activeClip.clip.crop, assetW, assetH)}
    />
  );
}

/** Wrapper for the topmost video clip that connects audio via AudioManager. */
function TopmostVideoElement({ activeClip, ctx }: { activeClip: ActiveClip; ctx: PreviewRenderContext }) {
  const assetW = activeClip.asset.width ?? ctx.canvasW;
  const assetH = activeClip.asset.height ?? ctx.canvasH;
  const volume = getClipVolume(activeClip);
  const trackMuted = ctx.project.sequence.tracks[activeClip.trackIndex]?.muted ?? false;

  useAudioConnection(activeClip.clip.id, ctx.videoRef.current, volume, trackMuted);

  return (
    <video
      ref={ctx.videoRef}
      style={mediaStyle(activeClip.clip.crop, assetW, assetH)}
    />
  );
}

function VideoClipComponent({ content, ctx }: { content: unknown; ctx: PreviewRenderContext }) {
  const activeClips = content as ActiveClip[];
  const topmostClip = activeClips[activeClips.length - 1];

  return (
    <>
      {activeClips.map((activeClip) => {
        const isTopmost = activeClip === topmostClip;
        const blendMode = activeClip.clip.blendMode ?? "cover";
        const strategy = compositeStrategyRegistry.get(blendMode);
        const trackMuted = ctx.project.sequence.tracks[activeClip.trackIndex]?.muted ?? false;

        const transStyle = computeTransitionStyle(activeClip.clip, ctx.project, ctx.currentTimeMs);
        const containerStyle = {
          ...computeMediaContainerStyle(activeClip, ctx.canvasW, ctx.canvasH),
          zIndex: activeClip.trackIndex,
          ...(strategy?.containerStyle({ canvasW: ctx.canvasW, canvasH: ctx.canvasH }) ?? {}),
          ...transStyle,
          position: "absolute" as const,
        };

        return (
          <div key={activeClip.clip.id} style={containerStyle}>
            {isTopmost ? (
              <TopmostVideoElement activeClip={activeClip} ctx={ctx} />
            ) : (
              <ManagedVideoElement
                activeClip={activeClip}
                projectId={ctx.project.id}
                isPlaying={ctx.isPlaying}
                canvasW={ctx.canvasW}
                canvasH={ctx.canvasH}
                trackMuted={trackMuted}
              />
            )}
          </div>
        );
      })}
    </>
  );
}

function findActiveVideoClips(ctx: PreviewRenderContext): ActiveClip[] | null {
  const clips = findAllActiveClips(ctx.project, ctx.currentTimeMs, "video", "video");
  return clips.length > 0 ? clips : null;
}

export const videoClipRenderer: PreviewLayerRenderer = {
  id: "video-clip",
  zOrder: 0,
  findActiveContent: findActiveVideoClips,
  Component: VideoClipComponent,
};

function findActiveP5jsClips(ctx: PreviewRenderContext): ActiveClip[] | null {
  const clips = findAllActiveClips(ctx.project, ctx.currentTimeMs, "p5js", "p5js");
  return clips.length > 0 ? clips : null;
}

export const p5jsClipRenderer: PreviewLayerRenderer = {
  id: "p5js-clip",
  zOrder: 0,
  findActiveContent: findActiveP5jsClips,
  Component: VideoClipComponent,
};
