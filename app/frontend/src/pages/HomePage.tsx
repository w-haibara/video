import { useState } from "react";
import type { Project } from "@video/shared";
import { useProjects } from "../api/projects";
import { ProjectCard } from "../components/ProjectCard";
import { CreateProjectDialog } from "../components/CreateProjectDialog";
import { theme } from "../theme";

export function HomePage() {
  const { data, isLoading, error } = useProjects();
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div style={{ height: "100%", overflow: "auto" }}>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 24px",
          background: theme.bgPanel,
          borderBottom: `1px solid ${theme.border}`,
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <h1 style={{ fontSize: "20px", fontWeight: 600 }}>Projects</h1>
        <button
          onClick={() => setShowCreate(true)}
          style={{
            padding: "8px 16px",
            background: theme.button,
            color: theme.buttonText,
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: 500,
          }}
        >
          + New Project
        </button>
      </header>

      <main style={{ padding: "24px" }}>
        {isLoading && (
          <div style={{ color: theme.textMuted, textAlign: "center", padding: "48px" }}>
            Loading...
          </div>
        )}
        {error && (
          <div
            style={{
              color: theme.error,
              textAlign: "center",
              padding: "48px",
            }}
          >
            Error: {error.message}
          </div>
        )}
        {data && data.projects.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "64px 24px",
              color: theme.textMuted,
            }}
          >
            <p style={{ fontSize: "18px", marginBottom: "8px" }}>
              No projects yet
            </p>
            <p style={{ fontSize: "14px" }}>
              Click "+ New Project" to get started.
            </p>
          </div>
        )}
        {data && data.projects.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "16px",
            }}
          >
            {data.projects.map((p: Project) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        )}
      </main>

      {showCreate && (
        <CreateProjectDialog onClose={() => setShowCreate(false)} />
      )}
    </div>
  );
}
