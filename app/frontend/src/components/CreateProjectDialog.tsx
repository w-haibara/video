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
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: "#1e1e1e",
          borderRadius: "8px",
          padding: "24px",
          border: "1px solid #333",
          minWidth: "360px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <h2 style={{ fontSize: "18px", fontWeight: 600 }}>New Project</h2>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Project name"
          autoFocus
          style={{
            padding: "10px 12px",
            background: "#111",
            color: "#eee",
            border: "1px solid #444",
            borderRadius: "6px",
            fontSize: "14px",
            outline: "none",
          }}
        />
        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "8px 16px",
              background: "#333",
              color: "#ccc",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createProject.isPending}
            style={{
              padding: "8px 16px",
              background: "#3a6ad4",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
              opacity: createProject.isPending ? 0.6 : 1,
            }}
          >
            {createProject.isPending ? "Creating..." : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
}
