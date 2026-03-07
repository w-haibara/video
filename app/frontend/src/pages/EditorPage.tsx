import { useState } from "react";
import { useParams } from "react-router-dom";
import { useProject } from "../api/projects";
import { EditorLayout } from "../components/EditorLayout";
import { AssetPanel } from "../components/AssetPanel";
import { Timeline } from "../components/Timeline";
import { InspectorPanel } from "../components/InspectorPanel";
import { useProjectEditor } from "../hooks/useProjectEditor";

function EditorPageInner({ projectId }: { projectId: string }) {
  const { data: project, isLoading, error } = useProject(projectId);
  const [currentTimeMs, setCurrentTimeMs] = useState(0);
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!project) return <div>Project not found</div>;

  return (
    <EditorPageLoaded
      project={project}
      currentTimeMs={currentTimeMs}
      onSeek={setCurrentTimeMs}
      selectedClipId={selectedClipId}
      onSelectClip={setSelectedClipId}
    />
  );
}

function EditorPageLoaded({
  project,
  currentTimeMs,
  onSeek,
  selectedClipId,
  onSelectClip,
}: {
  project: import("@video/shared").Project;
  currentTimeMs: number;
  onSeek: (ms: number) => void;
  selectedClipId: string | null;
  onSelectClip: (id: string | null) => void;
}) {
  const { addClipFromAsset, removeClip, moveClip, trimClip } =
    useProjectEditor(project);

  const handleDeleteClip = (clipId: string) => {
    removeClip(clipId);
    onSelectClip(null);
  };

  return (
    <EditorLayout
      left={<AssetPanel project={project} onAddToTimeline={addClipFromAsset} />}
      center={<div style={{ color: "#888" }}>Preview (Phase 2)</div>}
      right={
        <InspectorPanel project={project} selectedClipId={selectedClipId} />
      }
      bottom={
        <Timeline
          project={project}
          currentTimeMs={currentTimeMs}
          onSeek={onSeek}
          selectedClipId={selectedClipId}
          onSelectClip={onSelectClip}
          onDeleteClip={handleDeleteClip}
          onMoveClip={moveClip}
          onTrimClip={trimClip}
        />
      }
    />
  );
}

export function EditorPage() {
  const { id } = useParams<{ id: string }>();
  return <EditorPageInner projectId={id!} />;
}
