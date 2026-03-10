import type { ClipText } from "@video/shared";
import { theme, inputStyle } from "../../theme";
import type { InspectorEditorContext } from "../../lib/inspector-editor-registry";

export function TextEditor({ clip, onUpdate }: InspectorEditorContext) {
  const text = clip.text ?? { value: "" };

  const updateText = (field: Partial<ClipText>) => {
    onUpdate({ text: { ...text, ...field } });
  };

  return (
    <div style={{ marginTop: "8px" }}>
      <label style={{ color: theme.text, display: "block", marginBottom: "4px" }}>
        Text
      </label>
      <textarea
        value={text.value}
        onChange={(e) => updateText({ value: e.target.value })}
        rows={2}
        style={{
          width: "100%",
          background: theme.bgPanel,
          color: theme.text,
          border: `1px solid ${theme.border}`,
          borderRadius: "3px",
          padding: "4px",
          fontSize: "12px",
          resize: "vertical",
          boxSizing: "border-box",
        }}
      />

      <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
        <div style={{ flex: 1 }}>
          <label style={{ color: theme.textMuted, display: "block", marginBottom: "2px" }}>
            Size
          </label>
          <input
            type="number"
            value={text.fontSize ?? 48}
            onChange={(e) => updateText({ fontSize: Number(e.target.value) })}
            min={12}
            max={200}
            style={inputStyle}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ color: theme.textMuted, display: "block", marginBottom: "2px" }}>
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
        <label style={{ color: theme.textMuted, display: "block", marginBottom: "2px" }}>
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
