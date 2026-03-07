import { useEffect, useRef, useCallback } from "react";
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
  onSelectClip: (clipId: string | null) => void;
  onDeleteClip?: (clipId: string) => void;
  onMoveClip?: (clipId: string, newStartMs: number) => void;
  onTrimClip?: (clipId: string, side: "left" | "right", deltaMs: number) => void;
};

function getTimelineDuration(project: Project): number {
  let maxMs = 0;
  for (const track of project.sequence.tracks) {
    for (const clip of track.clips) {
      const end = clip.startMs + clip.durationMs;
      if (end > maxMs) maxMs = end;
    }
  }
  return Math.max(maxMs + 5000, 10000);
}

export function Timeline({
  project,
  currentTimeMs,
  onSeek,
  selectedClipId,
  onSelectClip,
  onDeleteClip,
  onMoveClip,
  onTrimClip,
}: Props) {
  const { msToPx, pxToMs, zoomIn, zoomOut } = useTimelineZoom();
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const durationMs = getTimelineDuration(project);
  const totalWidth = msToPx(durationMs);
  const playheadPx = msToPx(currentTimeMs);

  const rulerRef = useRef<HTMLDivElement>(null);

  const seekFromMouseEvent = useCallback(
    (clientX: number) => {
      const ruler = rulerRef.current;
      if (!ruler) return;
      const rect = ruler.getBoundingClientRect();
      const scrollLeft = scrollRef.current?.scrollLeft ?? 0;
      // Subtract 32px paddingLeft (track label area)
      const x = clientX - rect.left + scrollLeft - 32;
      const ms = Math.max(0, pxToMs(x));
      onSeek(ms);
    },
    [pxToMs, onSeek],
  );

  const handleRulerMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      seekFromMouseEvent(e.clientX);

      const handleMouseMove = (ev: MouseEvent) => {
        seekFromMouseEvent(ev.clientX);
      };
      const handleMouseUp = () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.body.style.cursor = "";
      };
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
    },
    [seekFromMouseEvent],
  );

  const handleMove = useCallback(
    (clipId: string, newStartMs: number) => {
      onMoveClip?.(clipId, newStartMs);
    },
    [onMoveClip],
  );

  const handleTrim = useCallback(
    (clipId: string, side: "left" | "right", deltaMs: number) => {
      onTrimClip?.(clipId, side, deltaMs);
    },
    [onTrimClip],
  );

  // Handle Delete key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        selectedClipId &&
        onDeleteClip
      ) {
        // Don't delete if user is typing in an input
        const target = e.target as HTMLElement;
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
        e.preventDefault();
        onDeleteClip(selectedClipId);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedClipId, onDeleteClip]);

  return (
    <div
      ref={containerRef}
      style={{ display: "flex", flexDirection: "column", height: "100%" }}
      tabIndex={-1}
    >
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
            ref={rulerRef}
            onMouseDown={handleRulerMouseDown}
            style={{ cursor: "col-resize", paddingLeft: "32px" }}
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
                  pxToMs={pxToMs}
                  totalWidth={totalWidth}
                  selectedClipId={selectedClipId}
                  onSelectClip={onSelectClip}
                  onMoveClip={handleMove}
                  onTrimClip={handleTrim}
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
