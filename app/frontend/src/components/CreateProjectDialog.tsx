import { useState } from "react";
import { useCreateProject } from "../api/projects";

type Props = { onClose: () => void };

export function CreateProjectDialog({ onClose }: Props) {
  const [name, setName] = useState("");
  const createProject = useCreateProject();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createProject.mutate(
      { name: name.trim() },
      { onSuccess: () => onClose() },
    );
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <h2>New Project</h2>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Project name"
          autoFocus
        />
        <button type="submit" disabled={createProject.isPending}>
          {createProject.isPending ? "Creating..." : "Create"}
        </button>
        <button type="button" onClick={onClose}>
          Cancel
        </button>
      </form>
    </div>
  );
}
