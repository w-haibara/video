import { useState } from "react";
import { useProjects } from "../api/projects";
import { ProjectCard } from "../components/ProjectCard";
import { CreateProjectDialog } from "../components/CreateProjectDialog";

export function HomePage() {
  const { data, isLoading, error } = useProjects();
  const [showCreate, setShowCreate] = useState(false);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <header>
        <h1>Projects</h1>
        <button onClick={() => setShowCreate(true)}>New Project</button>
      </header>
      <div>
        {data?.projects.map((p) => (
          <ProjectCard key={p.id} project={p} />
        ))}
        {data?.projects.length === 0 && <p>No projects yet.</p>}
      </div>
      {showCreate && (
        <CreateProjectDialog onClose={() => setShowCreate(false)} />
      )}
    </div>
  );
}
