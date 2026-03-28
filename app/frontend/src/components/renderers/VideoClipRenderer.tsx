import { useRef, useEffect } from "react";
import type { ActiveClip, PreviewRenderContext, PreviewLayerRenderer } from "../../lib/preview-renderer-registry";
import { findAllActiveClips, computeMediaContainerStyle, mediaStyle, computeTransitionStyle } from "../../lib/preview-renderer-registry";
import { compositeStrategyRegistry } from "../../lib/composite-strategy-registry";
import type { Asset } from "@video/shared";

function getVideoMediaUrl(asset: Asset, projectId: string): string {
  if (asset.kind === "video" && asset.proxyPath) {
    const filename = asset.proxyPath.split("/").pop();
    return `/media/projects/${projectId}/proxies/${filename}`;
  }
  return "";
}

/** Managed video element for non-topmost clips (handles its own src/seek/play). */
function ManagedVideoElement({
  activeClip,
  projectId,
  isPlaying,
  canvasW,
  canvasH,
}: {
  activeClip: ActiveClip;
  projectId: string;
  isPlaying: boolean;
  canvasW: number;
  canvasH: number;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const lastClipIdRef = useRef<string>("");
  const lastMediaUrlRef = useRef<string>("");
  const sourceChangingRef = useRef(false);
  const sourceVersionRef = useRef(0);

  const assetW = activeClip.asset.width ?? canvasW;
  const assetH = activeClip.asset.height ?? canvasH;
  const mediaUrl = getVideoMediaUrl(activeClip.asset, projectId);

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
      muted
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
        const assetW = activeClip.asset.width ?? ctx.canvasW;
        const assetH = activeClip.asset.height ?? ctx.canvasH;
        const blendMode = activeClip.clip.blendMode ?? "cover";
        const strategy = compositeStrategyRegistry.get(blendMode);

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
              <video
                ref={ctx.videoRef}
                style={mediaStyle(activeClip.clip.crop, assetW, assetH)}
                muted
              />
            ) : (
              <ManagedVideoElement
                activeClip={activeClip}
                projectId={ctx.project.id}
                isPlaying={ctx.isPlaying}
                canvasW={ctx.canvasW}
                canvasH={ctx.canvasH}
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
