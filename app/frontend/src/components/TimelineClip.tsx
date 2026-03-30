import { useRef, useCallback, useState, useEffect } from "react";
import type { Clip, Asset } from "@video/shared";
import { theme } from "../theme";
import { clipKindRegistry } from "../lib/clip-kind-registry";

type Props = {
  clip: Clip;
  asset: Asset | undefined;
  msToPx: (ms: number) => number;
  pxToMs: (px: number) => number;
  maxDurationMs: number;
  isSelected: boolean;
  onSelect: (clipId: string, opts?: { shiftKey?: boolean }) => void;
  onMove: (clipId: string, newStartMs: number, targetTrackId?: string) => void;
  onTrim: (clipId: string, side: "left" | "right", deltaMs: number) => void;
  onRippleTrim?: (clipId: string, side: "left" | "right", deltaMs: number) => void;
  onContextMenu?: (clipId: string, position: { x: number; y: number }) => void;
  trackId: string;
  allTrackIds: string[];
  onDragTrackChange?: (targetTrackId: string | null) => void;
  onSplitClip?: (clipId: string, splitTimeMs: number) => void;
  toolMode?: "select" | "razor";
  isLocked?: boolean;
};

const TRIM_HANDLE_WIDTH = 6;
const TRACK_HEIGHT = 40;

const CLIP_KIND_ICONS: Record<string, string> = {
  video: "\u{1F3AC}",
  image: "\u{1F5BC}",
  title: "\u{1F524}",
  audio: "\u{1F3B5}",
};

