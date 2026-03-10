import { theme } from "../../theme";
import type { InspectorEditorContext } from "../../lib/inspector-editor-registry";

export function AudioVolumeEditor({ clip, onUpdate }: InspectorEditorContext) {
  return (
    <div style={{ marginTop: "8px" }}>
      <label style={{ color: theme.textMuted, display: "block", marginBottom: "4px" }}>
        Volume: {Math.round((clip.volume ?? 1) * 100)}%
      </label>
      <input
        type="range"
        min={0}
        max={100}
        value={Math.round((clip.volume ?? 1) * 100)}
        onChange={(e) =>
          onUpdate({ volume: Number(e.target.value) / 100 })
        }
        style={{ width: "100%" }}
      />
    </div>
  );
}
