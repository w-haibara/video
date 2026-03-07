import type { Clip, Asset } from "@video/shared";

type Props = {
  clip: Clip;
  asset: Asset | undefined;
  msToPx: (ms: number) => number;
  isSelected: boolean;
  onSelect: (clipId: string) => void;
};

export function TimelineClip({
  clip,
  asset,
  msToPx,
  isSelected,
  onSelect,
}: Props) {
  const width = msToPx(clip.durationMs);
  const left = msToPx(clip.startMs);
  const label = asset
    ? asset.originalPath.split("/").pop() ?? asset.kind
    : "clip";

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelect(clip.id);
      }}
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
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        padding: "0 4px",
      }}
    >
      <span
        style={{
          fontSize: "11px",
          color: "#fff",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          userSelect: "none",
        }}
      >
        {label}
      </span>
    </div>
  );
}
