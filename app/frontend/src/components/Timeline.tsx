import { useState, useEffect, useRef, useCallback } from "react";
import type { Project, Track, ClipTransition } from "@video/shared";
import { TimelineRuler } from "./TimelineRuler";
import { TimelineTrack } from "./TimelineTrack";
import { Playhead } from "./Playhead";
import { ContextMenu } from "./ContextMenu";
import { ConfirmDialog } from "./ConfirmDialog";
import { ClipKindPopup } from "./ClipKindPopup";
import { useTimelineZoom } from "../hooks/useTimelineZoom";
import { theme } from "../theme";

type Props = {
  project: Project;
  currentTimeMs: number;
  onSeek: (ms: number) => void;
  selectedClipId: string | null;
  onSelectClip: (clipId: string | null) => void;
  onDeleteClip?: (clipId: string) => void;
  onRippleDeleteClip?: (clipId: string) => void;
  onMoveClip?: (clipId: string, newStartMs: number, targetTrackId?: string) => void;
  onTrimClip?: (clipId: string, side: "left" | "right", deltaMs: number) => void;
  onRippleTrimClip?: (clipId: string, side: "left" | "right", deltaMs: number) => void;
  onAddTrack?: () => void;
  onDeleteTrack?: (trackId: string) => void;
  onSetTransition?: (clipId: string, transition: ClipTransition | undefined) => void;
  onAddEmptyClip?: (clipKind: string, startMs: number, trackId: string) => void;
  onSplitClip?: (clipId: string, splitTimeMs: number) => void;
  toolMode?: "select" | "razor";
};

function getTimelineDuration(project: Project): number {
  return project.settings.durationMs;
}

