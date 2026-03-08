import { useState, useEffect } from "react";
import type { Project, Clip, Asset, ClipText, ClipTransform, ClipCrop } from "@video/shared";

type Props = {
  project: Project;
  selectedClipId: string | null;
  onUpdateClip?: (clipId: string, updates: Partial<Clip>) => void;
};

function findClipAndAsset(
  project: Project,
  clipId: string,
): { clip: Clip; asset: Asset | undefined; trackKind: string } | null {
  for (const track of project.sequence.tracks) {
    const clip = track.clips.find((c) => c.id === clipId);
    if (clip) {
      const asset = project.assets.find((a) => a.id === clip.assetId);
      return { clip, asset, trackKind: track.kind };
    }
  }
  return null;
}

function formatMs(ms: number): string {
  const totalSec = (ms / 1000).toFixed(1);
  return `${totalSec}s`;
}

export function InspectorPanel({ project, selectedClipId, onUpdateClip }: Props) {
  if (!selectedClipId) {
    return (
      <div style={{ color: "#666", fontSize: "12px", padding: "8px" }}>
        Select a clip to view details
      </div>
    );
  }

  const result = findClipAndAsset(project, selectedClipId);
  if (!result) {
    return (
      <div style={{ color: "#666", fontSize: "12px", padding: "8px" }}>
        Clip not found
      </div>
    );
  }

  const { clip, asset, trackKind } = result;
  const isTextClip = trackKind === "title";
  const fileName = asset?.originalPath.split("/").pop() ?? "—";

  return (
    <div style={{ padding: "8px", fontSize: "12px", color: "#ccc" }}>
      <h4 style={{ margin: "0 0 8px", color: "#fff" }}>Inspector</h4>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          {!isTextClip && <Row label="File" value={fileName} />}
          <Row label="Type" value={isTextClip ? "text" : (asset?.kind ?? "—")} />
          <Row label="Start" value={formatMs(clip.startMs)} />
          {asset?.width && asset?.height && (
            <Row label="Size" value={`${asset.width}x${asset.height}`} />
          )}
          {asset?.codec && <Row label="Codec" value={asset.codec} />}
        </tbody>
      </table>

      {onUpdateClip && (
        <TrimEditor
          clip={clip}
          asset={asset}
          trackKind={trackKind}
          onUpdate={(updates) => onUpdateClip(clip.id, updates)}
        />
      )}

      {isTextClip && onUpdateClip && (
        <TextEditor
          clip={clip}
          onUpdate={(updates) => onUpdateClip(clip.id, updates)}
        />
      )}

      {(trackKind === "video") && onUpdateClip && (
        <TransformEditor
          clip={clip}
          asset={asset}
          onUpdate={(updates) => onUpdateClip(clip.id, updates)}
        />
      )}

      {trackKind === "audio" && onUpdateClip && (
        <div style={{ marginTop: "8px" }}>
          <label style={{ color: "#888", display: "block", marginBottom: "4px" }}>
            Volume: {Math.round((clip.volume ?? 1) * 100)}%
          </label>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round((clip.volume ?? 1) * 100)}
            onChange={(e) =>
              onUpdateClip(clip.id, { volume: Number(e.target.value) / 100 })
            }
            style={{ width: "100%" }}
          />
        </div>
      )}
    </div>
  );
}

const MIN_DURATION_MS = 100;

function msToSec(ms: number): string {
  return (ms / 1000).toFixed(1);
}

function secToMs(sec: string): number {
  return Math.round(parseFloat(sec) * 1000);
}

