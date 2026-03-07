import { Link } from "react-router-dom";
import type { Project } from "@video/shared";

type Props = { project: Project };

export function ProjectCard({ project }: Props) {
  return (
    <Link to={`/projects/${project.id}`}>
      <div>
        <h3>{project.name}</h3>
        <p>{project.assets.length} assets</p>
        <time>{new Date(project.updatedAt).toLocaleDateString()}</time>
      </div>
    </Link>
  );
}