export function TimelineClip({
  clip,
  asset,
  msToPx,
  pxToMs,
  maxDurationMs,
  isSelected,
  onSelect,
  onMove,
  onTrim,
  onRippleTrim,
  onContextMenu,
  trackId,
  allTrackIds,
  onDragTrackChange,
  onSplitClip,
  toolMode = "select",
  isLocked = false,
}: Props) {
  const width = msToPx(clip.durationMs);
  const left = msToPx(clip.startMs);
  const isTextClip = !!clip.text;
  const isEmptyAsset = clip.assetId === "" && !isTextClip;
  const label = isTextClip
    ? (clip.text?.value || "Text")
    : isEmptyAsset
      ? "No Asset"
      : asset
        ? asset.originalPath.split("/").pop() ?? asset.kind
        : "clip";

  const descriptor = clipKindRegistry.get(clip.clipKind);
  const bgColor = isEmptyAsset
    ? (isSelected ? theme.bgHover : theme.bgDark)
    : isSelected ? (descriptor?.clipSelectedColor ?? theme.clipVideoSelect) : (descriptor?.clipColor ?? theme.clipVideo);
  const borderColor = isEmptyAsset
    ? theme.textMuted
    : isSelected ? theme.text : (descriptor?.clipColor ?? theme.clipVideo);
  const dragRef = useRef<{ startX: number; startMs: number; startY: number; sourceTrackIndex: number } | null>(null);
  const trimRef = useRef<{ startX: number; side: "left" | "right" } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingToOtherTrack, setIsDraggingToOtherTrack] = useState(false);
  const [trimTooltip, setTrimTooltip] = useState<{ side: "left" | "right"; label: string } | null>(null);

  const handleRazorClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      if (!onSplitClip) return;
      // Calculate the time position where the user clicked within the clip
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickMs = pxToMs(clickX);
      const splitTimeMs = clip.startMs + clickMs;
      onSplitClip(clip.id, splitTimeMs);
    },
    [clip.id, clip.startMs, pxToMs, onSplitClip],
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();

      if (toolMode === "razor") {
        if (isLocked) return;
        handleRazorClick(e);
        return;
      }

      onSelect(clip.id, { shiftKey: e.shiftKey });
      if (isLocked) return;
      const sourceTrackIndex = allTrackIds.indexOf(trackId);
      dragRef.current = { startX: e.clientX, startMs: clip.startMs, startY: e.clientY, sourceTrackIndex };
      setIsDragging(true);
      setIsDraggingToOtherTrack(false);
      document.body.style.cursor = "grabbing";

      const getTargetTrackId = (clientY: number) => {
        if (!dragRef.current) return trackId;
        const dy = clientY - dragRef.current.startY;
        const trackOffset = Math.round(dy / TRACK_HEIGHT);
        const targetIndex = Math.max(0, Math.min(allTrackIds.length - 1, dragRef.current.sourceTrackIndex + trackOffset));
        return allTrackIds[targetIndex];
      };

      const clampStartMs = (dx: number) => {
        const deltaMs = pxToMs(dx);
        return Math.min(
          dragRef.current!.startMs + deltaMs,
          Math.max(0, maxDurationMs - clip.durationMs),
        );
      };

      const handleMouseMove = (ev: MouseEvent) => {
        if (!dragRef.current) return;
        const dx = ev.clientX - dragRef.current.startX;
        const newStartMs = clampStartMs(dx);
        onMove(clip.id, newStartMs);

        const target = getTargetTrackId(ev.clientY);
        const isOther = target !== trackId;
        setIsDraggingToOtherTrack(isOther);
        onDragTrackChange?.(isOther ? target : null);
      };

      const handleMouseUp = (ev: MouseEvent) => {
        if (dragRef.current) {
          const target = getTargetTrackId(ev.clientY);
          if (target !== trackId) {
            const dx = ev.clientX - dragRef.current.startX;
            const newStartMs = clampStartMs(dx);
            onMove(clip.id, newStartMs, target);
          }
        }
        onDragTrackChange?.(null);
        setIsDraggingToOtherTrack(false);
        dragRef.current = null;
        setIsDragging(false);
        document.body.style.cursor = "";
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [clip.id, clip.startMs, clip.durationMs, pxToMs, onSelect, onMove, maxDurationMs, trackId, allTrackIds, onDragTrackChange, toolMode, handleRazorClick, isLocked],
  );

  const formatTrimLabel = useCallback(
    (side: "left" | "right") => {
      const val = side === "left" ? clip.inMs : clip.outMs;
      return `${side === "left" ? "In" : "Out"}: ${(val / 1000).toFixed(1)}s`;
    },
    [clip.inMs, clip.outMs],
  );

  const handleTrimMouseDown = useCallback(
    (side: "left" | "right", e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      if (isLocked) return;
      onSelect(clip.id);
      trimRef.current = { startX: e.clientX, side };
      setTrimTooltip({ side, label: formatTrimLabel(side) });
      document.body.style.cursor = "col-resize";

      const handleMouseMove = (ev: MouseEvent) => {
        if (!trimRef.current) return;
        const dx = ev.clientX - trimRef.current.startX;
        const deltaMs = pxToMs(dx);
        trimRef.current.startX = ev.clientX;
        if (ev.shiftKey && onRippleTrim) {
          onRippleTrim(clip.id, trimRef.current.side, deltaMs);
        } else {
          onTrim(clip.id, trimRef.current.side, deltaMs);
        }
      };

      const handleMouseUp = () => {
        trimRef.current = null;
        setTrimTooltip(null);
        document.body.style.cursor = "";
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [clip.id, pxToMs, onSelect, onTrim, onRippleTrim, formatTrimLabel, isLocked],
  );

  // Update tooltip value during trim drag
  useEffect(() => {
    if (trimTooltip) {
      setTrimTooltip({ side: trimTooltip.side, label: formatTrimLabel(trimTooltip.side) });
    }
  }, [clip.inMs, clip.outMs]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      onMouseDown={handleMouseDown}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onSelect(clip.id);
        onContextMenu?.(clip.id, { x: e.clientX, y: e.clientY });
      }}
      style={{
        position: "absolute",
        left: `${left}px`,
        top: "2px",
        bottom: "2px",
        width: `${width}px`,
        minWidth: "4px",
        background: bgColor,
        borderRadius: "3px",
        border: `${isSelected ? 2 : 1}px ${isEmptyAsset ? "dashed" : "solid"} ${borderColor}`,
        overflow: "hidden",
        cursor: isLocked ? "not-allowed" : toolMode === "razor" ? "crosshair" : isDragging ? "grabbing" : "grab",
        opacity: isDraggingToOtherTrack ? 0.5 : 1,
        display: "flex",
        alignItems: "center",
        padding: `0 ${TRIM_HANDLE_WIDTH + 2}px`,
      }}
    >
      {/* Left trim handle */}
      <TrimHandle
        side="left"
        isSelected={isSelected}
        onMouseDown={(e) => handleTrimMouseDown("left", e)}
      />

      <span
        style={{
          fontSize: "11px",
          color: theme.clipLabelText,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          userSelect: "none",
          pointerEvents: "none",
        }}
      >
        {CLIP_KIND_ICONS[clip.clipKind] ?? ""}{" "}{label}
      </span>

      {/* Chroma Key badge */}
      {clip.chromaKey && (
        <span
          style={{
            fontSize: "9px",
            fontWeight: "bold",
            background: "rgba(0,255,0,0.3)",
            color: theme.white,
            padding: "0 3px",
            borderRadius: "2px",
            marginLeft: "2px",
            flexShrink: 0,
            userSelect: "none",
            pointerEvents: "none",
          }}
        >
          CK
        </span>
      )}

      {/* Keyframe diamonds (shown when selected) */}
      {isSelected && clip.keyframeTracks && clip.keyframeTracks.length > 0 && (
        <div
          style={{
            position: "absolute",
            left: `${TRIM_HANDLE_WIDTH}px`,
            right: `${TRIM_HANDLE_WIDTH}px`,
            bottom: "2px",
            height: "8px",
            pointerEvents: "none",
          }}
        >
          {clip.keyframeTracks.map((track) =>
            track.keyframes.map((kf) => {
              const pxPos = msToPx(kf.timeMs);
              const clipWidthInner = width - TRIM_HANDLE_WIDTH * 2;
              if (pxPos < 0 || pxPos > clipWidthInner) return null;
              return (
                <div
                  key={`${track.property}-${kf.timeMs}`}
                  style={{
                    position: "absolute",
                    left: `${pxPos - 4}px`,
                    top: 0,
                    width: "8px",
                    height: "8px",
                    transform: "rotate(45deg)",
                    background: theme.accent,
                    border: `1px solid ${theme.white}`,
                    borderRadius: "1px",
                  }}
                  title={`${track.property} @ ${(kf.timeMs / 1000).toFixed(1)}s`}
                />
              );
            }),
          )}
        </div>
      )}

      {/* Right trim handle */}
      <TrimHandle
        side="right"
        isSelected={isSelected}
        onMouseDown={(e) => handleTrimMouseDown("right", e)}
      />

      {/* Trim tooltip */}
      {trimTooltip && (
        <div
          style={{
            position: "absolute",
            top: "-22px",
            [trimTooltip.side === "left" ? "left" : "right"]: 0,
            background: theme.overlayDark,
            color: theme.white,
            fontSize: "10px",
            padding: "2px 6px",
            borderRadius: "3px",
            whiteSpace: "nowrap",
            pointerEvents: "none",
            zIndex: 10,
          }}
        >
          {trimTooltip.label}
        </div>
      )}
    </div>
  );
}

function TrimHandle({
  side,
  isSelected,
  onMouseDown,
}: {
  side: "left" | "right";
  isSelected: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const active = isSelected || hovered;

  return (
    <div
      onMouseDown={onMouseDown}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "absolute",
        [side === "left" ? "left" : "right"]: 0,
        top: 0,
        bottom: 0,
        width: hovered ? "8px" : `${TRIM_HANDLE_WIDTH}px`,
        cursor: "col-resize",
        background: active ? theme.overlayLightMed : "transparent",
        [side === "left" ? "borderRight" : "borderLeft"]: active
          ? `1px solid ${theme.overlayLightBorder}`
          : `1px solid ${theme.overlayLightSubtle}`,
        transition: "width 0.1s, background 0.1s",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {active && (
        <div
          style={{
            width: "2px",
            height: "12px",
            borderLeft: `1px solid ${theme.overlayLightBorder}`,
            borderRight: `1px solid ${theme.overlayLightBorder}`,
            pointerEvents: "none",
          }}
        />
      )}
    </div>
  );
}
