import type { VideoFilter, BuiltinVideoFilterType } from "@video/shared";
import { theme, buttonStyle, inputStyle } from "../../theme";
import type { InspectorEditorContext } from "../../lib/inspector-editor-registry";

type FilterDef = {
  type: BuiltinVideoFilterType;
  label: string;
  previewSupported: boolean;
};

const AVAILABLE_FILTERS: FilterDef[] = [
  { type: "blur", label: "Blur", previewSupported: true },
  { type: "sharpen", label: "Sharpen", previewSupported: false },
  { type: "vignette", label: "Vignette", previewSupported: false },
  { type: "grain", label: "Grain", previewSupported: false },
  { type: "sepia", label: "Sepia", previewSupported: true },
  { type: "grayscale", label: "Grayscale", previewSupported: true },
];

const sliderTrackStyle: React.CSSProperties = {
  width: "100%",
  cursor: "pointer",
  accentColor: theme.primary,
};

export function VideoFilterEditor({ clip, onUpdate }: InspectorEditorContext) {
  const filters = clip.videoFilters ?? [];

  const getFilter = (type: string): VideoFilter | undefined =>
    filters.find((f) => f.type === type);

  const toggleFilter = (type: string) => {
    const existing = getFilter(type);
    if (existing) {
      // Remove filter
      const updated = filters.filter((f) => f.type !== type);
      onUpdate({ videoFilters: updated.length > 0 ? updated : undefined });
    } else {
      // Add filter with default strength
      onUpdate({ videoFilters: [...filters, { type, strength: 0.5 }] });
    }
  };

  const updateStrength = (type: string, strength: number) => {
    const updated = filters.map((f) =>
      f.type === type ? { ...f, strength } : f,
    );
    onUpdate({ videoFilters: updated });
  };

  const hasActiveFilters = filters.length > 0;

  return (
    <div style={{ marginTop: "8px" }}>
      {AVAILABLE_FILTERS.map((def) => {
        const active = getFilter(def.type);
        return (
          <div key={def.type} style={{ marginBottom: "6px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
              <input
                type="checkbox"
                checked={!!active}
                onChange={() => toggleFilter(def.type)}
                style={{ accentColor: theme.primary }}
              />
              <label style={{ color: theme.text, fontSize: "12px", flex: 1 }}>
                {def.label}
                {!def.previewSupported && active && (
                  <span style={{ color: theme.textMuted, fontSize: "10px", marginLeft: "4px" }}>
                    (export only)
                  </span>
                )}
              </label>
              {active && (
                <span style={{ color: theme.textMuted, fontSize: "11px", minWidth: "32px", textAlign: "right" }}>
                  {Math.round(active.strength * 100)}%
                </span>
              )}
            </div>
            {active && (
              <div style={{ display: "flex", gap: "4px", alignItems: "center", paddingLeft: "22px" }}>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={active.strength}
                  onChange={(e) => updateStrength(def.type, Number(e.target.value))}
                  style={sliderTrackStyle}
                />
                <input
                  type="number"
                  min={0}
                  max={1}
                  step={0.01}
                  value={active.strength}
                  onChange={(e) => updateStrength(def.type, Math.max(0, Math.min(1, Number(e.target.value))))}
                  style={{ ...inputStyle, width: "52px", flex: "none" }}
                />
              </div>
            )}
          </div>
        );
      })}
      {hasActiveFilters && (
        <button
          onClick={() => onUpdate({ videoFilters: undefined })}
          style={{ ...buttonStyle.secondary, ...buttonStyle.small, marginTop: "4px", color: theme.textMuted }}
        >
          Reset All Filters
        </button>
      )}
    </div>
  );
}
