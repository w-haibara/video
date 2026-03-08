import { Link } from "react-router-dom";
import type { Project } from "@video/shared";
import { theme } from "../theme";

type Props = { project: Project };

export function ProjectCard({ project }: Props) {
  return (
    <Link to={`/projects/${project.id}`}>
      <div
        style={{
          background: theme.bgPanel,
          borderRadius: "8px",
          padding: "20px",
          border: `1px solid ${theme.border}`,
          transition: "border-color 0.15s, background 0.15s",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = theme.textMuted;
          e.currentTarget.style.background = theme.bgHover;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = theme.border;
          e.currentTarget.style.background = theme.bgPanel;
        }}
      >
        <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "8px" }}>
          {project.name}
        </h3>
        <p style={{ fontSize: "13px", color: theme.textMuted, marginBottom: "4px" }}>
          {project.assets.length} assets
        </p>
        <time style={{ fontSize: "12px", color: theme.textDisabled }}>
          {new Date(project.updatedAt).toLocaleDateString()}
        </time>
      </div>
    </Link>
  );
}
