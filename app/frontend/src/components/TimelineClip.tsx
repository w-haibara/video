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
}: Props) {
  const width = msToPx(clip.durationMs);
  const left = msToPx(clip.startMs);
  const label = asset
    ? asset.originalPath.split("/").pop() ?? asset.kind
    : "clip";
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
      style={{
        position: "absolute",
        left: `${left}px`,
        top: "2px",
        bottom: "2px",
        width: `${width}px`,
        minWidth: "4px",
        background: isSelected ? "#4a7fff" : "#3a6ad4",
        borderRadius: "3px",
        border: isSelected ? "2px solid #fff" : "1px solid #2a4a9a",
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
