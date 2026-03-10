import { useState, useEffect } from "react";
import { theme, inputStyle } from "../../theme";
import type { InspectorEditorContext } from "../../lib/inspector-editor-registry";

const MIN_DURATION_MS = 100;

function msToSec(ms: number): string {
  return (ms / 1000).toFixed(1);
}

function secToMs(sec: string): number {
  return Math.round(parseFloat(sec) * 1000);
}

export function TrimEditor({ clip, asset, clipKind, onUpdate }: InspectorEditorContext) {
  const isTextOrImage = clipKind === "title" || asset?.kind === "image";
  const hasSourceTrim = clipKind !== "title";
  const maxSourceMs = asset?.durationMs;

  const [durationVal, setDurationVal] = useState(msToSec(clip.durationMs));
  const [inVal, setInVal] = useState(msToSec(clip.inMs));
  const [outVal, setOutVal] = useState(msToSec(clip.outMs));

  useEffect(() => {
    setDurationVal(msToSec(clip.durationMs));
    setInVal(msToSec(clip.inMs));
    setOutVal(msToSec(clip.outMs));
  }, [clip.durationMs, clip.inMs, clip.outMs]);

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
      <label style={{ color: theme.text, display: "block", marginBottom: "4px" }}>
        Trim
      </label>
      <div style={{ display: "grid", gridTemplateColumns: hasSourceTrim ? "1fr 1fr 1fr" : "1fr", gap: "4px" }}>
        {hasSourceTrim && (
          <div>
            <label style={{ color: theme.textMuted, fontSize: "11px" }}>In (s)</label>
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
            <label style={{ color: theme.textMuted, fontSize: "11px" }}>Out (s)</label>
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
          <label style={{ color: theme.textMuted, fontSize: "11px" }}>Duration (s)</label>
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
