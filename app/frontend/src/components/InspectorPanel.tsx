import { useState, useEffect } from "react";
import type { Project, Clip, Asset } from "@video/shared";
import { theme, inputStyle, sectionHeadingStyle } from "../theme";
import { clipKindRegistry } from "../lib/clip-kind-registry";
import { inspectorEditorRegistry } from "../lib/inspector-editor-registry";

type Props = {
  project: Project;
  selectedClipId: string | null;
  onUpdateClip?: (clipId: string, updates: Partial<Clip>) => void;
  onMoveClip?: (clipId: string, newStartMs: number) => void;
};

function findClipAndAsset(
  project: Project,
  clipId: string,
): { clip: Clip; asset: Asset | undefined } | null {
  for (const track of project.sequence.tracks) {
    const clip = track.clips.find((c: Clip) => c.id === clipId);
    if (clip) {
      const asset = project.assets.find((a: Asset) => a.id === clip.assetId);
      return { clip, asset };
    }
  }
  return null;
}

export function InspectorPanel({ project, selectedClipId, onUpdateClip, onMoveClip }: Props) {
  if (!selectedClipId) {
    return (
      <div style={{ color: theme.textMuted, fontSize: "12px", padding: "8px" }}>
        Select a clip to view details
      </div>
    );
  }

  const result = findClipAndAsset(project, selectedClipId);
  if (!result) {
    return (
      <div style={{ color: theme.textMuted, fontSize: "12px", padding: "8px" }}>
        Clip not found
      </div>
    );
  }

  const { clip, asset } = result;
  const descriptor = clipKindRegistry.get(clip.clipKind);
  const hasAsset = descriptor?.hasAsset ?? true;
  const fileName = asset?.originalPath.split("/").pop() ?? "\u2014";

  const editorCtx = {
    clip,
    asset,
    clipKind: clip.clipKind,
    onUpdate: (updates: Partial<Clip>) => onUpdateClip?.(clip.id, updates),
  };
  const editors = inspectorEditorRegistry.getEditorsFor(editorCtx);

  return (
    <div style={{ padding: "8px", fontSize: "12px", color: theme.text }}>
      <h3 style={sectionHeadingStyle}>Inspector</h3>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          {hasAsset && <Row label="File" value={fileName} />}
          <Row label="Type" value={!hasAsset ? "text" : (asset?.kind ?? "\u2014")} />
          {asset?.width && asset?.height && (
            <Row label="Size" value={`${asset.width}x${asset.height}`} />
          )}
          {asset?.codec && <Row label="Codec" value={asset.codec} />}
        </tbody>
      </table>

      {onMoveClip && (
        <StartEndEditor clip={clip} onMoveClip={(newStartMs) => onMoveClip(clip.id, newStartMs)} />
      )}

      {onUpdateClip && editors.map((editor) => (
        <editor.Component key={editor.id} {...editorCtx} />
      ))}
    </div>
  );
}

function msToSec(ms: number): string {
  return (ms / 1000).toFixed(1);
}

function secToMs(sec: string): number {
  return Math.round(parseFloat(sec) * 1000);
}

function StartEndEditor({
  clip,
  onMoveClip,
}: {
  clip: Clip;
  onMoveClip: (newStartMs: number) => void;
}) {
  const [val, setVal] = useState(msToSec(clip.startMs));

  useEffect(() => {
    setVal(msToSec(clip.startMs));
  }, [clip.startMs]);

  const handleCommit = () => {
    const newMs = secToMs(val);
    if (isNaN(newMs) || newMs < 0) {
      setVal(msToSec(clip.startMs));
      return;
    }
    onMoveClip(newMs);
  };

  return (
    <div style={{ marginTop: "8px" }}>
      <label style={{ color: theme.text, display: "block", marginBottom: "4px" }}>
        Position
      </label>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px" }}>
        <div>
          <label style={{ color: theme.textMuted, fontSize: "11px" }}>Start (s)</label>
          <input
            type="number"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onBlur={handleCommit}
            onKeyDown={(e) => { if (e.key === "Enter") handleCommit(); }}
            min={0}
            step={0.1}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={{ color: theme.textMuted, fontSize: "11px" }}>End (s)</label>
          <input
            type="number"
            value={msToSec(clip.startMs + clip.durationMs)}
            disabled
            style={{ ...inputStyle, color: theme.textMuted, cursor: "default" }}
          />
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <tr>
      <td style={{ padding: "2px 4px 2px 0", color: theme.text, whiteSpace: "nowrap" }}>
        {label}
      </td>
      <td style={{ padding: "2px 0", wordBreak: "break-all" }}>{value}</td>
    </tr>
  );
}