function TrimEditor({
  clip,
  asset,
  trackKind,
  onUpdate,
}: {
  clip: Clip;
  asset: Asset | undefined;
  trackKind: string;
  onUpdate: (updates: Partial<Clip>) => void;
}) {
  const isTextOrImage = trackKind === "title" || asset?.kind === "image";
  const hasSourceTrim = trackKind !== "title";
  const maxSourceMs = asset?.durationMs;

  const [durationVal, setDurationVal] = useState(msToSec(clip.durationMs));
  const [inVal, setInVal] = useState(msToSec(clip.inMs));
  const [outVal, setOutVal] = useState(msToSec(clip.outMs));

  useEffect(() => {
    setDurationVal(msToSec(clip.durationMs));
    setInVal(msToSec(clip.inMs));
    setOutVal(msToSec(clip.outMs));
  }, [clip.durationMs, clip.inMs, clip.outMs]);

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "#333",
    color: "#fff",
    border: "1px solid #555",
    borderRadius: "3px",
    padding: "2px 4px",
    fontSize: "12px",
    boxSizing: "border-box",
  };

  const handleDurationCommit = () => {
    const newDurationMs = secToMs(durationVal);
    if (isNaN(newDurationMs) || newDurationMs < MIN_DURATION_MS) {
      setDurationVal(msToSec(clip.durationMs));
      return;
    }
    if (!isTextOrImage && maxSourceMs) {
      const clampedDuration = Math.min(newDurationMs, maxSourceMs - clip.inMs);
      if (clampedDuration < MIN_DURATION_MS) {
        setDurationVal(msToSec(clip.durationMs));
        return;
      }
      onUpdate({ durationMs: clampedDuration, outMs: clip.inMs + clampedDuration });
    } else {
      onUpdate({ durationMs: newDurationMs, outMs: clip.inMs + newDurationMs });
    }
  };

  const handleInCommit = () => {
    const newInMs = secToMs(inVal);
    if (isNaN(newInMs) || newInMs < 0) {
      setInVal(msToSec(clip.inMs));
      return;
    }
    if (newInMs >= clip.outMs - MIN_DURATION_MS) {
      setInVal(msToSec(clip.inMs));
      return;
    }
    const newDuration = clip.outMs - newInMs;
    onUpdate({ inMs: newInMs, durationMs: newDuration, startMs: clip.startMs + (newInMs - clip.inMs) });
  };

  const handleOutCommit = () => {
    const newOutMs = secToMs(outVal);
    if (isNaN(newOutMs)) {
      setOutVal(msToSec(clip.outMs));
      return;
    }
    if (newOutMs <= clip.inMs + MIN_DURATION_MS) {
      setOutVal(msToSec(clip.outMs));
      return;
    }
    const clampedOut = maxSourceMs && !isTextOrImage ? Math.min(newOutMs, maxSourceMs) : newOutMs;
    const newDuration = clampedOut - clip.inMs;
    if (newDuration < MIN_DURATION_MS) {
      setOutVal(msToSec(clip.outMs));
      return;
    }
    onUpdate({ outMs: clampedOut, durationMs: newDuration });
  };

  return (
    <div style={{ marginTop: "8px" }}>
      <label style={{ color: "#888", display: "block", marginBottom: "4px" }}>
        Trim
      </label>
      <div style={{ display: "grid", gridTemplateColumns: hasSourceTrim ? "1fr 1fr 1fr" : "1fr", gap: "4px" }}>
        {hasSourceTrim && (
          <div>
            <label style={{ color: "#666", fontSize: "10px" }}>In (s)</label>
            <input
              type="number"
              value={inVal}
              onChange={(e) => setInVal(e.target.value)}
              onBlur={handleInCommit}
              onKeyDown={(e) => { if (e.key === "Enter") handleInCommit(); }}
              min={0}
              step={0.1}
              style={inputStyle}
            />
          </div>
        )}
        {hasSourceTrim && (
          <div>
            <label style={{ color: "#666", fontSize: "10px" }}>Out (s)</label>
            <input
              type="number"
              value={outVal}
              onChange={(e) => setOutVal(e.target.value)}
              onBlur={handleOutCommit}
              onKeyDown={(e) => { if (e.key === "Enter") handleOutCommit(); }}
              min={0}
              step={0.1}
              style={inputStyle}
            />
          </div>
        )}
        <div>
          <label style={{ color: "#666", fontSize: "10px" }}>Duration (s)</label>
          <input
            type="number"
            value={durationVal}
            onChange={(e) => setDurationVal(e.target.value)}
            onBlur={handleDurationCommit}
            onKeyDown={(e) => { if (e.key === "Enter") handleDurationCommit(); }}
            min={0.1}
            step={0.1}
            style={inputStyle}
          />
        </div>
      </div>
    </div>
  );
}

