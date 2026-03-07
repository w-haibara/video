import type { Project, Clip, Asset, ClipText } from "@video/shared";

type Props = {
  project: Project;
  selectedClipId: string | null;
  onUpdateClip?: (clipId: string, updates: Partial<Clip>) => void;
};

function findClipAndAsset(
  project: Project,
  clipId: string,
): { clip: Clip; asset: Asset | undefined; trackKind: string } | null {
  for (const track of project.sequence.tracks) {
    const clip = track.clips.find((c) => c.id === clipId);
    if (clip) {
      const asset = project.assets.find((a) => a.id === clip.assetId);
      return { clip, asset, trackKind: track.kind };
    }
  }
  return null;
}

function formatMs(ms: number): string {
  const totalSec = (ms / 1000).toFixed(1);
  return `${totalSec}s`;
}

export function InspectorPanel({ project, selectedClipId, onUpdateClip }: Props) {
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

  const { clip, asset, trackKind } = result;
  const isTextClip = trackKind === "title";
  const fileName = asset?.originalPath.split("/").pop() ?? "—";

  return (
    <div style={{ padding: "8px", fontSize: "12px", color: "#ccc" }}>
      <h4 style={{ margin: "0 0 8px", color: "#fff" }}>Inspector</h4>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          {!isTextClip && <Row label="File" value={fileName} />}
          <Row label="Type" value={isTextClip ? "text" : (asset?.kind ?? "—")} />
          <Row label="Start" value={formatMs(clip.startMs)} />
          <Row label="Duration" value={formatMs(clip.durationMs)} />
          {!isTextClip && <Row label="In" value={formatMs(clip.inMs)} />}
          {!isTextClip && <Row label="Out" value={formatMs(clip.outMs)} />}
          {asset?.width && asset?.height && (
            <Row label="Size" value={`${asset.width}x${asset.height}`} />
          )}
          {asset?.codec && <Row label="Codec" value={asset.codec} />}
        </tbody>
      </table>

      {isTextClip && onUpdateClip && (
        <TextEditor
          clip={clip}
          onUpdate={(updates) => onUpdateClip(clip.id, updates)}
        />
      )}

      {trackKind === "audio" && onUpdateClip && (
        <div style={{ marginTop: "8px" }}>
          <label style={{ color: "#888", display: "block", marginBottom: "4px" }}>
            Volume: {Math.round((clip.volume ?? 1) * 100)}%
          </label>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round((clip.volume ?? 1) * 100)}
            onChange={(e) =>
              onUpdateClip(clip.id, { volume: Number(e.target.value) / 100 })
            }
            style={{ width: "100%" }}
          />
        </div>
      )}
    </div>
  );
}

function TextEditor({
  clip,
  onUpdate,
}: {
  clip: Clip;
  onUpdate: (updates: Partial<Clip>) => void;
}) {
  const text = clip.text ?? { value: "" };

  const updateText = (field: Partial<ClipText>) => {
    onUpdate({ text: { ...text, ...field } });
  };

  return (
    <div style={{ marginTop: "8px" }}>
      <label style={{ color: "#888", display: "block", marginBottom: "4px" }}>
        Text
      </label>
      <textarea
        value={text.value}
        onChange={(e) => updateText({ value: e.target.value })}
        rows={2}
        style={{
          width: "100%",
          background: "#333",
          color: "#fff",
          border: "1px solid #555",
          borderRadius: "3px",
          padding: "4px",
          fontSize: "12px",
          resize: "vertical",
          boxSizing: "border-box",
        }}
      />

      <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
        <div style={{ flex: 1 }}>
          <label style={{ color: "#888", display: "block", marginBottom: "2px" }}>
            Size
          </label>
          <input
            type="number"
            value={text.fontSize ?? 48}
            onChange={(e) => updateText({ fontSize: Number(e.target.value) })}
            min={12}
            max={200}
            style={{
              width: "100%",
              background: "#333",
              color: "#fff",
              border: "1px solid #555",
              borderRadius: "3px",
              padding: "2px 4px",
              fontSize: "12px",
              boxSizing: "border-box",
            }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ color: "#888", display: "block", marginBottom: "2px" }}>
            Color
          </label>
          <input
            type="color"
            value={text.color ?? "#ffffff"}
            onChange={(e) => updateText({ color: e.target.value })}
            style={{
              width: "100%",
              height: "24px",
              border: "none",
              cursor: "pointer",
              background: "none",
            }}
          />
        </div>
      </div>

      <div style={{ marginTop: "6px" }}>
        <label style={{ color: "#888", display: "block", marginBottom: "2px" }}>
          Background
        </label>
        <input
          type="color"
          value={text.backgroundColor ?? "#000000"}
          onChange={(e) => updateText({ backgroundColor: e.target.value })}
          style={{
            width: "50%",
            height: "24px",
            border: "none",
            cursor: "pointer",
            background: "none",
          }}
        />
      </div>
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
