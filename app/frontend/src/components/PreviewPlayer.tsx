import { useRef, useEffect, useLayoutEffect, useState } from "react";
import type { Project, Clip, Asset } from "@video/shared";
import { theme, buttonStyle } from "../theme";
import { previewRendererRegistry } from "../lib/preview-renderer-registry";
import type { ActiveClip, PreviewRenderContext } from "../lib/preview-renderer-registry";

type Props = {
  project: Project;
  currentTimeMs: number;
  onTimeUpdate: (ms: number) => void;
  isPlaying: boolean;
  onPlayPause: () => void;
  selectedClipId?: string | null;
  onSelectClip: (id: string | null) => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  isPopout?: boolean;
  onTogglePopout?: () => void;
};

function getSequenceEndMs(project: Project): number {
  let endMs = 0;
  for (const track of project.sequence.tracks) {
    for (const clip of track.clips) {
      const clipEnd = clip.startMs + clip.durationMs;
      if (clipEnd > endMs) endMs = clipEnd;
    }
  }
  return endMs;
}

function findClipById(project: Project, clipId: string): Clip | null {
  for (const track of project.sequence.tracks) {
    for (const clip of track.clips) {
      if (clip.id === clipId) return clip;
    }
  }
  return null;
}

function getMediaUrl(asset: Asset, projectId: string): string {
  if (asset.kind === "video" && asset.proxyPath) {
    const filename = asset.proxyPath.split("/").pop();
    return `/media/projects/${projectId}/proxies/${filename}`;
  }
  if (asset.thumbnailPath) {
    const filename = asset.thumbnailPath.split("/").pop();
    return `/media/projects/${projectId}/thumbnails/${filename}`;
  }
  return "";
}

