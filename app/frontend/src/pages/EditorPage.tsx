import { useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useProject } from "../api/projects";
import { EditorLayout } from "../components/EditorLayout";
import { AssetPanel } from "../components/AssetPanel";
import { Timeline } from "../components/Timeline";

export function EditorPage() {
  const { id } = useParams<{ id: string }>();
  const { data: project, isLoading, error } = useProject(id!);
  const [currentTimeMs, setCurrentTimeMs] = useState(0);
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);

  const handleSeek = useCallback((ms: number) => {
    setCurrentTimeMs(ms);
  }, []);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!project) return <div>Project not found</div>;

  return (
    <EditorLayout
      left={<AssetPanel project={project} />}
      center={<div style={{ color: "#888" }}>Preview (Phase 2)</div>}
      bottom={
        <Timeline
          project={project}
          currentTimeMs={currentTimeMs}
          onSeek={handleSeek}
          selectedClipId={selectedClipId}
          onSelectClip={setSelectedClipId}
        />
      }
    />
  );
}
