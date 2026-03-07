import { useState, useRef, useCallback } from "react";
import type { Project } from "@video/shared";
import { TimelineRuler } from "./TimelineRuler";
import { TimelineTrack } from "./TimelineTrack";
import { Playhead } from "./Playhead";
import { useTimelineZoom } from "../hooks/useTimelineZoom";

type Props = {
  project: Project;
  currentTimeMs: number;
  onSeek: (ms: number) => void;
  selectedClipId: string | null;
  onSelectClip: (clipId: string) => void;
};

function getTimelineDuration(project: Project): number {
  let maxMs = 0;
  for (const track of project.sequence.tracks) {
    for (const clip of track.clips) {
      const end = clip.startMs + clip.durationMs;
      if (end > maxMs) maxMs = end;
    }
  }
  // Add 5 seconds padding for empty space at end
  return Math.max(maxMs + 5000, 10000);
}

export function Timeline({
  project,
  currentTimeMs,
  onSeek,
  selectedClipId,
  onSelectClip,
}: Props) {
  const { msToPx, pxToMs, zoomIn, zoomOut } = useTimelineZoom();
  const scrollRef = useRef<HTMLDivElement>(null);
  const durationMs = getTimelineDuration(project);
  const totalWidth = msToPx(durationMs);
  const playheadPx = msToPx(currentTimeMs);

  const handleRulerClick = useCallback(
    (e: React.MouseEvent) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const scrollLeft = scrollRef.current?.scrollLeft ?? 0;
      const x = e.clientX - rect.left + scrollLeft;
      const ms = Math.max(0, pxToMs(x));
      onSeek(ms);
    },
    [pxToMs, onSeek],
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          padding: "2px 8px",
          background: "#1e1e1e",
          borderBottom: "1px solid #444",
          flexShrink: 0,
        }}
      >
        <button
          onClick={zoomOut}
          style={{
            background: "none",
            border: "1px solid #555",
            color: "#ccc",
            padding: "2px 8px",
            cursor: "pointer",
            borderRadius: "3px",
            fontSize: "12px",
          }}
        >
          -
        </button>
        <button
          onClick={zoomIn}
          style={{
            background: "none",
            border: "1px solid #555",
            color: "#ccc",
            padding: "2px 8px",
            cursor: "pointer",
            borderRadius: "3px",
            fontSize: "12px",
          }}
        >
          +
        </button>
        <span style={{ color: "#888", fontSize: "11px", marginLeft: "8px" }}>
          {formatTime(currentTimeMs)}
        </span>
      </div>

      {/* Scrollable area */}
      <div
        ref={scrollRef}
        style={{ flex: 1, overflowX: "auto", overflowY: "auto" }}
      >
        <div style={{ position: "relative", minWidth: `${totalWidth + 32}px` }}>
          {/* Ruler */}
          <div
            onClick={handleRulerClick}
            style={{ cursor: "pointer", paddingLeft: "32px" }}
          >
            <TimelineRuler durationMs={durationMs} msToPx={msToPx} />
          </div>

          {/* Tracks */}
          <div style={{ position: "relative" }}>
            {project.sequence.tracks.length === 0 ? (
              <div
                style={{
                  color: "#666",
                  padding: "16px 32px",
                  fontSize: "13px",
                }}
              >
                No clips yet. Add assets from the panel.
              </div>
            ) : (
              project.sequence.tracks.map((track) => (
                <TimelineTrack
                  key={track.id}
                  track={track}
                  assets={project.assets}
                  msToPx={msToPx}
                  totalWidth={totalWidth}
                  selectedClipId={selectedClipId}
                  onSelectClip={onSelectClip}
                />
              ))
            )}

            {/* Playhead */}
            <Playhead positionPx={playheadPx + 32} />
          </div>
        </div>
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
