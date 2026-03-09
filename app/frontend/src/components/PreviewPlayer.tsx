import { useRef, useState, useEffect, useCallback } from "react";
import type { Project, Clip, Asset, ClipCrop, ClipText } from "@video/shared";
import { theme } from "../theme";

type Props = {
  project: Project;
  currentTimeMs: number;
  onTimeUpdate: (ms: number) => void;
  isPlaying: boolean;
  onPlayPause: () => void;
  selectedClipId?: string | null;
  onSelectClip: (id: string | null) => void;
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
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
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
          // Video source not yet updated for this clip (effect hasn't run).
          // Use deltaMs-based advancement to avoid reading stale video.currentTime.
          const newTime = curTime + deltaMs;
          onTimeUpdateRef.current(Math.min(newTime, clipEndMs));
        } else if (video.ended || videoEndedRef.current) {
          // Video file finished but clip may still have remaining time
          // Advance gradually (last frame stays visible)
          videoEndedRef.current = false;
          const newTime = curTime + deltaMs;
          onTimeUpdateRef.current(Math.min(newTime, clipEndMs));
        } else if (video.readyState >= 2 && !video.paused) {
          // Video is playing and has data
          const videoTimeMs = video.currentTime * 1000;
          const expectedVideoTime = clip.clip.inMs + (curTime - clip.clip.startMs);
          // If video.currentTime is far from expected, seek hasn't completed yet
          // (e.g. after source change). Use deltaMs-based advancement instead.
          if (Math.abs(videoTimeMs - expectedVideoTime) > 500) {
            const newTime = curTime + deltaMs;
            onTimeUpdateRef.current(Math.min(newTime, clipEndMs));
          } else {
            const timelineMs = clip.clip.startMs + (videoTimeMs - clip.clip.inMs);
            const clampedMs = Math.max(clip.clip.startMs, Math.min(timelineMs, clipEndMs));
            onTimeUpdateRef.current(clampedMs);
          }
        }
        // else: video still loading or buffering — wait, don't skip
      } else if (clip && clip.asset.kind === "image") {
        const newTime = curTime + deltaMs;
        const clipEndMs = clip.clip.startMs + clip.clip.durationMs;
        onTimeUpdateRef.current(Math.min(newTime, clipEndMs));
      } else {
        // No active clip — advance time to find the next clip
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
    // Skip seek while a source change is loading — the loadeddata handler will seek
    if (sourceChangingRef.current) return;
    if (activeClip.asset.kind === "video") {
      video.currentTime = activeClip.clipTimeMs / 1000;
    }
  }, [currentTimeMs, isPlaying]);

  const clipTransform = activeClip?.clip.transform;
  const rotation = clipTransform?.rotation ?? 0;
  const translateX = clipTransform?.x ?? 0;
  const translateY = clipTransform?.y ?? 0;
  const scale = clipTransform?.scale ?? 1;
  const crop = activeClip?.clip.crop;

  const buildTransformCss = (): string | undefined => {
    const parts: string[] = [];
    if (translateX || translateY) parts.push(`translate(${translateX}px, ${translateY}px)`);
    if (scale !== 1) parts.push(`scale(${scale})`);
    if (rotation) parts.push(`rotate(${rotation}deg)`);
    return parts.length > 0 ? parts.join(" ") : undefined;
  };
  const transformCss = buildTransformCss();

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
        background: activeClip ? "#000" : theme.bgDark,
      }}
    >
      {/* Preview area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {!activeClip ? (
          <span style={{ color: theme.textDisabled, fontSize: "14px" }}>No clip at playhead</span>
        ) : (
          <div style={{
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            maxWidth: "100%",
            maxHeight: "100%",
            ...cropContainerStyle(crop, activeClip.asset),
          }}>
            {isImage ? (
              <img
                src={thumbnailUrl}
                alt=""
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                  transform: transformCss,
                  transformOrigin: "center center",
                }}
              />
            ) : (
              <video
                ref={videoRef}
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                  transform: transformCss,
                  transformOrigin: "center center",
                }}
                muted
              />
            )}
          </div>
        )}
        {/* Text overlay layer */}
        {activeTextClips.length > 0 && (
          <div style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-end",
            pointerEvents: "none",
            padding: "16px",
          }}>
            {activeTextClips.map(({ clip, text }) => (
              <div
                key={clip.id}
                style={{
                  fontSize: `${text.fontSize ?? 48}px`,
                  color: text.color ?? "#ffffff",
                  backgroundColor: text.backgroundColor ?? "transparent",
                  textAlign: (text.align as React.CSSProperties["textAlign"]) ?? "center",
                  fontFamily: text.fontFamily ?? "sans-serif",
                  padding: "4px 12px",
                  borderRadius: "4px",
                  marginBottom: "8px",
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
              onPlayPause(); // stop first
            }
            onSelectClip(null); // clear clip selection for full playback
            onTimeUpdate(0); // seek to start
          }}
          style={{
            background: "none",
            border: `1px solid ${theme.border}`,
            color: theme.text,
            padding: "4px 16px",
            cursor: "pointer",
            borderRadius: "3px",
            fontSize: "13px",
            minWidth: "36px",
          }}
          title="Go to start"
        >
          ⏮
        </button>
        <button
          onClick={() => {
            if (!isPlaying) {
              const selClip = selectedClipId ? findClipById(project, selectedClipId) : null;
              if (selClip) {
                // Selected clip: reset to clip start if at or past clip end
                const clipEnd = selClip.startMs + selClip.durationMs;
                if (currentTimeMs >= clipEnd) {
                  onTimeUpdate(selClip.startMs);
                }
              } else {
                // No selection: reset to sequence start if at end
                const seqEnd = getSequenceEndMs(project);
                if (seqEnd > 0 && currentTimeMs >= seqEnd) {
                  onTimeUpdate(0);
                }
              }
            }
            onPlayPause();
          }}
          style={{
            background: "none",
            border: `1px solid ${theme.border}`,
            color: theme.text,
            padding: "4px 16px",
            cursor: "pointer",
            borderRadius: "3px",
            fontSize: "13px",
            minWidth: "60px",
          }}
        >
          {isPlaying ? "Pause" : "Play"}
        </button>
        <span style={{ color: theme.textMuted, fontSize: "12px" }}>
          {formatTime(currentTimeMs)}
        </span>
      </div>
    </div>
  );
}

function cropContainerStyle(crop: ClipCrop | undefined, asset: Asset | undefined): React.CSSProperties {
  if (!crop || !asset?.width || !asset?.height) return {};
  const top = (crop.y / asset.height) * 100;
  const left = (crop.x / asset.width) * 100;
  const right = ((asset.width - crop.x - crop.width) / asset.width) * 100;
  const bottom = ((asset.height - crop.y - crop.height) / asset.height) * 100;
  return {
    clipPath: `inset(${top}% ${right}% ${bottom}% ${left}%)`,
  };
}

function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  const frac = Math.floor((ms % 1000) / 100);
  return `${min}:${sec.toString().padStart(2, "0")}.${frac}`;
}
