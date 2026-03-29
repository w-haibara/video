import { useState, useRef, useCallback, useMemo } from "react";
import type { Project, Track, ClipTransition, Marker } from "@video/shared";
import { TimelineRuler } from "./TimelineRuler";
import { TimelineTrack } from "./TimelineTrack";
import { TimelineMarkers } from "./TimelineMarkers";
import { Playhead } from "./Playhead";
import { ContextMenu } from "./ContextMenu";
import type { MenuItem } from "./ContextMenu";
import { ConfirmDialog } from "./ConfirmDialog";
import { ClipKindPopup } from "./ClipKindPopup";
import { useTimelineZoom } from "../hooks/useTimelineZoom";
import { snapClipPosition } from "../lib/snap-utils";
import { theme } from "../theme";

/** Snap threshold in pixels. Converted to ms using pxToMs at runtime. */
const SNAP_THRESHOLD_PX = 10;

/** Preset track colors for the color submenu. */
const TRACK_COLOR_PRESETS = [
  { label: "Red", value: "#DC322F" },
  { label: "Orange", value: "#CB4B16" },
  { label: "Yellow", value: "#B58900" },
  { label: "Green", value: "#859900" },
  { label: "Cyan", value: "#2AA198" },
  { label: "Blue", value: "#268BD2" },
  { label: "Violet", value: "#6C71C4" },
  { label: "Magenta", value: "#D33682" },
];

type Props = {
  project: Project;
  currentTimeMs: number;
  onSeek: (ms: number) => void;
  selectedClipIds: Set<string>;
  onSelectClip: (clipId: string | null, opts?: { shiftKey?: boolean }) => void;
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
  onCopyClip?: () => void;
  onPasteClip?: () => void;
  onDuplicateClip?: () => void;
  onPasteAttributes?: () => void;
  hasClipboard?: boolean;
  snapEnabled?: boolean;
  onToggleSnap?: () => void;
  onToggleTrackLocked?: (trackId: string, locked: boolean) => void;
  onToggleTrackMuted?: (trackId: string, muted: boolean) => void;
  onSetTrackName?: (trackId: string, name: string) => void;
  onSetTrackColor?: (trackId: string, color: string | undefined) => void;
  markers?: Marker[];
  selectedMarkerId?: string | null;
  onSelectMarker?: (markerId: string | null) => void;
  onDeleteMarker?: (markerId: string) => void;
  onUpdateMarker?: (markerId: string, updates: { label?: string }) => void;
};

function getTimelineDuration(project: Project): number {
  return project.settings.durationMs;
}

