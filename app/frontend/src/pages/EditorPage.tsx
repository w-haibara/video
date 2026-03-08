import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import type { Project } from "@video/shared";
import { useProject } from "../api/projects";
import { EditorLayout } from "../components/EditorLayout";
import { EditorMainPanel } from "../components/EditorMainPanel";
import { AssetPanel } from "../components/AssetPanel";
import { Timeline } from "../components/Timeline";
import { InspectorPanel } from "../components/InspectorPanel";
import { PreviewPlayer } from "../components/PreviewPlayer";
import { SaveIndicator } from "../components/SaveIndicator";
import { ExportDialog } from "../components/ExportDialog";
import { useProjectEditor } from "../hooks/useProjectEditor";
import { useUndoRedo } from "../hooks/useUndoRedo";
import { useAutoSave } from "../hooks/useAutoSave";

function EditorPageInner({ projectId }: { projectId: string }) {
  const { data: project, isLoading, error } = useProject(projectId);
  const [currentTimeMs, setCurrentTimeMs] = useState(0);
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

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
      isPlaying={isPlaying}
      onPlayPause={() => setIsPlaying((p) => !p)}
    />
  );
}

function EditorPageLoaded({
  project,
  currentTimeMs,
  onSeek,
  selectedClipId,
  onSelectClip,
  isPlaying,
  onPlayPause,
}: {
  project: Project;
  currentTimeMs: number;
  onSeek: (ms: number) => void;
  selectedClipId: string | null;
  onSelectClip: (id: string | null) => void;
  isPlaying: boolean;
  onPlayPause: () => void;
}) {
  const [showExport, setShowExport] = useState(false);

  const { sequence, pushState, undo, redo, canUndo, canRedo } = useUndoRedo(
    project.sequence,
  );

  const { addClipFromAsset, removeClip, moveClip, trimClip, addTextClip, updateClip } =
    useProjectEditor(project, sequence, pushState);

  const { saveStatus } = useAutoSave(project.id, sequence);

  const currentProject: Project = { ...project, sequence };

  const handleSelectClip = useCallback((clipId: string | null) => {
    onSelectClip(clipId);
    if (clipId) {
      for (const track of sequence.tracks) {
        const clip = track.clips.find((c: { id: string }) => c.id === clipId);
        if (clip) {
          onSeek(clip.startMs);
          break;
        }
      }
    }
  }, [onSelectClip, onSeek, sequence.tracks]);

  const handleDeleteClip = useCallback((clipId: string) => {
    removeClip(clipId);
    handleSelectClip(null);
  }, [removeClip, handleSelectClip]);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;

      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (
        (e.ctrlKey || e.metaKey) &&
        ((e.key === "z" && e.shiftKey) || e.key === "y")
      ) {
        e.preventDefault();
        redo();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  return (
    <EditorLayout
      preview={
        <PreviewPlayer
          project={currentProject}
          currentTimeMs={currentTimeMs}
          onTimeUpdate={onSeek}
          isPlaying={isPlaying}
          onPlayPause={onPlayPause}
          selectedClipId={selectedClipId}
        />
      }
      mainPanel={
        <>
          <EditorMainPanel
            selectedClipId={selectedClipId}
            inspectorContent={
              <div>
                <SaveIndicator
                  status={saveStatus}
                  canUndo={canUndo}
                  canRedo={canRedo}
                  onUndo={undo}
                  onRedo={redo}
                />
                <InspectorPanel
                  project={currentProject}
                  selectedClipId={selectedClipId}
                  onUpdateClip={updateClip}
                />
              </div>
            }
            assetsContent={
              <div>
                <AssetPanel
                  project={currentProject}
                  onAddToTimeline={addClipFromAsset}
                />
                <div style={{ padding: "8px", borderTop: "1px solid #333", marginTop: "8px" }}>
                  <button
                    onClick={() => {
                      addTextClip(currentTimeMs, 3000, {
                        value: "Text",
                        fontSize: 48,
                        color: "#ffffff",
                        backgroundColor: "#000000",
                      });
                    }}
                    style={{
                      width: "100%",
                      padding: "6px",
                      background: "#8e44ad",
                      color: "#fff",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "12px",
                    }}
                  >
                    + Add Text
                  </button>
                </div>
              </div>
            }
            exportContent={
              <div>
                <div style={{ display: "flex", gap: "4px", marginBottom: "8px" }}>
                  <button
                    onClick={() => setShowExport(true)}
                    style={{
                      flex: 1,
                      padding: "8px",
                      background: "#3a6ad4",
                      color: "#fff",
                      border: "none",
                      borderRadius: "3px",
                      cursor: "pointer",
                      fontSize: "13px",
                    }}
                  >
                    Start Export
                  </button>
                </div>
                <Link
                  to={`/projects/${project.id}/jobs`}
                  style={{
                    display: "block",
                    padding: "8px",
                    background: "#444",
                    color: "#ccc",
                    border: "none",
                    borderRadius: "3px",
                    cursor: "pointer",
                    fontSize: "13px",
                    textDecoration: "none",
                    textAlign: "center",
                  }}
                >
                  View Jobs
                </Link>
              </div>
            }
          />
          {showExport && (
            <ExportDialog
              projectId={project.id}
              onClose={() => setShowExport(false)}
            />
          )}
        </>
      }
      bottom={
        <Timeline
          project={currentProject}
          currentTimeMs={currentTimeMs}
          onSeek={onSeek}
          selectedClipId={selectedClipId}
          onSelectClip={handleSelectClip}
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
