import type { Project, Clip, Asset } from "@video/shared";

type Props = {
  project: Project;
  selectedClipId: string | null;
};

function findClipAndAsset(
  project: Project,
  clipId: string,
): { clip: Clip; asset: Asset | undefined } | null {
  for (const track of project.sequence.tracks) {
    const clip = track.clips.find((c) => c.id === clipId);
    if (clip) {
      const asset = project.assets.find((a) => a.id === clip.assetId);
      return { clip, asset };
    }
  }
  return null;
}

function formatMs(ms: number): string {
  const totalSec = (ms / 1000).toFixed(1);
  return `${totalSec}s`;
}

export function InspectorPanel({ project, selectedClipId }: Props) {
  if (!selectedClipId) {
    return (
      <div style={{ color: "#666", fontSize: "12px", padding: "8px" }}>
        Select a clip to view details
      </div>
    );
  }

  const result = findClipAndAsset(project, selectedClipId);
  if (!result) {
    return (
      <div style={{ color: "#666", fontSize: "12px", padding: "8px" }}>
        Clip not found
      </div>
    );
  }

  const { clip, asset } = result;
  const fileName = asset?.originalPath.split("/").pop() ?? "—";

  return (
    <div style={{ padding: "8px", fontSize: "12px", color: "#ccc" }}>
      <h4 style={{ margin: "0 0 8px", color: "#fff" }}>Inspector</h4>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          <Row label="File" value={fileName} />
          <Row label="Type" value={asset?.kind ?? "—"} />
          <Row label="Start" value={formatMs(clip.startMs)} />
          <Row label="Duration" value={formatMs(clip.durationMs)} />
          <Row label="In" value={formatMs(clip.inMs)} />
          <Row label="Out" value={formatMs(clip.outMs)} />
          {asset?.width && asset?.height && (
            <Row label="Size" value={`${asset.width}x${asset.height}`} />
          )}
          {asset?.codec && <Row label="Codec" value={asset.codec} />}
        </tbody>
      </table>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <tr>
      <td style={{ padding: "2px 4px 2px 0", color: "#888", whiteSpace: "nowrap" }}>
        {label}
      </td>
      <td style={{ padding: "2px 0", wordBreak: "break-all" }}>{value}</td>
    </tr>
  );
}
