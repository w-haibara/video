import { useParams } from "react-router-dom";
import { useProject } from "../api/projects";
import { EditorLayout } from "../components/EditorLayout";
import { AssetPanel } from "../components/AssetPanel";

export function EditorPage() {
  const { id } = useParams<{ id: string }>();
  const { data: project, isLoading, error } = useProject(id!);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!project) return <div>Project not found</div>;

  return (
    <EditorLayout
      left={<AssetPanel project={project} />}
      center={<div style={{ color: "#888" }}>Preview (Phase 2)</div>}
      bottom={<div style={{ color: "#888" }}>Timeline (Phase 2)</div>}
    />
  );
}
