import { useState, useEffect } from "react";
import { theme, inputStyle } from "../../theme";
import type { InspectorEditorContext } from "../../lib/inspector-editor-registry";

const TRANSITION_TYPES = [
  { value: "", label: "None" },
  { value: "fade", label: "Fade" },
  { value: "fade-black", label: "Fade (Black)" },
  { value: "fade-white", label: "Fade (White)" },
  { value: "slide-left", label: "Slide Left" },
  { value: "slide-right", label: "Slide Right" },
  { value: "slide-up", label: "Slide Up" },
  { value: "slide-down", label: "Slide Down" },
];

export function TransitionEditor({ clip, onSetTransition }: InspectorEditorContext) {
  const currentType = clip.transition?.type ?? "";
  const [durationMs, setDurationMs] = useState(clip.transition?.durationMs ?? 500);

  useEffect(() => {
    if (clip.transition) {
      setDurationMs(clip.transition.durationMs);
    }
  }, [clip.transition?.durationMs]);

  const handleTypeChange = (type: string) => {
    if (!type) {
      onSetTransition?.(undefined);
    } else if (!clip.transition) {
      onSetTransition?.({ type, durationMs });
    }
  };

  const handleDurationChange = (newDurationMs: number) => {
    setDurationMs(newDurationMs);
    if (clip.transition) {
      onSetTransition?.({ type: clip.transition.type, durationMs: newDurationMs });
    }
  };

  if (!onSetTransition) return null;

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
