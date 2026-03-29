import { useState, useMemo } from "react";
import type { Track, Asset, Clip, ClipTransition } from "@video/shared";
import { TimelineClip } from "./TimelineClip";
import { clipKindRegistry } from "../lib/clip-kind-registry";
import { theme } from "../theme";

type Props = {
  track: Track;
  trackIndex: number;
  assets: Asset[];
  msToPx: (ms: number) => number;
  pxToMs: (px: number) => number;
  totalWidth: number;
  maxDurationMs: number;
  selectedClipId: string | null;
  onSelectClip: (clipId: string) => void;
  onMoveClip: (clipId: string, newStartMs: number, targetTrackId?: string) => void;
  onTrimClip: (clipId: string, side: "left" | "right", deltaMs: number) => void;
  onContextMenu?: (clipId: string, position: { x: number; y: number }) => void;
  onTrackContextMenu?: (trackId: string, position: { x: number; y: number }) => void;
  allTrackIds: string[];
  isDropTarget?: boolean;
  onDragTrackChange?: (targetTrackId: string | null) => void;
  onSetTransition?: (clipId: string, transition: ClipTransition | undefined) => void;
  onTrackDoubleClick?: (trackId: string, timeMs: number, position: { x: number; y: number }) => void;
};

export function TimelineTrack({
  track,
  trackIndex,
  assets,
  msToPx,
  pxToMs,
  totalWidth,
  maxDurationMs,
  selectedClipId,
  onSelectClip,
  onMoveClip,
  onTrimClip,
  onContextMenu,
  onTrackContextMenu,
  allTrackIds,
  isDropTarget,
  onDragTrackChange,
  onSetTransition,
  onTrackDoubleClick,
}: Props) {
  const assetMap = new Map(assets.map((a) => [a.id, a]));
  const sortedClips = useMemo(
    () => [...track.clips].sort((a, b) => a.startMs - b.startMs),
    [track.clips],
  );

  return (
    <div style={{ display: "flex", height: "40px" }}>
      <div
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onTrackContextMenu?.(track.id, { x: e.clientX, y: e.clientY });
        }}
        style={{
          width: "32px",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: theme.bgHover,
          borderRight: `1px solid ${theme.border}`,
          color: theme.textMuted,
          fontSize: "11px",
          fontWeight: "bold",
          userSelect: "none",
        }}
      >
        {trackIndex + 1}
      </div>
      <div
        onMouseDown={(e) => {
          // Prevent seek handler from firing when interacting with track content
          if (e.detail >= 2) e.stopPropagation();
        }}
        onDoubleClick={(e) => {
          // Only trigger when clicking empty area (not a clip)
          if (e.target !== e.currentTarget) return;
          e.stopPropagation();
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const timeMs = pxToMs(x);
          onTrackDoubleClick?.(track.id, timeMs, { x: e.clientX, y: e.clientY });
        }}
        style={{
          position: "relative",
          flex: 1,
          minWidth: `${totalWidth}px`,
          background: isDropTarget ? theme.bgHover : theme.timelineTrackBg,
          borderBottom: `1px solid ${theme.borderLight}`,
          transition: "background 0.1s",
        }}
      >
        {track.clips.map((clip: Clip) => (
          <TimelineClip
            key={clip.id}
            clip={clip}
            asset={assetMap.get(clip.assetId)}
            msToPx={msToPx}
            pxToMs={pxToMs}
            maxDurationMs={maxDurationMs}
            isSelected={selectedClipId === clip.id}
            onSelect={onSelectClip}
            onMove={onMoveClip}
            onTrim={onTrimClip}
            onContextMenu={onContextMenu}
            trackId={track.id}
            allTrackIds={allTrackIds}
            onDragTrackChange={onDragTrackChange}
          />
        ))}

        {/* Transition zones between adjacent clips */}
        {onSetTransition && sortedClips.map((clip, i) => {
          if (i === 0) return null;
          const prev = sortedClips[i - 1];
          const prevEnd = prev.startMs + prev.durationMs;

          // Active transition: show gradient indicator
          if (clip.transition) {
            const overlapStart = clip.startMs;
            const overlapEnd = Math.min(prevEnd, clip.startMs + clip.transition.durationMs);
            const left = msToPx(overlapStart);
            const width = msToPx(overlapEnd - overlapStart);
            if (width < 4) return null;

            const prevDesc = clipKindRegistry.get(prev.clipKind);
            const clipDesc = clipKindRegistry.get(clip.clipKind);
            const colorA = prevDesc?.clipColor ?? theme.clipVideo;
            const colorB = clipDesc?.clipColor ?? theme.clipVideo;

            return (
              <TransitionIndicator
                key={`tr-${clip.id}`}
                left={left}
                width={width}
                colorA={colorA}
                colorB={colorB}
                transType={clip.transition.type}
                onRemove={() => onSetTransition(clip.id, undefined)}
              />
            );
          }

          // Adjacent clips (gap <= 50ms): show add button
          const gap = clip.startMs - prevEnd;
          if (gap > 50 || gap < -50) return null;

          const junctionX = msToPx(prevEnd);
          return (
            <TransitionAddButton
              key={`tz-${clip.id}`}
              left={junctionX}
              onClick={() => onSetTransition(clip.id, { type: "fade", durationMs: 500 })}
            />
          );
        })}
      </div>
    </div>
  );
}

function TransitionAddButton({ left, onClick }: { left: number; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  const size = 18;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      style={{
        position: "absolute",
        left: `${left - size / 2}px`,
        top: "50%",
        transform: "translateY(-50%)",
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "50%",
        background: hovered ? "#D33682" : theme.bgHover,
        border: hovered ? "1.5px solid #D33682" : `1.5px dashed ${theme.textMuted}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        zIndex: 8,
        transition: "all 0.15s",
        boxShadow: hovered ? "0 2px 8px rgba(211,54,130,0.3)" : "none",
        fontSize: "12px",
        fontWeight: "bold",
        color: hovered ? "white" : theme.textMuted,
        lineHeight: 1,
      }}
    >
      +
    </div>
  );
}

const TRANSITION_LABELS: Record<string, string> = {
  fade: "FADE",
  "fade-black": "F.BLK",
  "fade-white": "F.WHT",
  "slide-left": "SL ←",
  "slide-right": "SL →",
  "slide-up": "SL ↑",
  "slide-down": "SL ↓",
};

function TransitionIndicator({
  left,
  width,
  colorA,
  colorB,
  transType,
  onRemove,
}: {
  left: number;
  width: number;
  colorA: string;
  colorB: string;
  transType: string;
  onRemove: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={(e) => { e.stopPropagation(); onRemove(); }}
      style={{
        position: "absolute",
        left: `${left}px`,
        top: "2px",
        bottom: "2px",
        width: `${width}px`,
        background: `linear-gradient(90deg, ${colorA}, #D33682, ${colorB})`,
        opacity: hovered ? 0.95 : 0.75,
        borderRadius: "3px",
        zIndex: 6,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "opacity 0.15s",
      }}
      title="Click to remove transition"
    >
      <span
        style={{
          fontSize: "8px",
          fontWeight: 700,
          color: "white",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          textShadow: "0 1px 3px rgba(0,0,0,0.3)",
          userSelect: "none",
          pointerEvents: "none",
        }}
      >
        {width > 30 ? (TRANSITION_LABELS[transType] ?? transType.toUpperCase()) : ""}
      </span>
    </div>
  );
}
