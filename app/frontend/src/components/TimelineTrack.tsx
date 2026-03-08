import type { Track, Asset } from "@video/shared";
import { TimelineClip } from "./TimelineClip";

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
          background: "#252525",
          borderRight: "1px solid #444",
          color: "#aaa",
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
          background: "#2a2a2a",
          borderBottom: "1px solid #333",
        }}
      >
        {track.clips.map((clip) => (
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
