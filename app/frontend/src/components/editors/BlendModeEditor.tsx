import { theme, inputStyle } from "../../theme";
import type { InspectorEditorContext } from "../../lib/inspector-editor-registry";
import { compositeStrategyRegistry } from "../../lib/composite-strategy-registry";

export function BlendModeEditor({ clip, onUpdate }: InspectorEditorContext) {
  const strategies = compositeStrategyRegistry.all();
  const current = clip.blendMode ?? "cover";

  return (
    <div style={{ marginTop: "8px" }}>
      <label style={{ color: theme.textMuted, display: "block", marginBottom: "4px" }}>
        Blend Mode
      </label>
      <select
        value={current}
        onChange={(e) => onUpdate({ blendMode: e.target.value })}
        style={inputStyle}
      >
        {strategies.map((s) => (
          <option key={s.id} value={s.id}>
            {s.label}
          </option>
        ))}
      </select>
    </div>
  );
}
