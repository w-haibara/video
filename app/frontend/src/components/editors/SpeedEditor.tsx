import { useState } from "react";
import { theme } from "../../theme";
import type { InspectorEditorContext } from "../../lib/inspector-editor-registry";
import { MIN_SPEED, MAX_SPEED } from "../../lib/sequence-ops";

const SPEED_PRESETS = [0.25, 0.5, 1, 1.5, 2, 4];

export function SpeedEditor({ clip, onUpdate }: InspectorEditorContext) {
  const currentSpeed = clip.speed ?? 1;
  const [customInput, setCustomInput] = useState("");
  const [showCustom, setShowCustom] = useState(false);

  const handleSpeedChange = (speed: number) => {
    const clamped = Math.max(MIN_SPEED, Math.min(MAX_SPEED, speed));

    // Compute new duration based on original source duration.
    // sourceDurationMs = durationMs * currentSpeed (undo current speed to get base)
    const sourceDurationMs = clip.durationMs * currentSpeed;
    const newDurationMs = Math.max(100, Math.round(sourceDurationMs / clamped));

    onUpdate({
      speed: clamped,
      durationMs: newDurationMs,
      outMs: clip.inMs + newDurationMs,
    });
    setShowCustom(false);
  };

  // Calculate resulting duration for display
  const sourceDurationMs = clip.durationMs * currentSpeed;
  const resultingDurationSec = (sourceDurationMs / currentSpeed) / 1000;

  return (
    <div style={{ marginTop: "8px" }}>
      <label style={{ color: theme.textMuted, display: "block", marginBottom: "4px" }}>
        Speed: {currentSpeed}x
      </label>
      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginBottom: "6px" }}>
        {SPEED_PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => handleSpeedChange(preset)}
            style={{
              padding: "2px 8px",
              fontSize: "12px",
              background: currentSpeed === preset ? theme.accent : theme.surfaceAlt,
              color: currentSpeed === preset ? theme.white : theme.text,
              border: "none",
              borderRadius: "3px",
              cursor: "pointer",
            }}
          >
            {preset}x
          </button>
        ))}
        <button
          type="button"
          onClick={() => setShowCustom(!showCustom)}
          style={{
            padding: "2px 8px",
            fontSize: "12px",
            background: showCustom ? theme.accent : theme.surfaceAlt,
            color: showCustom ? theme.white : theme.text,
            border: "none",
            borderRadius: "3px",
            cursor: "pointer",
          }}
        >
          Custom
        </button>
      </div>
      {showCustom && (
        <div style={{ display: "flex", gap: "4px", alignItems: "center", marginBottom: "6px" }}>
          <input
            type="number"
            min={MIN_SPEED}
            max={MAX_SPEED}
            step={0.05}
            value={customInput || currentSpeed}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const val = parseFloat(customInput);
                if (!Number.isNaN(val)) handleSpeedChange(val);
              }
            }}
            onBlur={() => {
              const val = parseFloat(customInput);
              if (!Number.isNaN(val)) handleSpeedChange(val);
            }}
            style={{
              width: "60px",
              padding: "2px 4px",
              fontSize: "12px",
              background: theme.surface,
              color: theme.text,
              border: `1px solid ${theme.border}`,
              borderRadius: "3px",
            }}
          />
          <span style={{ color: theme.textMuted, fontSize: "12px" }}>x</span>
        </div>
      )}
      <div style={{ color: theme.textMuted, fontSize: "11px" }}>
        Duration: {resultingDurationSec.toFixed(2)}s
      </div>
    </div>
  );
}
