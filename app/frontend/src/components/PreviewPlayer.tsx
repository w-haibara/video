import { useRef, useState, useEffect, useCallback } from "react";
import type { Project, Clip, Asset } from "@video/shared";

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

function findActiveClip(project: Project, timeMs: number): ActiveClip | null {
  // Find the video clip at the current time
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

  const activeClip = findActiveClip(project, currentTimeMs);

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
  }, [activeClip?.clip.id, mediaUrl]);

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
    if (!isPlaying || !activeClip) return;

    const tick = () => {
      const video = videoRef.current;
      if (video && activeClip.asset.kind === "video" && !video.paused) {
        const videoTimeMs = video.currentTime * 1000;
        const timelineMs =
          activeClip.clip.startMs + (videoTimeMs - activeClip.clip.inMs);
        onTimeUpdate(timelineMs);
      } else if (activeClip.asset.kind === "image") {
        // For images, advance time by frame
        onTimeUpdate(currentTimeMs + 1000 / 30);
      }
      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isPlaying, activeClip?.clip.id, activeClip?.asset.kind]);

  // Seek video when timeline is scrubbed (not playing)
  useEffect(() => {
    const video = videoRef.current;
    if (!video || isPlaying || !activeClip) return;
    if (activeClip.asset.kind === "video") {
      video.currentTime = activeClip.clipTimeMs / 1000;
    }
  }, [currentTimeMs, isPlaying]);

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
        ) : isImage ? (
          <img
            src={thumbnailUrl}
            alt=""
            style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
          />
        ) : (
          <video
            ref={videoRef}
            style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
            muted
          />
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
          onClick={onPlayPause}
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

function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  const frac = Math.floor((ms % 1000) / 100);
  return `${min}:${sec.toString().padStart(2, "0")}.${frac}`;
}
