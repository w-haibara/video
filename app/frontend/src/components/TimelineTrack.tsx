import type { Track, Asset } from "@video/shared";
import { TimelineClip } from "./TimelineClip";

type Props = {
  track: Track;
  assets: Asset[];
  msToPx: (ms: number) => number;
  totalWidth: number;
  selectedClipId: string | null;
  onSelectClip: (clipId: string) => void;
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
  totalWidth,
  selectedClipId,
  onSelectClip,
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
            isSelected={selectedClipId === clip.id}
            onSelect={onSelectClip}
          />
        ))}
      </div>
    </div>
  );
}
