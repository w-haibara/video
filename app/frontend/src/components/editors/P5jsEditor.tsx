import { theme } from "../../theme";
import type { InspectorEditorContext } from "../../lib/inspector-editor-registry";

export function P5jsEditor({ asset }: InspectorEditorContext) {
  if (!asset) return null;

  return (
    <div style={{ marginTop: "8px" }}>
      <label style={{ color: theme.textMuted, display: "block", marginBottom: "4px" }}>
        p5.js Sketch
      </label>
      <div style={{
        fontFamily: "monospace",
        fontSize: "11px",
        color: theme.text,
        backgroundColor: theme.bgPanel,
        border: `1px solid ${theme.border}`,
        borderRadius: "4px",
        padding: "8px",
        maxHeight: "200px",
        overflow: "auto",
        whiteSpace: "pre-wrap",
        wordBreak: "break-all",
      }}>
        {asset.originalPath}
      </div>
    </div>
  );
}
