import { theme, inputStyle } from "../../theme";
import type { InspectorEditorContext } from "../../lib/inspector-editor-registry";
import { transitionPreviewRegistry } from "../../lib/transition-preview-registry";

const TRANSITION_TYPES = [
  { value: "", label: "None" },
  ...transitionPreviewRegistry.all().map((h) => ({ value: h.type, label: h.label })),
];

export function TransitionEditor({ clip, onSetTransition }: InspectorEditorContext) {
  const currentType = clip.transition?.type ?? "";
  const durationMs = clip.transition?.durationMs ?? 500;

  if (!onSetTransition) return null;

  const handleTypeChange = (type: string) => {
    if (!type) {
      onSetTransition(undefined);
    } else {
      onSetTransition({ type, durationMs });
    }
  };

  const handleDurationChange = (newDurationMs: number) => {
    if (clip.transition) {
      onSetTransition({ type: clip.transition.type, durationMs: newDurationMs });
    }
  };

  return (
    <div style={{ marginTop: "8px" }}>
      <label style={{ color: theme.textMuted, display: "block", marginBottom: "4px" }}>
        Transition In
      </label>
      <select
        value={currentType}
        onChange={(e) => handleTypeChange(e.target.value)}
        style={inputStyle}
      >
        {TRANSITION_TYPES.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>
      {currentType && (
        <div style={{ marginTop: "4px" }}>
          <label style={{ color: theme.textMuted, fontSize: "11px" }}>
            Duration: {durationMs}ms
          </label>
          <input
            type="range"
            min={100}
            max={2000}
            step={100}
            value={durationMs}
            onChange={(e) => handleDurationChange(Number(e.target.value))}
            style={{ width: "100%", accentColor: theme.accent }}
          />
        </div>
      )}
    </div>
  );
}
