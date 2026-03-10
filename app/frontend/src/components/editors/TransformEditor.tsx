import type { ClipTransform, ClipCrop } from "@video/shared";
import { theme, buttonStyle, inputStyle } from "../../theme";
import type { InspectorEditorContext } from "../../lib/inspector-editor-registry";

const ROTATIONS = [0, 90, 180, 270] as const;

export function TransformEditor({ clip, asset, onUpdate }: InspectorEditorContext) {
  const transform = clip.transform ?? {};
  const crop = clip.crop;
  const currentRotation = transform.rotation ?? 0;

  const defaultW = asset?.width ?? 100;
  const defaultH = asset?.height ?? 100;

  const updateTransform = (field: Partial<ClipTransform>) => {
    onUpdate({ transform: { ...transform, ...field } });
  };

  const updateCrop = (field: Partial<ClipCrop>) => {
    if (crop) {
      onUpdate({ crop: { ...crop, ...field } });
    } else {
      onUpdate({ crop: { x: 0, y: 0, width: defaultW, height: defaultH, ...field } });
    }
  };

  const btnStyle = (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: "4px",
    background: active ? theme.primary : theme.bgPanel,
    color: active ? theme.buttonText : theme.textMuted,
    border: `1px solid ${active ? theme.primary : theme.border}`,
    borderRadius: "3px",
    cursor: "pointer",
    fontSize: "11px",
  });

  return (
    <div style={{ marginTop: "8px" }}>
      <label style={{ color: theme.text, display: "block", marginBottom: "4px" }}>
        Rotation
      </label>
      <div style={{ display: "flex", gap: "4px" }}>
        {ROTATIONS.map((deg) => (
          <button
            key={deg}
            onClick={() => updateTransform({ rotation: deg })}
            style={btnStyle(currentRotation === deg)}
          >
            {deg}°
          </button>
        ))}
      </div>

      <label style={{ color: theme.text, display: "block", marginTop: "8px", marginBottom: "4px" }}>
        Position
      </label>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px" }}>
        <div>
          <label style={{ color: theme.textMuted, fontSize: "11px" }}>X (px)</label>
          <input
            type="number"
            value={transform.x ?? 0}
            onChange={(e) => updateTransform({ x: Number(e.target.value) })}
            step={1}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={{ color: theme.textMuted, fontSize: "11px" }}>Y (px)</label>
          <input
            type="number"
            value={transform.y ?? 0}
            onChange={(e) => updateTransform({ y: Number(e.target.value) })}
            step={1}
            style={inputStyle}
          />
        </div>
      </div>

      <label style={{ color: theme.text, display: "block", marginTop: "8px", marginBottom: "4px" }}>
        Scale ({Math.round((transform.scale ?? 1) * 100)}%)
      </label>
      <input
        type="number"
        value={transform.scale ?? 1}
        onChange={(e) => updateTransform({ scale: Number(e.target.value) })}
        min={0.1}
        max={5}
        step={0.1}
        style={inputStyle}
      />

      {(transform.x || transform.y || (transform.scale && transform.scale !== 1)) && (
        <button
          onClick={() => onUpdate({ transform: { rotation: currentRotation } })}
          style={{ ...buttonStyle.secondary, ...buttonStyle.small, marginTop: "4px", color: theme.textMuted }}
        >
          Reset Position/Scale
        </button>
      )}

      <label style={{ color: theme.text, display: "block", marginTop: "8px", marginBottom: "4px" }}>
        Crop {crop ? "(active)" : ""}
      </label>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px" }}>
        <div>
          <label style={{ color: theme.textMuted, fontSize: "11px" }}>X</label>
          <input
            type="number"
            value={crop?.x ?? 0}
            onChange={(e) => updateCrop({ x: Number(e.target.value) })}
            min={0}
            max={asset?.width ? asset.width - 1 : undefined}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={{ color: theme.textMuted, fontSize: "11px" }}>Y</label>
          <input
            type="number"
            value={crop?.y ?? 0}
            onChange={(e) => updateCrop({ y: Number(e.target.value) })}
            min={0}
            max={asset?.height ? asset.height - 1 : undefined}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={{ color: theme.textMuted, fontSize: "11px" }}>W</label>
          <input
            type="number"
            value={crop?.width ?? defaultW}
            onChange={(e) => updateCrop({ width: Number(e.target.value) })}
            min={1}
            max={asset?.width}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={{ color: theme.textMuted, fontSize: "11px" }}>H</label>
          <input
            type="number"
            value={crop?.height ?? defaultH}
            onChange={(e) => updateCrop({ height: Number(e.target.value) })}
            min={1}
            max={asset?.height}
            style={inputStyle}
          />
        </div>
      </div>
      {crop && (
        <button
          onClick={() => onUpdate({ crop: undefined })}
          style={{ ...buttonStyle.secondary, ...buttonStyle.small, marginTop: "4px", color: theme.textMuted }}
        >
          Reset Crop
        </button>
      )}
    </div>
  );
}
