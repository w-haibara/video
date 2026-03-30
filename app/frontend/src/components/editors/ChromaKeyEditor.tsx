import type { ClipChromaKey } from "@video/shared";
import { theme, inputStyle, buttonStyle } from "../../theme";
import type { InspectorEditorContext } from "../../lib/inspector-editor-registry";

const PRESETS: { label: string; color: string }[] = [
  { label: "Green", color: "#00ff00" },
  { label: "Blue", color: "#0000ff" },
];

export function ChromaKeyEditor({ clip, onUpdate }: InspectorEditorContext) {
  const ck = clip.chromaKey;

  const updateChromaKey = (field: Partial<ClipChromaKey>) => {
    const current = ck ?? { color: "#00ff00", similarity: 0.3, blend: 0.1 };
    onUpdate({ chromaKey: { ...current, ...field } });
  };

  const enableChromaKey = () => {
    onUpdate({ chromaKey: { color: "#00ff00", similarity: 0.3, blend: 0.1 } });
  };

  const disableChromaKey = () => {
    onUpdate({ chromaKey: undefined });
  };

  if (!ck) {
    return (
      <div style={{ marginTop: "8px" }}>
        <label style={{ color: theme.text, display: "block", marginBottom: "4px" }}>
          Chroma Key
        </label>
        <button onClick={enableChromaKey} style={{ ...buttonStyle.secondary, ...buttonStyle.small }}>
          Enable Chroma Key
        </button>
      </div>
    );
  }

  return (
    <div style={{ marginTop: "8px" }}>
      <label style={{ color: theme.text, display: "block", marginBottom: "4px" }}>
        Chroma Key (active)
      </label>

      <div style={{ display: "flex", gap: "4px", marginBottom: "4px" }}>
        {PRESETS.map((p) => (
          <button
            key={p.label}
            onClick={() => updateChromaKey({ color: p.color })}
            style={{
              padding: "4px 8px",
              background: ck.color === p.color ? theme.accent : theme.bgPanel,
              color: ck.color === p.color ? "#fff" : theme.textMuted,
              border: `1px solid ${theme.border}`,
              borderRadius: "3px",
              cursor: "pointer",
              fontSize: "12px",
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div style={{ marginBottom: "4px" }}>
        <label style={{ color: theme.textMuted, fontSize: "11px" }}>Color</label>
        <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
          <input
            type="color"
            value={ck.color}
            onChange={(e) => updateChromaKey({ color: e.target.value })}
            style={{ width: "32px", height: "24px", border: "none", cursor: "pointer" }}
          />
          <input
            type="text"
            value={ck.color}
            onChange={(e) => {
              if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) {
                updateChromaKey({ color: e.target.value });
              }
            }}
            style={{ ...inputStyle, flex: 1 }}
          />
        </div>
      </div>

      <div style={{ marginBottom: "4px" }}>
        <label style={{ color: theme.textMuted, fontSize: "11px" }}>
          Similarity ({Math.round(ck.similarity * 100)}%)
        </label>
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(ck.similarity * 100)}
          onChange={(e) => updateChromaKey({ similarity: Number(e.target.value) / 100 })}
          style={{ width: "100%" }}
        />
      </div>

      <div style={{ marginBottom: "4px" }}>
        <label style={{ color: theme.textMuted, fontSize: "11px" }}>
          Blend ({Math.round(ck.blend * 100)}%)
        </label>
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(ck.blend * 100)}
          onChange={(e) => updateChromaKey({ blend: Number(e.target.value) / 100 })}
          style={{ width: "100%" }}
        />
      </div>

      <button
        onClick={disableChromaKey}
        style={{ ...buttonStyle.secondary, ...buttonStyle.small, marginTop: "4px", color: theme.textMuted }}
      >
        Remove Chroma Key
      </button>
    </div>
  );
}