export function Timeline({
  project,
  currentTimeMs,
  onSeek,
  selectedClipId,
  onSelectClip,
  onDeleteClip,
  onRippleDeleteClip,
  onMoveClip,
  onTrimClip,
  onRippleTrimClip,
  onAddTrack,
  onDeleteTrack,
  onSetTransition,
  onAddEmptyClip,
  onSplitClip,
  toolMode = "select",
}: Props) {
  const { msToPx, pxToMs, zoomIn, zoomOut } = useTimelineZoom();
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [contextMenu, setContextMenu] = useState<{
    clipId: string;
    x: number;
    y: number;
  } | null>(null);
  const [dragTargetTrackId, setDragTargetTrackId] = useState<string | null>(null);
  const [trackContextMenu, setTrackContextMenu] = useState<{
    trackId: string;
    x: number;
    y: number;
  } | null>(null);
  const [confirmDeleteTrackId, setConfirmDeleteTrackId] = useState<string | null>(null);
  const [clipKindPopup, setClipKindPopup] = useState<{
    trackId: string;
    timeMs: number;
    x: number;
    y: number;
  } | null>(null);
  const allTrackIds = project.sequence.tracks.map((t: Track) => t.id);

  const handleClipContextMenu = useCallback(
    (clipId: string, position: { x: number; y: number }) => {
      setContextMenu({ clipId, x: position.x, y: position.y });
    },
    [],
  );
  const handleTrackContextMenu = useCallback(
    (trackId: string, position: { x: number; y: number }) => {
      setTrackContextMenu({ trackId, x: position.x, y: position.y });
    },
    [],
  );
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
    (clipId: string, newStartMs: number, targetTrackId?: string) => {
      onMoveClip?.(clipId, newStartMs, targetTrackId);
    },
    [onMoveClip],
  );

  const handleTrim = useCallback(
    (clipId: string, side: "left" | "right", deltaMs: number) => {
      onTrimClip?.(clipId, side, deltaMs);
    },
    [onTrimClip],
  );

  const handleTrackDoubleClick = useCallback(
    (trackId: string, timeMs: number, position: { x: number; y: number }) => {
      if (!onAddEmptyClip) return;
      setClipKindPopup({ trackId, timeMs, x: position.x, y: position.y });
    },
    [onAddEmptyClip],
  );

  // Handle Delete key (Shift+Delete = ripple delete)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        selectedClipId
      ) {
        // Don't delete if user is typing in an input
        const target = e.target as HTMLElement;
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
        e.preventDefault();
        if (e.shiftKey && onRippleDeleteClip) {
          onRippleDeleteClip(selectedClipId);
        } else if (onDeleteClip) {
          onDeleteClip(selectedClipId);
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedClipId, onDeleteClip, onRippleDeleteClip]);

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
          background: theme.bgPanel,
          borderBottom: `1px solid ${theme.border}`,
          flexShrink: 0,
        }}
      >
        <button
          onClick={zoomOut}
          style={{
            background: "none",
            border: `1px solid ${theme.border}`,
            color: theme.text,
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
            border: `1px solid ${theme.border}`,
            color: theme.text,
            padding: "2px 8px",
            cursor: "pointer",
            borderRadius: "3px",
            fontSize: "12px",
          }}
        >
          +
        </button>
        <span style={{ color: theme.textMuted, fontSize: "11px", marginLeft: "8px" }}>
          {formatTime(currentTimeMs)}
        </span>
      </div>

      {/* Scrollable area */}
      <div
        ref={scrollRef}
        style={{ flex: 1, overflowX: "auto", overflowY: "auto" }}
      >
        <div style={{ position: "relative", minWidth: `${totalWidth + 32}px`, display: "flex", flexDirection: "column" as const, minHeight: "100%" }}>
          {/* Ruler */}
          <div
            ref={rulerRef}
            onMouseDown={handleRulerMouseDown}
            style={{ cursor: "col-resize", paddingLeft: "32px" }}
          >
            <TimelineRuler durationMs={durationMs} msToPx={msToPx} />
          </div>

          {/* Seek bar + Tracks wrapper (shared position parent for Playhead) */}
          <div
            onMouseDown={handleRulerMouseDown}
            style={{ position: "relative", flex: 1, cursor: "col-resize" }}
          >
            {/* Seek bar row */}
            <div
              onMouseDown={handleRulerMouseDown}
              style={{
                height: "16px",
                background: theme.bgHover,
                borderBottom: `1px solid ${theme.border}`,
                cursor: "col-resize",
                paddingLeft: "32px",
              }}
            />

            {/* Tracks */}
            {project.sequence.tracks.length === 0 ? (
              <div
                style={{
                  color: theme.textMuted,
                  padding: "16px 32px",
                  fontSize: "13px",
                }}
              >
                No clips yet. Add assets from the panel.
              </div>
            ) : (
              project.sequence.tracks.map((track: Track, index: number) => (
                <TimelineTrack
                  key={track.id}
                  track={track}
                  trackIndex={index}
                  assets={project.assets}
                  msToPx={msToPx}
                  pxToMs={pxToMs}
                  totalWidth={totalWidth}
                  maxDurationMs={project.settings.durationMs}
                  selectedClipId={selectedClipId}
                  onSelectClip={onSelectClip}
                  onMoveClip={handleMove}
                  onTrimClip={handleTrim}
                  onRippleTrimClip={onRippleTrimClip}
                  onContextMenu={handleClipContextMenu}
                  onTrackContextMenu={handleTrackContextMenu}
                  allTrackIds={allTrackIds}
                  isDropTarget={dragTargetTrackId === track.id}
                  onDragTrackChange={setDragTargetTrackId}
                  onSetTransition={onSetTransition}
                  onTrackDoubleClick={handleTrackDoubleClick}
                  onSplitClip={onSplitClip}
                  toolMode={toolMode}
                />
              ))
            )}

            {/* Add Track button row */}
            {onAddTrack && (
              <div
                style={{
                  display: "flex",
                  height: "40px",
                  borderBottom: `1px solid ${theme.border}`,
                }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddTrack();
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  style={{
                    width: "32px",
                    height: "40px",
                    background: "none",
                    border: "none",
                    borderRight: `1px solid ${theme.border}`,
                    color: theme.textMuted,
                    fontSize: "11px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = theme.bgHover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "none";
                  }}
                >
                  +
                </button>
              </div>
            )}

            {/* Duration end marker */}
            <div
              style={{
                position: "absolute",
                left: `${msToPx(project.settings.durationMs) + 32}px`,
                top: 0,
                bottom: 0,
                borderLeft: `2px dashed ${theme.error}80`,
                pointerEvents: "none",
                zIndex: 1,
              }}
            />

            {/* Playhead (spans seek bar + tracks) */}
            <Playhead positionPx={playheadPx + 32} />
          </div>
        </div>
      </div>

      {contextMenu && onDeleteClip && (
        <ContextMenu
          position={{ x: contextMenu.x, y: contextMenu.y }}
          onClose={() => setContextMenu(null)}
          items={[
            {
              label: "Delete",
              onClick: () => {
                onDeleteClip(contextMenu.clipId);
                onSelectClip(null);
              },
            },
            ...(onRippleDeleteClip
              ? [
                  {
                    label: "Ripple Delete (Shift+Del)",
                    onClick: () => {
                      onRippleDeleteClip(contextMenu.clipId);
                      onSelectClip(null);
                    },
                  },
                ]
              : []),
          ]}
        />
      )}

      {trackContextMenu && onDeleteTrack && (
        <ContextMenu
          position={{ x: trackContextMenu.x, y: trackContextMenu.y }}
          onClose={() => setTrackContextMenu(null)}
          items={[
            {
              label: "Delete Track",
              onClick: () => {
                setConfirmDeleteTrackId(trackContextMenu.trackId);
                setTrackContextMenu(null);
              },
            },
          ]}
        />
      )}

      {confirmDeleteTrackId && onDeleteTrack && (
        <ConfirmDialog
          message="Are you sure you want to delete this track? All clips in this track will be removed."
          onConfirm={() => {
            onDeleteTrack(confirmDeleteTrackId);
            setConfirmDeleteTrackId(null);
          }}
          onCancel={() => setConfirmDeleteTrackId(null)}
        />
      )}

      {clipKindPopup && onAddEmptyClip && (
        <ClipKindPopup
          position={{ x: clipKindPopup.x, y: clipKindPopup.y }}
          onSelect={(clipKind) => {
            onAddEmptyClip(clipKind, Math.max(0, Math.round(clipKindPopup.timeMs)), clipKindPopup.trackId);
            setClipKindPopup(null);
          }}
          onClose={() => setClipKindPopup(null)}
        />
      )}
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
