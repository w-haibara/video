import { useRef, useEffect, useState } from "react";
import type { Project, Clip, Asset, ClipCrop, ClipText } from "@video/shared";
import { theme, buttonStyle } from "../theme";

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

type ActiveClip = {
  clip: Clip;
  asset: Asset;
  clipTimeMs: number; // time relative to clip's source (inMs + offset)
};

type ActiveTextClip = {
  clip: Clip;
  text: ClipText;
};

function findActiveClip(project: Project, timeMs: number): ActiveClip | null {
  for (const track of project.sequence.tracks) {
    if (track.kind !== "video") continue;
    for (const clip of track.clips) {
      if (timeMs >= clip.startMs && timeMs < clip.startMs + clip.durationMs) {
        const asset = project.assets.find((a: Asset) => a.id === clip.assetId);
        if (!asset) continue;
        const offset = timeMs - clip.startMs;
        const clipTimeMs = clip.inMs + offset;
        return { clip, asset, clipTimeMs };
      }
    }
  }
  return null;
}

function findActiveTextClips(project: Project, timeMs: number): ActiveTextClip[] {
  const result: ActiveTextClip[] = [];
  for (const track of project.sequence.tracks) {
    if (track.kind !== "title") continue;
    for (const clip of track.clips) {
      if (timeMs >= clip.startMs && timeMs < clip.startMs + clip.durationMs && clip.text) {
        result.push({ clip, text: clip.text });
      }
    }
  }
  return result;
}

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

  const activeClip = findActiveClip(project, currentTimeMs);
  const activeTextClips = findActiveTextClips(project, currentTimeMs);

  const mediaUrl = activeClip
    ? getMediaUrl(activeClip.asset, project.id)
    : "";

  // Handle video source changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !activeClip) return;

    const clipChanged = lastClipIdRef.current !== activeClip.clip.id;
    const srcMissing = activeClip.asset.kind === "video" && !video.src;

    if (clipChanged || srcMissing) {
      lastClipIdRef.current = activeClip.clip.id;
      videoEndedRef.current = false;
      if (activeClip.asset.kind === "video") {
        const urlChanged = lastMediaUrlRef.current !== mediaUrl;
        if (urlChanged || srcMissing) {
          lastMediaUrlRef.current = mediaUrl;
          sourceChangingRef.current = true;
          video.src = mediaUrl;
          // Wait for load before seeking when source changes
          const seekTarget = activeClip.clipTimeMs / 1000;
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
          // Same URL — can seek immediately
          video.currentTime = activeClip.clipTimeMs / 1000;
          if (isPlaying) {
            video.play().catch(() => {});
          }
        }
      }
    }
  }, [activeClip?.clip.id, mediaUrl, isPlaying]);

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

    if (isPlaying && activeClip?.asset.kind === "video") {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isPlaying, activeClip?.asset.kind]);

  // Sync video time back to timeline during playback
  useEffect(() => {
    if (!isPlaying) return;

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

      const clip = findActiveClip(proj, curTime);

      if (clip && clip.asset.kind === "video") {
        const video = videoRef.current;
        const clipEndMs = clip.clip.startMs + clip.clip.durationMs;
        const videoReady = clip.clip.id === lastClipIdRef.current;

        if (!video) {
          // No video element — skip
        } else if (!videoReady) {
          const newTime = curTime + deltaMs;
          onTimeUpdateRef.current(Math.min(newTime, clipEndMs));
        } else if (video.ended || videoEndedRef.current) {
          videoEndedRef.current = false;
          const newTime = curTime + deltaMs;
          onTimeUpdateRef.current(Math.min(newTime, clipEndMs));
        } else if (video.readyState >= 2 && !video.paused) {
          const videoTimeMs = video.currentTime * 1000;
          const expectedVideoTime = clip.clip.inMs + (curTime - clip.clip.startMs);
          if (Math.abs(videoTimeMs - expectedVideoTime) > 500) {
            const newTime = curTime + deltaMs;
            onTimeUpdateRef.current(Math.min(newTime, clipEndMs));
          } else {
            const timelineMs = clip.clip.startMs + (videoTimeMs - clip.clip.inMs);
            const clampedMs = Math.max(clip.clip.startMs, Math.min(timelineMs, clipEndMs));
            onTimeUpdateRef.current(clampedMs);
          }
        }
      } else if (clip && clip.asset.kind === "image") {
        const newTime = curTime + deltaMs;
        const clipEndMs = clip.clip.startMs + clip.clip.durationMs;
        onTimeUpdateRef.current(Math.min(newTime, clipEndMs));
      } else {
        const newTime = curTime + deltaMs;
        if (newTime < playEnd) {
          onTimeUpdateRef.current(newTime);
        } else {
          onTimeUpdateRef.current(playEnd);
          onPlayPauseRef.current();
          return;
        }
      }

      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isPlaying]);

  // Seek video when timeline is scrubbed (not playing)
  useEffect(() => {
    const video = videoRef.current;
    if (!video || isPlaying || !activeClip) return;
    if (sourceChangingRef.current) return;
    if (activeClip.asset.kind === "video") {
      video.currentTime = activeClip.clipTimeMs / 1000;
    }
  }, [currentTimeMs, isPlaying]);

  // Canvas dimensions
  const canvasW = project.settings.canvasWidth;
  const canvasH = project.settings.canvasHeight;

  // Track rendered canvas size so text overlay pixel values can be scaled
  // to match the actual canvas resolution (e.g. fontSize 48 in 1920-space).
  const [canvasScale, setCanvasScale] = useState(1);
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const w = entries[0].contentRect.width;
      if (w > 0) setCanvasScale(w / canvasW);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [canvasW]);

  // Asset dimensions & transform
  const assetW = activeClip?.asset.width ?? canvasW;
  const assetH = activeClip?.asset.height ?? canvasH;
  const clipTransform = activeClip?.clip.transform;
  const translateX = clipTransform?.x ?? 0;
  const translateY = clipTransform?.y ?? 0;
  const scale = clipTransform?.scale ?? 1;
  const rotation = clipTransform?.rotation ?? 0;
  const crop = activeClip?.clip.crop;

  // After crop the visible region becomes crop.width × crop.height.
  // Use these "effective" dimensions so the container matches the FFmpeg
  // pipeline order: crop → center on canvas → scale/position.
  const effectiveW = crop?.width ?? assetW;
  const effectiveH = crop?.height ?? assetH;

  const containerWidthPct = (effectiveW / canvasW) * 100 * scale;
  const containerHeightPct = (effectiveH / canvasH) * 100 * scale;
  const offsetXPct = (translateX / canvasW) * 100;
  const offsetYPct = (translateY / canvasH) * 100;

  // Build CSS transform for rotation only (position handled via top/left)
  const rotationCss = rotation ? `rotate(${rotation}deg)` : undefined;

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

  const isImage = activeClip?.asset.kind === "image";
  const thumbnailUrl = activeClip
    ? (() => {
        const thumb = activeClip.asset.thumbnailPath;
        if (!thumb) return "";
        return `/media/projects/${project.id}/thumbnails/${thumb.split("/").pop()}`;
      })()
    : "";

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
        {!activeClip ? (
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
            {/* Media element — sized & positioned relative to canvas */}
            <div
              style={{
                position: "absolute",
                width: `${containerWidthPct}%`,
                height: `${containerHeightPct}%`,
                left: `calc(50% + ${offsetXPct}%)`,
                top: `calc(50% + ${offsetYPct}%)`,
                transform: `translate(-50%, -50%)${rotationCss ? ` ${rotationCss}` : ""}`,
                transformOrigin: "center center",
                overflow: crop ? "hidden" : undefined,
              }}
            >
              {isImage ? (
                <img
                  src={thumbnailUrl}
                  alt=""
                  style={mediaStyle(crop, assetW, assetH)}
                />
              ) : (
                <video
                  ref={videoRef}
                  style={mediaStyle(crop, assetW, assetH)}
                  muted
                />
              )}
            </div>

            {/* Text overlay layer — within canvas bounds.
                Pixel values are scaled by canvasScale so that e.g. fontSize 48
                means 48px in the actual canvas resolution (1920×1080), not 48
                CSS pixels in the (potentially much smaller) rendered element. */}
            {activeTextClips.length > 0 && (
              <div style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-end",
                pointerEvents: "none",
                padding: `${40 * canvasScale}px`,
              }}>
                {activeTextClips.map(({ clip, text }) => (
                  <div
                    key={clip.id}
                    style={{
                      fontSize: `${(text.fontSize ?? 48) * canvasScale}px`,
                      color: text.color ?? "#ffffff",
                      backgroundColor: text.backgroundColor ?? "rgba(0,0,0,0.5)",
                      textAlign: (text.align as React.CSSProperties["textAlign"]) ?? "center",
                      fontFamily: text.fontFamily ?? "sans-serif",
                      padding: `${8 * canvasScale}px`,
                      borderRadius: `${4 * canvasScale}px`,
                      marginBottom: "0px",
                      maxWidth: "90%",
                      wordBreak: "break-word",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {text.value}
                  </div>
                ))}
              </div>
            )}
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

/**
 * Compute inner media element styles.
 * Without crop: fills container 100%.
 * With crop: oversizes the media and offsets it so only the crop region is visible
 * (container has overflow:hidden).
 */
function mediaStyle(crop: ClipCrop | undefined, assetW: number, assetH: number): React.CSSProperties {
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

function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  const frac = Math.floor((ms % 1000) / 100);
  return `${min}:${sec.toString().padStart(2, "0")}.${frac}`;
}
