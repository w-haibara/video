import type { ClipColorCorrection } from "@video/shared";
import { theme, buttonStyle, inputStyle } from "../../theme";
import type { InspectorEditorContext } from "../../lib/inspector-editor-registry";

const sliderTrackStyle: React.CSSProperties = {
  width: "100%",
  cursor: "pointer",
  accentColor: theme.primary,
};

type SliderDef = {
  key: keyof ClipColorCorrection;
  label: string;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
};

const SLIDERS: SliderDef[] = [
  { key: "brightness", label: "Brightness", min: -1, max: 1, step: 0.01, format: (v) => `${Math.round(v * 100)}%` },
  { key: "contrast", label: "Contrast", min: -1, max: 1, step: 0.01, format: (v) => `${Math.round(v * 100)}%` },
  { key: "saturation", label: "Saturation", min: -1, max: 1, step: 0.01, format: (v) => `${Math.round(v * 100)}%` },
  { key: "hue", label: "Hue", min: -180, max: 180, step: 1, format: (v) => `${Math.round(v)}deg` },
  { key: "temperature", label: "Temperature", min: -1, max: 1, step: 0.01, format: (v) => `${Math.round(v * 100)}%` },
];

function isDefaultCC(cc: ClipColorCorrection | undefined): boolean {
  if (!cc) return true;
  return (
    (cc.brightness ?? 0) === 0 &&
    (cc.contrast ?? 0) === 0 &&
    (cc.saturation ?? 0) === 0 &&
    (cc.hue ?? 0) === 0 &&
    (cc.temperature ?? 0) === 0
  );
}

export function ColorCorrectionEditor({ clip, onUpdate }: InspectorEditorContext) {
  const cc = clip.colorCorrection ?? {};

  const updateCC = (field: Partial<ClipColorCorrection>) => {
    onUpdate({ colorCorrection: { ...cc, ...field } });
  };

  return (
    <div style={{ marginTop: "8px" }}>
      {SLIDERS.map((slider) => {
        const value = cc[slider.key] ?? 0;
        return (
          <div key={slider.key} style={{ marginBottom: "6px" }}>
            <label style={{ color: theme.textMuted, display: "block", marginBottom: "2px", fontSize: "12px" }}>
              {slider.label} ({slider.format(value)})
            </label>
            <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
              <input
                type="range"
                min={slider.min}
                max={slider.max}
                step={slider.step}
                value={value}
                onChange={(e) => updateCC({ [slider.key]: Number(e.target.value) })}
                style={sliderTrackStyle}
              />
              <input
                type="number"
                min={slider.min}
                max={slider.max}
                step={slider.step}
                value={value}
                onChange={(e) => updateCC({ [slider.key]: Number(e.target.value) })}
                style={{ ...inputStyle, width: "60px", flex: "none" }}
              />
            </div>
          </div>
        );
      })}
      {!isDefaultCC(cc) && (
        <button
          onClick={() => onUpdate({ colorCorrection: undefined })}
          style={{ ...buttonStyle.secondary, ...buttonStyle.small, marginTop: "4px", color: theme.textMuted }}
        >
          Reset Color Correction
        </button>
      )}
    </div>
  );
}