export function PreviewPlayer({
  project,
  currentTimeMs,
  onTimeUpdate,
  isPlaying,
  onPlayPause,
  selectedClipId,
  onSelectClip,
  isFullscreen,
  onToggleFullscreen,
  isPopout,
  onTogglePopout,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number>(0);
  const lastClipIdRef = useRef<string | null>(null);
  const lastMediaUrlRef = useRef<string>("");
  const videoEndedRef = useRef(false);
  const sourceChangingRef = useRef(false);
  const currentTimeMsRef = useRef(currentTimeMs);
  currentTimeMsRef.current = currentTimeMs;

  // Keep refs for values needed in tick() to avoid stale closures
  const projectRef = useRef(project);
  projectRef.current = project;
  const onTimeUpdateRef = useRef(onTimeUpdate);
  onTimeUpdateRef.current = onTimeUpdate;
  const onPlayPauseRef = useRef(onPlayPause);
  onPlayPauseRef.current = onPlayPause;
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;
  const selectedClipIdRef = useRef(selectedClipId);
  selectedClipIdRef.current = selectedClipId;

  // Canvas dimensions
  const canvasW = project.settings.canvasWidth;
  const canvasH = project.settings.canvasHeight;

  // Track rendered canvas size so text overlay pixel values can be scaled
  const [canvasScale, setCanvasScale] = useState(1);
  useLayoutEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    // Synchronous initial measurement so first paint has correct scale
    const initW = el.getBoundingClientRect().width;
    if (initW > 0) setCanvasScale(initW / canvasW);
    const observer = new ResizeObserver((entries) => {
      const w = entries[0].contentRect.width;
      if (w > 0) setCanvasScale(w / canvasW);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [canvasW]);

  // Build render context for renderers
  const renderCtx: PreviewRenderContext = {
    project, currentTimeMs, canvasW, canvasH, canvasScale, isPlaying,
    videoRef: videoRef as React.RefObject<HTMLVideoElement | null>,
  };

  // Find active content from all renderers
  const allRenderers = previewRendererRegistry.all();
  const layers = allRenderers.map((renderer) => ({
    renderer,
    content: renderer.findActiveContent(renderCtx),
  }));

  const hasMediaContent = layers.some((l) => l.renderer.zOrder === 0 && l.content !== null);

  // Get active video clips for video element management (topmost drives playback)
  const videoClips = layers.find((l) => l.renderer.id === "video-clip")?.content as ActiveClip[] | null;
  const videoContent = videoClips ? videoClips[videoClips.length - 1] : null; // topmost
  const hasVideoContent = videoContent !== null;
  const mediaUrl = videoContent ? getMediaUrl(videoContent.asset, project.id) : "";

  // Handle video source changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoContent) return;

    const clipChanged = lastClipIdRef.current !== videoContent.clip.id;
    const srcMissing = !video.src;

    if (clipChanged || srcMissing) {
      lastClipIdRef.current = videoContent.clip.id;
      videoEndedRef.current = false;
      const urlChanged = lastMediaUrlRef.current !== mediaUrl;
      if (urlChanged || srcMissing) {
        lastMediaUrlRef.current = mediaUrl;
        sourceChangingRef.current = true;
        video.src = mediaUrl;
        const seekTarget = videoContent.clipTimeMs / 1000;
        const onLoadedData = () => {
          video.removeEventListener("loadeddata", onLoadedData);
          sourceChangingRef.current = false;
          video.currentTime = seekTarget;
          if (isPlayingRef.current) {
            video.play().catch(() => {});
          }
        };
        video.addEventListener("loadeddata", onLoadedData);
        return () => video.removeEventListener("loadeddata", onLoadedData);
      } else {
        video.currentTime = videoContent.clipTimeMs / 1000;
        if (isPlaying) {
          video.play().catch(() => {});
        }
      }
    }
  }, [videoContent?.clip.id, mediaUrl, isPlaying]);

  // Listen for video ended event to advance clips
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onEnded = () => {
      videoEndedRef.current = true;
    };
    video.addEventListener("ended", onEnded);
    return () => video.removeEventListener("ended", onEnded);
  }, []);

  // Handle play/pause
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying && hasVideoContent) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isPlaying, hasVideoContent]);

  // Sync video time back to timeline during playback
  useEffect(() => {
    if (!isPlaying) return;

    const mediaRenderers = previewRendererRegistry.all().filter((r) => r.zOrder === 0);
    let lastFrameTime = performance.now();

    const tick = () => {
      const now = performance.now();
      const deltaMs = now - lastFrameTime;
      lastFrameTime = now;

      const curTime = currentTimeMsRef.current;
      const proj = projectRef.current;
      const seqEnd = getSequenceEndMs(proj);

      // Determine playback end point based on selected clip
      const selId = selectedClipIdRef.current;
      const selClip = selId ? findClipById(proj, selId) : null;
      const playEnd = selClip ? selClip.startMs + selClip.durationMs : seqEnd;

      // Stop at end of playback range
      if (playEnd <= 0 || curTime >= playEnd) {
        onPlayPauseRef.current();
        return;
      }

      // Find active media clip through renderers
      const tickRenderCtx: PreviewRenderContext = {
        project: proj, currentTimeMs: curTime,
        canvasW, canvasH, canvasScale: 1, isPlaying: true,
        videoRef: videoRef as React.RefObject<HTMLVideoElement | null>,
      };

      let activeMedia: ActiveClip | null = null;
      for (const r of mediaRenderers) {
        const c = r.findActiveContent(tickRenderCtx);
        if (c) {
          const clips = c as ActiveClip[];
          activeMedia = clips[clips.length - 1]; // topmost clip
          break;
        }
      }

      let newTime: number | null = null;

      if (activeMedia) {
        const clipEndMs = activeMedia.clip.startMs + activeMedia.clip.durationMs;
        const strategy = previewRendererRegistry.getTickStrategy(activeMedia.asset.kind);

        if (strategy) {
          const tickCtx = {
            currentTimeMs: curTime,
            videoRef: videoRef.current,
            lastClipId: lastClipIdRef.current,
            videoEnded: videoEndedRef.current,
            resetVideoEnded: () => { videoEndedRef.current = false; },
          };
          newTime = strategy.tick(activeMedia, deltaMs, tickCtx);
        } else {
          // Unknown asset kind — advance like a static clip
          newTime = Math.min(curTime + deltaMs, clipEndMs);
        }
      } else {
        // No active media — advance through gap between clips
        newTime = curTime + deltaMs;
      }

      if (newTime !== null) {
        // Stop at end of playback range
        if (newTime >= playEnd) {
          currentTimeMsRef.current = playEnd;
          onTimeUpdateRef.current(playEnd);
          onPlayPauseRef.current();
          return;
        }
        // Update ref immediately so the next tick frame reads the correct
        // time even before React re-renders (prevents stale-closure stalls
        // at clip boundaries, especially for image/static clips).
        currentTimeMsRef.current = newTime;
        onTimeUpdateRef.current(newTime);
      }

      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isPlaying]);

  // Seek video when timeline is scrubbed (not playing)
  useEffect(() => {
    const video = videoRef.current;
    if (!video || isPlaying || !videoContent) return;
    if (sourceChangingRef.current) return;
    video.currentTime = videoContent.clipTimeMs / 1000;
  }, [currentTimeMs, isPlaying]);

  // Escape key exits fullscreen
  useEffect(() => {
    if (!isFullscreen || !onToggleFullscreen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onToggleFullscreen();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen, onToggleFullscreen]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        background: theme.bgDark,
        ...(isFullscreen ? {
          position: "fixed" as const,
          inset: 0,
          zIndex: 1000,
        } : {}),
      }}
    >
      {/* Preview area — centers the canvas */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          position: "relative",
          background: theme.bgDark,
        }}
      >
        {!hasMediaContent ? (
          <span style={{ color: theme.textMuted, fontSize: "14px" }}>No clip at playhead</span>
        ) : (
          /* Canvas container — fixed aspect ratio, black background */
          <div
            ref={canvasRef}
            data-testid="preview-canvas"
            style={{
              aspectRatio: `${canvasW} / ${canvasH}`,
              maxWidth: "100%",
              maxHeight: "100%",
              width: "100%",
              position: "relative",
              overflow: "hidden",
              background: theme.black,
            }}
          >
            {layers.map(({ renderer, content }) => {
              if (!content) return null;
              return <renderer.Component key={renderer.id} content={content} ctx={renderCtx} />;
            })}
          </div>
        )}
      </div>

      {/* Transport controls */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          padding: "4px",
          background: theme.bgPanel,
          borderTop: `1px solid ${theme.border}`,
          flexShrink: 0,
        }}
      >
        <button
          onClick={() => {
            if (isPlaying) {
              onPlayPause();
            }
            onSelectClip(null);
            onTimeUpdate(0);
          }}
          style={{ ...buttonStyle.secondary, padding: "4px 16px", fontSize: "13px", minWidth: "36px" }}
          title="Go to start"
        >
          ⏮
        </button>
        <button
          onClick={() => {
            if (!isPlaying) {
              const selClip = selectedClipId ? findClipById(project, selectedClipId) : null;
              if (selClip) {
                const clipEnd = selClip.startMs + selClip.durationMs;
                if (currentTimeMs >= clipEnd) {
                  onTimeUpdate(selClip.startMs);
                }
              } else {
                const seqEnd = getSequenceEndMs(project);
                if (seqEnd > 0 && currentTimeMs >= seqEnd) {
                  onTimeUpdate(0);
                }
              }
            }
            onPlayPause();
          }}
          style={{ ...buttonStyle.secondary, padding: "4px 16px", fontSize: "13px", minWidth: "60px" }}
        >
          {isPlaying ? "Pause" : "Play"}
        </button>
        <span style={{ color: theme.textMuted, fontSize: "12px" }}>
          {formatTime(currentTimeMs)}
        </span>
        <span style={{ marginLeft: "auto", display: "flex", gap: "4px" }}>
          {onTogglePopout && (
            <button
              onClick={onTogglePopout}
              disabled={!!isFullscreen}
              style={{ ...buttonStyle.secondary, padding: "4px 16px", fontSize: "13px", minWidth: "36px" }}
              title={isPopout ? "Close popout" : "Open in new window"}
            >
              {isPopout ? "↙" : "↗"}
            </button>
          )}
          {onToggleFullscreen && (
            <button
              onClick={onToggleFullscreen}
              disabled={!!isPopout}
              style={{ ...buttonStyle.secondary, padding: "4px 16px", fontSize: "13px", minWidth: "36px" }}
              title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              ⛶
            </button>
          )}
        </span>
      </div>
    </div>
  );
}

function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  const frac = Math.floor((ms % 1000) / 100);
  return `${min}:${sec.toString().padStart(2, "0")}.${frac}`;
}
