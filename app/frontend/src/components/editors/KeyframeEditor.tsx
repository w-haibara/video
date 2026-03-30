import { useState } from "react";
import type { EasingType, Keyframe, KeyframeTrack } from "@video/shared";
import { theme, buttonStyle, inputStyle } from "../../theme";
import type { InspectorEditorContext } from "../../lib/inspector-editor-registry";

/** Animatable properties with display labels and default values. */
const ANIMATABLE_PROPERTIES: { property: string; label: string; defaultValue: number; step: number }[] = [
  { property: "transform.x", label: "Position X", defaultValue: 0, step: 1 },
  { property: "transform.y", label: "Position Y", defaultValue: 0, step: 1 },
  { property: "transform.scale", label: "Scale", defaultValue: 1, step: 0.1 },
  { property: "transform.rotation", label: "Rotation", defaultValue: 0, step: 1 },
  { property: "opacity", label: "Opacity", defaultValue: 1, step: 0.1 },
  { property: "volume", label: "Volume", defaultValue: 1, step: 0.1 },
];

const EASING_OPTIONS: { value: EasingType; label: string }[] = [
  { value: "linear", label: "Linear" },
  { value: "ease-in", label: "Ease In" },
  { value: "ease-out", label: "Ease Out" },
  { value: "ease-in-out", label: "Ease In-Out" },
];

function getTrack(tracks: KeyframeTrack[] | undefined, property: string): KeyframeTrack | undefined {
  return tracks?.find((t) => t.property === property);
}

function getCurrentValue(clip: InspectorEditorContext["clip"], property: string): number {
  switch (property) {
    case "transform.x": return clip.transform?.x ?? 0;
    case "transform.y": return clip.transform?.y ?? 0;
    case "transform.scale": return clip.transform?.scale ?? 1;
    case "transform.rotation": return clip.transform?.rotation ?? 0;
    case "opacity": return 1; // opacity not yet a direct clip field, default 1
    case "volume": return clip.volume ?? 1;
    default: return 0;
  }
}

