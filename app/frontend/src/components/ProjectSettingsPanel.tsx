import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import type { Project, ProjectSettings } from "@video/shared";
import { theme, inputStyle, sectionHeadingStyle } from "../theme";

type Props = {
  project: Project;
  onUpdateSettings: (settings: ProjectSettings) => void;
  projectId: string;
};

export function ProjectSettingsPanel({ project, onUpdateSettings, projectId }: Props) {
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
      onUpdateSettings({ ...project.settings, durationMs: ms });
    }
  };

  return (
    <div style={{ padding: "8px", fontSize: "12px", color: theme.text }}>
      <h3 style={sectionHeadingStyle}>Project Settings</h3>
      <div>
        <label style={{ color: theme.textMuted, display: "block", marginBottom: "4px" }}>
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
        <div style={{ color: theme.textMuted, fontSize: "11px", marginTop: "4px" }}>
          Min: 1s / Max: 3600s (1 hour)
        </div>
      </div>
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
