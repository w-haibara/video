import type { Track, Asset, Clip } from "@video/shared";
import { TimelineClip } from "./TimelineClip";
import { theme } from "../theme";

type Props = {
  track: Track;
  assets: Asset[];
  msToPx: (ms: number) => number;
  pxToMs: (px: number) => number;
  totalWidth: number;
  maxDurationMs: number;
  selectedClipId: string | null;
  onSelectClip: (clipId: string) => void;
  onMoveClip: (clipId: string, newStartMs: number) => void;
  onTrimClip: (clipId: string, side: "left" | "right", deltaMs: number) => void;
  onContextMenu?: (clipId: string, position: { x: number; y: number }) => void;
};

const TRACK_LABEL: Record<string, string> = {
  video: "V",
  audio: "A",
  title: "T",
};

export function TimelineTrack({
  track,
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
}: Props) {
  const assetMap = new Map(assets.map((a) => [a.id, a]));

  return (
    <div style={{ display: "flex", height: "40px" }}>
      <div
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
        {TRACK_LABEL[track.kind] ?? track.kind[0].toUpperCase()}
      </div>
      <div
        style={{
          position: "relative",
          flex: 1,
          minWidth: `${totalWidth}px`,
          background: theme.timelineTrackBg,
          borderBottom: `1px solid ${theme.borderLight}`,
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
          />
        ))}
      </div>
    </div>
  );
}