export function Timeline({
  project,
  currentTimeMs,
  onSeek,
  selectedClipIds,
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
  onCopyClip,
  onPasteClip,
  onDuplicateClip,
  onPasteAttributes,
  hasClipboard,
  snapEnabled = true,
  onToggleSnap,
  onToggleTrackLocked,
  onToggleTrackMuted,
  onSetTrackName,
  onSetTrackColor,
  markers = [],
  selectedMarkerId = null,
  onSelectMarker,
  onDeleteMarker,
  onUpdateMarker,
}: Props) {
  const { msToPx, pxToMs, zoomIn, zoomOut } = useTimelineZoom();
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [contextMenu, setContextMenu] = useState<{
    clipId: string;
    x: number;
    y: number;
  } | null>(null);
  const [dragTargetTrackId, setDragTargetTrackIdRaw] = useState<string | null>(null);
  const setDragTargetTrackId = useCallback((trackId: string | null) => {
    setDragTargetTrackIdRaw(trackId);
    // Clear snap line when drag ends (trackId goes to null from mouseup)
    if (trackId === null) setSnapLineMs(undefined);
  }, []);
  const [trackContextMenu, setTrackContextMenu] = useState<{
    trackId: string;
    x: number;
    y: number;
  } | null>(null);
  const [confirmDeleteTrackId, setConfirmDeleteTrackId] = useState<string | null>(null);
  const [renamingTrackId, setRenamingTrackId] = useState<string | null>(null);
  const [clipKindPopup, setClipKindPopup] = useState<{
    trackId: string;
    timeMs: number;
    x: number;
    y: number;
  } | null>(null);
  const allTrackIds = project.sequence.tracks.map((t: Track) => t.id);
  const [snapLineMs, setSnapLineMs] = useState<number | undefined>(undefined);

  /** Collect all snap target points (clip edges, playhead, time 0) excluding a given clip */
  const getSnapTargets = useCallback(
    (excludeClipId: string): number[] => {
      const targets: number[] = [0, currentTimeMs];
      for (const track of project.sequence.tracks) {
        for (const clip of track.clips) {
          if (clip.id === excludeClipId) continue;
          targets.push(clip.startMs);
          targets.push(clip.startMs + clip.durationMs);
        }
      }
      return targets;
    },
    [project.sequence.tracks, currentTimeMs],
  );

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
      // Subtract 80px paddingLeft (track label area)
      const x = clientX - rect.left + scrollLeft - 80;
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
      if (snapEnabled && !targetTrackId) {
        // Find the clip's duration to check both edges
        let clipDurationMs = 0;
        for (const track of project.sequence.tracks) {
          const clip = track.clips.find((c) => c.id === clipId);
          if (clip) {
            clipDurationMs = clip.durationMs;
            break;
          }
        }
        const thresholdMs = pxToMs(SNAP_THRESHOLD_PX);
        const targets = getSnapTargets(clipId);
        const snap = snapClipPosition(newStartMs, clipDurationMs, targets, thresholdMs);
        setSnapLineMs(snap.snapLineMs);
        onMoveClip?.(clipId, snap.snappedMs, targetTrackId);
      } else {
        setSnapLineMs(undefined);
        onMoveClip?.(clipId, newStartMs, targetTrackId);
      }
    },
    [onMoveClip, snapEnabled, pxToMs, getSnapTargets, project.sequence.tracks],
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
        {onToggleSnap && (
          <button
            onClick={onToggleSnap}
            title={`Snapping ${snapEnabled ? "ON" : "OFF"} (N)`}
            style={{
              background: snapEnabled ? theme.bgHover : "none",
              border: `1px solid ${snapEnabled ? theme.primary : theme.border}`,
              color: snapEnabled ? theme.primary : theme.textMuted,
              padding: "2px 8px",
              cursor: "pointer",
              borderRadius: "3px",
              fontSize: "12px",
              fontWeight: snapEnabled ? "bold" : "normal",
              marginLeft: "4px",
            }}
          >
            Snap
          </button>
        )}
        <span style={{ color: theme.textMuted, fontSize: "11px", marginLeft: "8px" }}>
          {formatTime(currentTimeMs)}
        </span>
      </div>

      {/* Scrollable area */}
      <div
        ref={scrollRef}
        style={{ flex: 1, overflowX: "auto", overflowY: "auto" }}
      >
        <div style={{ position: "relative", minWidth: `${totalWidth + 80}px`, display: "flex", flexDirection: "column" as const, minHeight: "100%" }}>
          {/* Ruler */}
          <div
            ref={rulerRef}
            onMouseDown={handleRulerMouseDown}
            style={{ cursor: "col-resize", paddingLeft: "80px", position: "relative" }}
          >
            <TimelineRuler durationMs={durationMs} msToPx={msToPx} />
            {markers.length > 0 && onSelectMarker && onDeleteMarker && onUpdateMarker && (
              <TimelineMarkers
                markers={markers}
                msToPx={msToPx}
                selectedMarkerId={selectedMarkerId}
                onSelectMarker={onSelectMarker}
                onDeleteMarker={onDeleteMarker}
                onUpdateMarker={onUpdateMarker}
              />
            )}
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
                paddingLeft: "80px",
              }}
            />

            {/* Tracks */}
            {project.sequence.tracks.length === 0 ? (
              <div
                style={{
                  color: theme.textMuted,
                  padding: "16px 80px",
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
                  selectedClipIds={selectedClipIds}
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
                  onToggleLocked={onToggleTrackLocked}
                  onToggleMuted={onToggleTrackMuted}
                  onSetTrackName={onSetTrackName}
                  onSetTrackColor={onSetTrackColor}
                  isRenaming={renamingTrackId === track.id}
                  onFinishRename={() => setRenamingTrackId(null)}
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
                    width: "80px",
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
                left: `${msToPx(project.settings.durationMs) + 80}px`,
                top: 0,
                bottom: 0,
                borderLeft: `2px dashed ${theme.error}80`,
                pointerEvents: "none",
                zIndex: 1,
              }}
            />

            {/* Snap line indicator */}
            {snapLineMs !== undefined && (
              <div
                style={{
                  position: "absolute",
                  left: `${msToPx(snapLineMs) + 80}px`,
                  top: 0,
                  bottom: 0,
                  width: "1px",
                  background: theme.warning,
                  pointerEvents: "none",
                  zIndex: 12,
                }}
              />
            )}

            {/* Playhead (spans seek bar + tracks) */}
            <Playhead positionPx={playheadPx + 80} />
          </div>
        </div>
      </div>

      {contextMenu && onDeleteClip && (
        <ContextMenu
          position={{ x: contextMenu.x, y: contextMenu.y }}
          onClose={() => setContextMenu(null)}
          items={(() => {
            const items: MenuItem[] = [];

            // Group 1: Split
            if (onSplitClip) {
              items.push({
                label: "Split at Playhead",
                shortcut: "S",
                onClick: () => {
                  onSplitClip(contextMenu.clipId, currentTimeMs);
                },
              });
            }

            // Separator between split and clipboard group
            if (onSplitClip && (onCopyClip || onDuplicateClip)) {
              items.push({ type: "separator" });
            }

            // Group 2: Clipboard operations
            if (onCopyClip) {
              items.push({
                label: "Copy",
                shortcut: "Ctrl+C",
                onClick: () => {
                  onSelectClip(contextMenu.clipId);
                  onCopyClip();
                },
              });
            }
            if (onPasteClip) {
              items.push({
                label: "Paste",
                shortcut: "Ctrl+V",
                disabled: !hasClipboard,
                onClick: () => {
                  onPasteClip();
                },
              });
            }
            if (onDuplicateClip) {
              items.push({
                label: "Duplicate",
                shortcut: "Ctrl+D",
                onClick: () => {
                  onSelectClip(contextMenu.clipId);
                  onDuplicateClip();
                },
              });
            }
            if (onPasteAttributes) {
              items.push({
                label: "Paste Attributes",
                disabled: !hasClipboard,
                onClick: () => {
                  onSelectClip(contextMenu.clipId);
                  onPasteAttributes();
                },
              });
            }

            // Separator between clipboard and delete group
            if (items.length > 0) {
              items.push({ type: "separator" });
            }

            // Group 3: Delete operations
            if (onRippleDeleteClip) {
              items.push({
                label: "Ripple Delete",
                shortcut: "Shift+Del",
                onClick: () => {
                  onRippleDeleteClip(contextMenu.clipId);
                  onSelectClip(null);
                },
              });
            }
            items.push({
              label: "Delete",
              shortcut: "Del",
              onClick: () => {
                onDeleteClip(contextMenu.clipId);
                onSelectClip(null);
              },
            });

            return items;
          })()}
        />
      )}

      {trackContextMenu && onDeleteTrack && (
        <ContextMenu
          position={{ x: trackContextMenu.x, y: trackContextMenu.y }}
          onClose={() => setTrackContextMenu(null)}
          items={(() => {
            const trk = project.sequence.tracks.find((t: Track) => t.id === trackContextMenu.trackId);
            const items: MenuItem[] = [];
            if (onSetTrackName) {
              items.push({
                label: "Rename Track",
                onClick: () => {
                  setRenamingTrackId(trackContextMenu.trackId);
                  setTrackContextMenu(null);
                },
              });
            }
            if (onSetTrackColor) {
              for (const preset of TRACK_COLOR_PRESETS) {
                items.push({
                  label: `${trk?.color === preset.value ? "\u2713 " : "  "}${preset.label}`,
                  onClick: () => {
                    onSetTrackColor(trackContextMenu.trackId, preset.value);
                  },
                });
              }
              items.push({
                label: `${!trk?.color ? "\u2713 " : "  "}No Color`,
                onClick: () => {
                  onSetTrackColor(trackContextMenu.trackId, undefined);
                },
              });
            }
            if (items.length > 0) {
              items.push({ type: "separator" });
            }
            if (onToggleTrackLocked) {
              items.push({
                label: trk?.locked ? "Unlock Track" : "Lock Track",
                onClick: () => {
                  onToggleTrackLocked(trackContextMenu.trackId, !trk?.locked);
                },
              });
            }
            if (onToggleTrackMuted) {
              items.push({
                label: trk?.muted ? "Unmute Track" : "Mute Track",
                onClick: () => {
                  onToggleTrackMuted(trackContextMenu.trackId, !trk?.muted);
                },
              });
            }
            items.push({ type: "separator" });
            items.push({
              label: "Delete Track",
              onClick: () => {
                setConfirmDeleteTrackId(trackContextMenu.trackId);
                setTrackContextMenu(null);
              },
            });
            return items;
          })()}
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
