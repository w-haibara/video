import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import type { Project, ProjectSettings } from "@video/shared";
import { theme, inputStyle, sectionHeadingStyle, buttonStyle, fontSize } from "../theme";

const CANVAS_PRESETS = [
  { label: "1920×1080 (16:9)", width: 1920, height: 1080 },
  { label: "1280×720 (16:9)", width: 1280, height: 720 },
  { label: "1080×1920 (9:16)", width: 1080, height: 1920 },
  { label: "1080×1080 (1:1)", width: 1080, height: 1080 },
] as const;

type Props = {
  project: Project;
  onUpdateSettings: (settings: ProjectSettings) => void;
  projectId: string;
};

/** Round to nearest even number (FFmpeg requires even dimensions) */
function toEven(n: number): number {
  return Math.round(n / 2) * 2;
}

export function ProjectSettingsPanel({ project, onUpdateSettings, projectId }: Props) {
  const currentSec = project.settings.durationMs / 1000;
  const [durationVal, setDurationVal] = useState(String(currentSec));
  const [widthVal, setWidthVal] = useState(String(project.settings.canvasWidth));
  const [heightVal, setHeightVal] = useState(String(project.settings.canvasHeight));

  useEffect(() => {
    setDurationVal(String(project.settings.durationMs / 1000));
  }, [project.settings.durationMs]);

  useEffect(() => {
    setWidthVal(String(project.settings.canvasWidth));
  }, [project.settings.canvasWidth]);

  useEffect(() => {
    setHeightVal(String(project.settings.canvasHeight));
  }, [project.settings.canvasHeight]);

  const handleDurationCommit = () => {
    const sec = parseFloat(durationVal);
    if (isNaN(sec) || sec < 1 || sec > 3600) {
      setDurationVal(String(currentSec));
      return;
    }
    const ms = Math.round(sec * 1000);
    if (ms !== project.settings.durationMs) {
      onUpdateSettings({ ...project.settings, durationMs: ms });
    }
  };

  const commitCanvasSize = (w: number, h: number) => {
    const clamped = {
      width: toEven(Math.max(320, Math.min(3840, w))),
      height: toEven(Math.max(320, Math.min(3840, h))),
    };
    if (
      clamped.width !== project.settings.canvasWidth ||
      clamped.height !== project.settings.canvasHeight
    ) {
      onUpdateSettings({
        ...project.settings,
        canvasWidth: clamped.width,
        canvasHeight: clamped.height,
      });
    }
    setWidthVal(String(clamped.width));
    setHeightVal(String(clamped.height));
  };

  const handleCanvasCommit = () => {
    const w = parseInt(widthVal, 10);
    const h = parseInt(heightVal, 10);
    if (isNaN(w) || isNaN(h)) {
      setWidthVal(String(project.settings.canvasWidth));
      setHeightVal(String(project.settings.canvasHeight));
      return;
    }
    commitCanvasSize(w, h);
  };

  const handlePreset = (width: number, height: number) => {
    commitCanvasSize(width, height);
  };

  const labelStyle = { color: theme.textMuted, display: "block" as const, marginBottom: "4px" };

  return (
    <div style={{ padding: "8px", fontSize: "12px", color: theme.text }}>
      <h3 style={sectionHeadingStyle}>Project Settings</h3>

      {/* Duration */}
      <div>
        <label style={labelStyle}>Duration (sec)</label>
        <input
          type="number"
          value={durationVal}
          onChange={(e) => setDurationVal(e.target.value)}
          onBlur={handleDurationCommit}
          onKeyDown={(e) => { if (e.key === "Enter") handleDurationCommit(); }}
          min={1}
          max={3600}
          step={1}
          style={inputStyle}
        />
        <div style={{ color: theme.textMuted, fontSize: "11px", marginTop: "4px" }}>
          Min: 1s / Max: 3600s (1 hour)
        </div>
      </div>

      {/* Canvas Size */}
      <div style={{ borderTop: `1px solid ${theme.border}`, marginTop: "12px", paddingTop: "12px" }}>
        <label style={labelStyle}>Canvas Size</label>
        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          <input
            type="number"
            aria-label="Canvas width"
            value={widthVal}
            onChange={(e) => setWidthVal(e.target.value)}
            onBlur={handleCanvasCommit}
            onKeyDown={(e) => { if (e.key === "Enter") handleCanvasCommit(); }}
            min={320}
            max={3840}
            step={2}
            style={{ ...inputStyle, width: "80px" }}
          />
          <span style={{ color: theme.textMuted }}>×</span>
          <input
            type="number"
            aria-label="Canvas height"
            value={heightVal}
            onChange={(e) => setHeightVal(e.target.value)}
            onBlur={handleCanvasCommit}
            onKeyDown={(e) => { if (e.key === "Enter") handleCanvasCommit(); }}
            min={320}
            max={3840}
            step={2}
            style={{ ...inputStyle, width: "80px" }}
          />
          <span style={{ color: theme.textMuted, fontSize: "11px" }}>px</span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "8px" }}>
          {CANVAS_PRESETS.map((p) => {
            const active =
              project.settings.canvasWidth === p.width &&
              project.settings.canvasHeight === p.height;
            return (
              <button
                key={p.label}
                onClick={() => handlePreset(p.width, p.height)}
                style={{
                  ...buttonStyle.secondary,
                  ...buttonStyle.small,
                  fontSize: fontSize.xs,
                  background: active ? theme.bgDark : "none",
                  fontWeight: active ? 600 : 400,
                }}
              >
                {p.label}
              </button>
            );
          })}
        </div>
        <div style={{ color: theme.textMuted, fontSize: "11px", marginTop: "4px" }}>
          Min: 320 / Max: 3840 (even numbers)
        </div>
      </div>

      {/* View Jobs */}
      <div style={{ borderTop: `1px solid ${theme.border}`, marginTop: "16px", paddingTop: "12px" }}>
        <Link
          to={`/projects/${projectId}/jobs`}
          style={{
            display: "block",
            padding: "8px",
            background: theme.bgDark,
            color: theme.text,
            borderRadius: "3px",
            fontSize: "13px",
            textDecoration: "none",
            textAlign: "center",
          }}
        >
          View Jobs
        </Link>
      </div>
    </div>
  );
}
