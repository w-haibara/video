import { useState, useEffect } from "react";
import type { Project, ProjectSettings } from "@video/shared";

type Props = {
  project: Project;
  onUpdateSettings: (settings: ProjectSettings) => void;
};

export function ProjectSettingsPanel({ project, onUpdateSettings }: Props) {
  const currentSec = project.settings.durationMs / 1000;
  const [durationVal, setDurationVal] = useState(String(currentSec));

  useEffect(() => {
    setDurationVal(String(project.settings.durationMs / 1000));
  }, [project.settings.durationMs]);

  const handleCommit = () => {
    const sec = parseFloat(durationVal);
    if (isNaN(sec) || sec < 1 || sec > 3600) {
      setDurationVal(String(currentSec));
      return;
    }
    const ms = Math.round(sec * 1000);
    if (ms !== project.settings.durationMs) {
      onUpdateSettings({ durationMs: ms });
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "#333",
    color: "#fff",
    border: "1px solid #555",
    borderRadius: "3px",
    padding: "4px 6px",
    fontSize: "12px",
    boxSizing: "border-box",
  };

  return (
    <div style={{ padding: "8px", fontSize: "12px", color: "#ccc" }}>
      <h4 style={{ margin: "0 0 12px", color: "#fff" }}>Project Settings</h4>
      <div>
        <label style={{ color: "#888", display: "block", marginBottom: "4px" }}>
          Duration (sec)
        </label>
        <input
          type="number"
          value={durationVal}
          onChange={(e) => setDurationVal(e.target.value)}
          onBlur={handleCommit}
          onKeyDown={(e) => { if (e.key === "Enter") handleCommit(); }}
          min={1}
          max={3600}
          step={1}
          style={inputStyle}
        />
        <div style={{ color: "#666", fontSize: "10px", marginTop: "4px" }}>
          Min: 1s / Max: 3600s (1 hour)
        </div>
      </div>
    </div>
  );
}
