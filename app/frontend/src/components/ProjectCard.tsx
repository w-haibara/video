import { Link } from "react-router-dom";
import type { Project } from "@video/shared";

type Props = { project: Project };

export function ProjectCard({ project }: Props) {
  return (
    <Link to={`/projects/${project.id}`}>
      <div
        style={{
          background: "#1e1e1e",
          borderRadius: "8px",
          padding: "20px",
          border: "1px solid #333",
          transition: "border-color 0.15s, background 0.15s",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "#555";
          e.currentTarget.style.background = "#252525";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "#333";
          e.currentTarget.style.background = "#1e1e1e";
        }}
      >
        <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "8px" }}>
          {project.name}
        </h3>
        <p style={{ fontSize: "13px", color: "#888", marginBottom: "4px" }}>
          {project.assets.length} assets
        </p>
        <time style={{ fontSize: "12px", color: "#666" }}>
          {new Date(project.updatedAt).toLocaleDateString()}
        </time>
      </div>
    </Link>
  );
}