export function KeyframeEditor({ clip, onUpdate }: InspectorEditorContext) {
  const [expandedProp, setExpandedProp] = useState<string | null>(null);
  const [addTimeMs, setAddTimeMs] = useState(0);
  const [addValue, setAddValue] = useState(0);

  const handleAddKeyframe = (property: string, defaultValue: number) => {
    const kf: Keyframe = { timeMs: addTimeMs, value: addValue, easing: "linear" };
    const existing = clip.keyframeTracks ?? [];
    const trackIdx = existing.findIndex((t) => t.property === property);
    let newTracks: KeyframeTrack[];
    if (trackIdx >= 0) {
      const kfTrack = existing[trackIdx];
      const kfs = kfTrack.keyframes.filter((k) => k.timeMs !== kf.timeMs);
      kfs.push(kf);
      kfs.sort((a, b) => a.timeMs - b.timeMs);
      newTracks = [...existing];
      newTracks[trackIdx] = { ...kfTrack, keyframes: kfs };
    } else {
      newTracks = [...existing, { property, keyframes: [kf] }];
    }
    onUpdate({ keyframeTracks: newTracks });
  };

  const handleRemoveKeyframe = (property: string, timeMs: number) => {
    const existing = clip.keyframeTracks;
    if (!existing) return;
    const trackIdx = existing.findIndex((t) => t.property === property);
    if (trackIdx < 0) return;
    const kfTrack = existing[trackIdx];
    const kfs = kfTrack.keyframes.filter((k) => k.timeMs !== timeMs);
    if (kfs.length === 0) {
      const newTracks = existing.filter((_, i) => i !== trackIdx);
      onUpdate({ keyframeTracks: newTracks.length > 0 ? newTracks : undefined });
    } else {
      const newTracks = [...existing];
      newTracks[trackIdx] = { ...kfTrack, keyframes: kfs };
      onUpdate({ keyframeTracks: newTracks });
    }
  };

  const handleUpdateKeyframeValue = (property: string, timeMs: number, value: number) => {
    const existing = clip.keyframeTracks;
    if (!existing) return;
    const trackIdx = existing.findIndex((t) => t.property === property);
    if (trackIdx < 0) return;
    const kfTrack = existing[trackIdx];
    const kfs = kfTrack.keyframes.map((k) =>
      k.timeMs === timeMs ? { ...k, value } : k,
    );
    const newTracks = [...existing];
    newTracks[trackIdx] = { ...kfTrack, keyframes: kfs };
    onUpdate({ keyframeTracks: newTracks });
  };

  const handleUpdateKeyframeEasing = (property: string, timeMs: number, easing: EasingType) => {
    const existing = clip.keyframeTracks;
    if (!existing) return;
    const trackIdx = existing.findIndex((t) => t.property === property);
    if (trackIdx < 0) return;
    const kfTrack = existing[trackIdx];
    const kfs = kfTrack.keyframes.map((k) =>
      k.timeMs === timeMs ? { ...k, easing } : k,
    );
    const newTracks = [...existing];
    newTracks[trackIdx] = { ...kfTrack, keyframes: kfs };
    onUpdate({ keyframeTracks: newTracks });
  };

  const totalKeyframes = (clip.keyframeTracks ?? []).reduce(
    (sum, t) => sum + t.keyframes.length,
    0,
  );

  return (
    <div style={{ marginTop: "8px" }} data-testid="keyframe-editor">
      <label style={{ color: theme.text, display: "block", marginBottom: "4px", fontWeight: 600 }}>
        Keyframes
      </label>

      {totalKeyframes === 0 && (
        <div style={{ color: theme.textMuted, fontSize: "11px", marginBottom: "8px" }}>
          No keyframes. Click the diamond icon to add keyframes for animatable properties.
        </div>
      )}

      {ANIMATABLE_PROPERTIES.map(({ property, label, defaultValue, step }) => {
        const track = getTrack(clip.keyframeTracks, property);
        const hasKfs = track && track.keyframes.length > 0;
        const isExpanded = expandedProp === property;
        const currentVal = getCurrentValue(clip, property);

        return (
          <div
            key={property}
            style={{
              marginBottom: "4px",
              border: `1px solid ${theme.borderLight}`,
              borderRadius: "3px",
              padding: "4px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: "pointer",
              }}
              onClick={() => setExpandedProp(isExpanded ? null : property)}
            >
              <span style={{ fontSize: "11px", color: theme.text }}>
                {label}
                <span style={{ color: theme.textMuted, marginLeft: "4px" }}>
                  ({hasKfs ? `${track.keyframes.length} kf` : currentVal.toFixed(step < 1 ? 1 : 0)})
                </span>
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setAddTimeMs(0);
                  setAddValue(currentVal);
                  handleAddKeyframe(property, defaultValue);
                }}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "14px",
                  color: hasKfs ? theme.accent : theme.textMuted,
                  padding: "0 4px",
                  lineHeight: 1,
                }}
                title={`Add keyframe for ${label}`}
                data-testid={`add-keyframe-${property}`}
              >
                ◇
              </button>
            </div>

            {isExpanded && hasKfs && (
              <div style={{ marginTop: "4px" }}>
                {track.keyframes.map((kf) => (
                  <div
                    key={kf.timeMs}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "60px 1fr 90px 24px",
                      gap: "2px",
                      alignItems: "center",
                      marginBottom: "2px",
                    }}
                  >
                    <div style={{ fontSize: "10px", color: theme.textMuted }}>
                      {(kf.timeMs / 1000).toFixed(1)}s
                    </div>
                    <input
                      type="number"
                      value={kf.value}
                      onChange={(e) => handleUpdateKeyframeValue(property, kf.timeMs, Number(e.target.value))}
                      step={step}
                      style={{ ...inputStyle, fontSize: "11px", padding: "2px 4px" }}
                      data-testid={`kf-value-${property}-${kf.timeMs}`}
                    />
                    <select
                      value={kf.easing ?? "linear"}
                      onChange={(e) => handleUpdateKeyframeEasing(property, kf.timeMs, e.target.value as EasingType)}
                      style={{ ...inputStyle, fontSize: "10px", padding: "2px" }}
                      data-testid={`kf-easing-${property}-${kf.timeMs}`}
                    >
                      {EASING_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleRemoveKeyframe(property, kf.timeMs)}
                      style={{
                        ...buttonStyle.secondary,
                        ...buttonStyle.small,
                        padding: "0 4px",
                        fontSize: "11px",
                        color: theme.error,
                        lineHeight: 1,
                      }}
                      title="Remove keyframe"
                      data-testid={`remove-kf-${property}-${kf.timeMs}`}
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>
            )}

            {isExpanded && (
              <div style={{ marginTop: "4px", display: "flex", gap: "4px", alignItems: "center" }}>
                <input
                  type="number"
                  value={addTimeMs}
                  onChange={(e) => setAddTimeMs(Math.max(0, Number(e.target.value)))}
                  min={0}
                  max={clip.durationMs}
                  step={100}
                  placeholder="Time (ms)"
                  style={{ ...inputStyle, width: "70px", fontSize: "11px", padding: "2px 4px" }}
                  data-testid={`add-time-${property}`}
                />
                <input
                  type="number"
                  value={addValue}
                  onChange={(e) => setAddValue(Number(e.target.value))}
                  step={step}
                  placeholder="Value"
                  style={{ ...inputStyle, width: "60px", fontSize: "11px", padding: "2px 4px" }}
                  data-testid={`add-value-${property}`}
                />
                <button
                  onClick={() => handleAddKeyframe(property, defaultValue)}
                  style={{
                    ...buttonStyle.primary,
                    ...buttonStyle.small,
                    padding: "2px 8px",
                    fontSize: "11px",
                  }}
                  data-testid={`add-kf-btn-${property}`}
                >
                  + Add
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
