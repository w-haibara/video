import { useRef, useCallback } from "react";
import type { Clip, Asset } from "@video/shared";

type Props = {
  clip: Clip;
  asset: Asset | undefined;
  msToPx: (ms: number) => number;
  pxToMs: (px: number) => number;
  isSelected: boolean;
  onSelect: (clipId: string) => void;
  onMove: (clipId: string, newStartMs: number) => void;
  onTrim: (clipId: string, side: "left" | "right", deltaMs: number) => void;
  onContextMenu?: (clipId: string, position: { x: number; y: number }) => void;
};

const TRIM_HANDLE_WIDTH = 6;

export function TimelineClip({
  clip,
  asset,
  msToPx,
  pxToMs,
  isSelected,
  onSelect,
  onMove,
  onTrim,
  onContextMenu,
}: Props) {
  const width = msToPx(clip.durationMs);
  const left = msToPx(clip.startMs);
  const isTextClip = !!clip.text;
  const isAudioClip = asset?.kind === "audio";
  const label = isTextClip
    ? (clip.text?.value || "Text")
    : asset
      ? asset.originalPath.split("/").pop() ?? asset.kind
      : "clip";

  let bgColor: string;
  let borderColor: string;
  if (isTextClip) {
    bgColor = isSelected ? "#9b59b6" : "#8e44ad";
    borderColor = isSelected ? "#fff" : "#6c3483";
  } else if (isAudioClip) {
    bgColor = isSelected ? "#27ae60" : "#1e8449";
    borderColor = isSelected ? "#fff" : "#145a32";
  } else {
    bgColor = isSelected ? "#4a7fff" : "#3a6ad4";
    borderColor = isSelected ? "#fff" : "#2a4a9a";
  }
  const dragRef = useRef<{ startX: number; startMs: number } | null>(null);
  const trimRef = useRef<{ startX: number; side: "left" | "right" } | null>(null);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      onSelect(clip.id);
      dragRef.current = { startX: e.clientX, startMs: clip.startMs };

      const handleMouseMove = (ev: MouseEvent) => {
        if (!dragRef.current) return;
        const dx = ev.clientX - dragRef.current.startX;
        const deltaMs = pxToMs(dx);
        onMove(clip.id, dragRef.current.startMs + deltaMs);
      };

      const handleMouseUp = () => {
        dragRef.current = null;
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [clip.id, clip.startMs, pxToMs, onSelect, onMove],
  );

  const handleTrimMouseDown = useCallback(
    (side: "left" | "right", e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      onSelect(clip.id);
      trimRef.current = { startX: e.clientX, side };

      const handleMouseMove = (ev: MouseEvent) => {
        if (!trimRef.current) return;
        const dx = ev.clientX - trimRef.current.startX;
        const deltaMs = pxToMs(dx);
        trimRef.current.startX = ev.clientX;
        onTrim(clip.id, trimRef.current.side, deltaMs);
      };

      const handleMouseUp = () => {
        trimRef.current = null;
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [clip.id, pxToMs, onSelect, onTrim],
  );

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
        border: `${isSelected ? 2 : 1}px solid ${borderColor}`,
        overflow: "hidden",
        cursor: "grab",
        display: "flex",
        alignItems: "center",
        padding: `0 ${TRIM_HANDLE_WIDTH + 2}px`,
      }}
    >
      {/* Left trim handle */}
      <div
        onMouseDown={(e) => handleTrimMouseDown("left", e)}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: `${TRIM_HANDLE_WIDTH}px`,
          cursor: "col-resize",
          background: isSelected ? "rgba(255,255,255,0.2)" : "transparent",
          borderRight: "1px solid rgba(255,255,255,0.3)",
        }}
      />

      <span
        style={{
          fontSize: "11px",
          color: "#fff",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          userSelect: "none",
          pointerEvents: "none",
        }}
      >
        {label}
      </span>

      {/* Right trim handle */}
      <div
        onMouseDown={(e) => handleTrimMouseDown("right", e)}
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          bottom: 0,
          width: `${TRIM_HANDLE_WIDTH}px`,
          cursor: "col-resize",
          background: isSelected ? "rgba(255,255,255,0.2)" : "transparent",
          borderLeft: "1px solid rgba(255,255,255,0.3)",
        }}
      />
    </div>
  );
}