function TextEditor({
  clip,
  onUpdate,
}: {
  clip: Clip;
  onUpdate: (updates: Partial<Clip>) => void;
}) {
  const text = clip.text ?? { value: "" };

  const updateText = (field: Partial<ClipText>) => {
    onUpdate({ text: { ...text, ...field } });
  };

  return (
    <div style={{ marginTop: "8px" }}>
      <label style={{ color: "#888", display: "block", marginBottom: "4px" }}>
        Text
      </label>
      <textarea
        value={text.value}
        onChange={(e) => updateText({ value: e.target.value })}
        rows={2}
        style={{
          width: "100%",
          background: "#333",
          color: "#fff",
          border: "1px solid #555",
          borderRadius: "3px",
          padding: "4px",
          fontSize: "12px",
          resize: "vertical",
          boxSizing: "border-box",
        }}
      />

      <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
        <div style={{ flex: 1 }}>
          <label style={{ color: "#888", display: "block", marginBottom: "2px" }}>
            Size
          </label>
          <input
            type="number"
            value={text.fontSize ?? 48}
            onChange={(e) => updateText({ fontSize: Number(e.target.value) })}
            min={12}
            max={200}
            style={{
              width: "100%",
              background: "#333",
              color: "#fff",
              border: "1px solid #555",
              borderRadius: "3px",
              padding: "2px 4px",
              fontSize: "12px",
              boxSizing: "border-box",
            }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ color: "#888", display: "block", marginBottom: "2px" }}>
            Color
          </label>
          <input
            type="color"
            value={text.color ?? "#ffffff"}
            onChange={(e) => updateText({ color: e.target.value })}
            style={{
              width: "100%",
              height: "24px",
              border: "none",
              cursor: "pointer",
              background: "none",
            }}
          />
        </div>
      </div>

      <div style={{ marginTop: "6px" }}>
        <label style={{ color: "#888", display: "block", marginBottom: "2px" }}>
          Background
        </label>
        <input
          type="color"
          value={text.backgroundColor ?? "#000000"}
          onChange={(e) => updateText({ backgroundColor: e.target.value })}
          style={{
            width: "50%",
            height: "24px",
            border: "none",
            cursor: "pointer",
            background: "none",
          }}
        />
      </div>
    </div>
  );
}

const ROTATIONS = [0, 90, 180, 270] as const;

function TransformEditor({
  clip,
  asset,
  onUpdate,
}: {
  clip: Clip;
  asset: Asset | undefined;
  onUpdate: (updates: Partial<Clip>) => void;
}) {
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
    background: active ? "#3a6ad4" : "#333",
    color: active ? "#fff" : "#aaa",
    border: "1px solid " + (active ? "#3a6ad4" : "#555"),
    borderRadius: "3px",
    cursor: "pointer",
    fontSize: "11px",
  });

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "#333",
    color: "#fff",
    border: "1px solid #555",
    borderRadius: "3px",
    padding: "2px 4px",
    fontSize: "12px",
    boxSizing: "border-box",
  };

  return (
    <div style={{ marginTop: "8px" }}>
      <label style={{ color: "#888", display: "block", marginBottom: "4px" }}>
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

      <label style={{ color: "#888", display: "block", marginTop: "8px", marginBottom: "4px" }}>
        Position
      </label>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px" }}>
        <div>
          <label style={{ color: "#666", fontSize: "10px" }}>X (px)</label>
          <input
            type="number"
            value={transform.x ?? 0}
            onChange={(e) => updateTransform({ x: Number(e.target.value) })}
            step={1}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={{ color: "#666", fontSize: "10px" }}>Y (px)</label>
          <input
            type="number"
            value={transform.y ?? 0}
            onChange={(e) => updateTransform({ y: Number(e.target.value) })}
            step={1}
            style={inputStyle}
          />
        </div>
      </div>

      <label style={{ color: "#888", display: "block", marginTop: "8px", marginBottom: "4px" }}>
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
          style={{
            marginTop: "4px",
            padding: "2px 8px",
            background: "#333",
            color: "#888",
            border: "1px solid #555",
            borderRadius: "3px",
            cursor: "pointer",
            fontSize: "11px",
          }}
        >
          Reset Position/Scale
        </button>
      )}

      <label style={{ color: "#888", display: "block", marginTop: "8px", marginBottom: "4px" }}>
        Crop {crop ? "(active)" : ""}
      </label>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px" }}>
        <div>
          <label style={{ color: "#666", fontSize: "10px" }}>X</label>
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
          <label style={{ color: "#666", fontSize: "10px" }}>Y</label>
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
          <label style={{ color: "#666", fontSize: "10px" }}>W</label>
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
          <label style={{ color: "#666", fontSize: "10px" }}>H</label>
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
          style={{
            marginTop: "4px",
            padding: "2px 8px",
            background: "#333",
            color: "#888",
            border: "1px solid #555",
            borderRadius: "3px",
            cursor: "pointer",
            fontSize: "11px",
          }}
        >
          Reset Crop
        </button>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <tr>
      <td style={{ padding: "2px 4px 2px 0", color: "#888", whiteSpace: "nowrap" }}>
        {label}
      </td>
      <td style={{ padding: "2px 0", wordBreak: "break-all" }}>{value}</td>
    </tr>
  );
}
