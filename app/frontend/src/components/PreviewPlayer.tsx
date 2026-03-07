import { useRef, useState, useEffect, useCallback } from "react";
import type { Project, Clip, Asset, ClipCrop, ClipText } from "@video/shared";

type Props = {
  project: Project;
  currentTimeMs: number;
  onTimeUpdate: (ms: number) => void;
  isPlaying: boolean;
  onPlayPause: () => void;
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
        const asset = project.assets.find((a) => a.id === clip.assetId);
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
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const animFrameRef = useRef<number>(0);
  const lastClipIdRef = useRef<string | null>(null);
  const currentTimeMsRef = useRef(currentTimeMs);
  currentTimeMsRef.current = currentTimeMs;

  // Keep refs for values needed in tick() to avoid stale closures
  const projectRef = useRef(project);
  projectRef.current = project;
  const onTimeUpdateRef = useRef(onTimeUpdate);
  onTimeUpdateRef.current = onTimeUpdate;
  const onPlayPauseRef = useRef(onPlayPause);
  onPlayPauseRef.current = onPlayPause;

  const activeClip = findActiveClip(project, currentTimeMs);
  const activeTextClips = findActiveTextClips(project, currentTimeMs);

  const mediaUrl = activeClip
    ? getMediaUrl(activeClip.asset, project.id)
    : "";

  // Handle video source changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !activeClip) return;

    if (lastClipIdRef.current !== activeClip.clip.id) {
      lastClipIdRef.current = activeClip.clip.id;
      if (activeClip.asset.kind === "video") {
        video.src = mediaUrl;
        video.currentTime = activeClip.clipTimeMs / 1000;
        if (isPlaying) {
          video.play().catch(() => {});
        }
      }
    }
  }, [activeClip?.clip.id, mediaUrl, isPlaying]);

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

      // Stop at end of sequence
      if (curTime >= seqEnd) {
        onPlayPauseRef.current();
        return;
      }

      const clip = findActiveClip(proj, curTime);

      if (clip && clip.asset.kind === "video") {
        const video = videoRef.current;
        if (video && !video.paused) {
          const videoTimeMs = video.currentTime * 1000;
          const timelineMs = clip.clip.startMs + (videoTimeMs - clip.clip.inMs);
          const clipEndMs = clip.clip.startMs + clip.clip.durationMs;
          // Clamp to clip end so we advance past boundary
          onTimeUpdateRef.current(Math.min(timelineMs, clipEndMs));
        } else {
          // Video ended or paused — advance past clip boundary
          const clipEndMs = clip.clip.startMs + clip.clip.durationMs;
          onTimeUpdateRef.current(clipEndMs);
        }
      } else if (clip && clip.asset.kind === "image") {
        const newTime = curTime + deltaMs;
        const clipEndMs = clip.clip.startMs + clip.clip.durationMs;
        onTimeUpdateRef.current(Math.min(newTime, clipEndMs));
      } else {
        // No active clip — advance time to find the next clip
        const newTime = curTime + deltaMs;
        if (newTime < seqEnd) {
          onTimeUpdateRef.current(newTime);
        } else {
          onTimeUpdateRef.current(seqEnd);
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
    if (activeClip.asset.kind === "video") {
      video.currentTime = activeClip.clipTimeMs / 1000;
    }
  }, [currentTimeMs, isPlaying]);

  const rotation = activeClip?.clip.transform?.rotation ?? 0;
  const crop = activeClip?.clip.crop;

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
        height: "100%",
        background: "#000",
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
          <span style={{ color: "#555", fontSize: "14px" }}>No clip at playhead</span>
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
                  transform: rotation ? `rotate(${rotation}deg)` : undefined,
                }}
              />
            ) : (
              <video
                ref={videoRef}
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                  transform: rotation ? `rotate(${rotation}deg)` : undefined,
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
          background: "#1a1a1a",
          borderTop: "1px solid #333",
          flexShrink: 0,
        }}
      >
        <button
          onClick={() => {
            // If at the end of sequence, reset to start before playing
            if (!isPlaying) {
              const seqEnd = getSequenceEndMs(project);
              if (seqEnd > 0 && currentTimeMs >= seqEnd) {
                onTimeUpdate(0);
              }
            }
            onPlayPause();
          }}
          style={{
            background: "none",
            border: "1px solid #555",
            color: "#ccc",
            padding: "4px 16px",
            cursor: "pointer",
            borderRadius: "3px",
            fontSize: "13px",
            minWidth: "60px",
          }}
        >
          {isPlaying ? "Pause" : "Play"}
        </button>
        <span style={{ color: "#888", fontSize: "12px" }}>
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
