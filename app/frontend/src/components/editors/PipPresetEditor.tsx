import { theme } from "../../theme";
import type { InspectorEditorContext } from "../../lib/inspector-editor-registry";
import type { PipPreset } from "../../lib/sequence-ops";

const PRESETS: { id: PipPreset; label: string; icon: string }[] = [
  { id: "corner-tl", label: "Top-Left", icon: "TL" },
  { id: "corner-tr", label: "Top-Right", icon: "TR" },
  { id: "corner-bl", label: "Bottom-Left", icon: "BL" },
  { id: "corner-br", label: "Bottom-Right", icon: "BR" },
  { id: "side-by-side", label: "Side by Side", icon: "LR" },
  { id: "top-bottom", label: "Top / Bottom", icon: "TB" },
];

/**
 * PipPresetEditor displays a grid of PiP preset buttons.
 * Clicking a preset dispatches a "pip-preset" action that the parent
 * converts into an applyPipPreset call (since we need canvasWidth/Height).
 *
 * As a fallback, we apply the transform directly via onUpdate.
 */
export function PipPresetEditor({ clip, onUpdate }: InspectorEditorContext) {
  // We compute transforms inline since we don't have canvas dimensions in context.
  // Use standard 1920x1080 if not available; the transform is relative-ish.
  // However, since PiP presets depend on canvas size, we encode the preset logic here
  // using a reasonable default. The real applyPipPreset in sequence-ops should be used
  // when canvas dimensions are known.
  const applyPreset = (preset: PipPreset) => {
    // Default canvas size; ideally we'd get this from project settings
    const cw = 1920;
    const ch = 1080;
    const padding = 10;

    let scale: number;
    let x: number;
    let y: number;

    switch (preset) {
      case "corner-br":
        scale = 0.3;
        x = (cw * (1 - scale)) / 2 - padding;
        y = (ch * (1 - scale)) / 2 - padding;
        break;
      case "corner-bl":
        scale = 0.3;
        x = -(cw * (1 - scale)) / 2 + padding;
        y = (ch * (1 - scale)) / 2 - padding;
        break;
      case "corner-tr":
        scale = 0.3;
        x = (cw * (1 - scale)) / 2 - padding;
        y = -(ch * (1 - scale)) / 2 + padding;
        break;
      case "corner-tl":
        scale = 0.3;
        x = -(cw * (1 - scale)) / 2 + padding;
        y = -(ch * (1 - scale)) / 2 + padding;
        break;
      case "side-by-side":
        scale = 0.5;
        x = -cw / 4;
        y = 0;
        break;
      case "top-bottom":
        scale = 0.5;
        x = 0;
        y = -ch / 4;
        break;
    }

    onUpdate({
      transform: { x: Math.round(x), y: Math.round(y), scale, rotation: 0 },
    });
  };

  const btnStyle = (active: boolean): React.CSSProperties => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "6px",
    background: active ? theme.accent : theme.bgPanel,
    color: active ? "#fff" : theme.textMuted,
    border: `1px solid ${theme.border}`,
    borderRadius: "3px",
    cursor: "pointer",
    fontSize: "11px",
    fontWeight: "bold",
  });

  // Detect if current transform matches a preset (approximate)
  const t = clip.transform;
  const matchesPreset = (preset: PipPreset): boolean => {
    if (!t) return false;
    const s = t.scale ?? 1;
    if (preset.startsWith("corner-") && Math.abs(s - 0.3) > 0.01) return false;
    if ((preset === "side-by-side" || preset === "top-bottom") && Math.abs(s - 0.5) > 0.01) return false;
    return true;
  };

  return (
    <div style={{ marginTop: "8px" }}>
      <label style={{ color: theme.text, display: "block", marginBottom: "4px" }}>
        PiP Presets
      </label>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "4px" }}>
        {PRESETS.map((p) => (
          <button
            key={p.id}
            onClick={() => applyPreset(p.id)}
            style={btnStyle(matchesPreset(p.id))}
            title={p.label}
          >
            {p.icon}
          </button>
        ))}
      </div>
    </div>
  );
}
