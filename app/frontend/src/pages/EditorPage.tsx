import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import type { Project, ProjectSettings } from "@video/shared";
import { useProject, useUpdateProject } from "../api/projects";
import { useExport } from "../api/exports";
import { useJob } from "../api/jobs";
import { EditorLayout } from "../components/EditorLayout";
import { EditorMainPanel } from "../components/EditorMainPanel";
import { AssetPanel } from "../components/AssetPanel";
import { Timeline } from "../components/Timeline";
import { InspectorPanel } from "../components/InspectorPanel";
import { PreviewPlayer } from "../components/PreviewPlayer";
import { SaveIndicator } from "../components/SaveIndicator";
import { JobProgress } from "../components/JobProgress";
import { ProjectSettingsPanel } from "../components/ProjectSettingsPanel";
import { useProjectEditor } from "../hooks/useProjectEditor";
import { clampClipsToDuration } from "../lib/sequence-ops";
import { useUndoRedo } from "../hooks/useUndoRedo";
import { useAutoSave } from "../hooks/useAutoSave";
import { theme } from "../theme";

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
  const [exportFilename, setExportFilename] = useState(`export-${Date.now()}.mp4`);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const exportedFilenameRef = useRef<string | null>(null);
  const downloadedRef = useRef(false);
  const exportMutation = useExport(project.id);
  const { data: exportJob } = useJob(activeJobId);

  const isExporting =
    activeJobId && exportJob && exportJob.status !== "completed" && exportJob.status !== "failed";

  const handleExport = async () => {
    exportedFilenameRef.current = exportFilename;
    downloadedRef.current = false;
    const result = await exportMutation.mutateAsync(exportFilename);
    setActiveJobId(result.jobId);
  };

  useEffect(() => {
    if (
      exportJob?.status === "completed" &&
      exportedFilenameRef.current &&
      !downloadedRef.current
    ) {
      downloadedRef.current = true;
      const a = document.createElement("a");
      a.href = `/media/projects/${project.id}/exports/${exportedFilenameRef.current}`;
      a.download = exportedFilenameRef.current;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  }, [exportJob?.status, project.id]);

  const { sequence, pushState, undo, redo, canUndo, canRedo } = useUndoRedo(
    project.sequence,
  );

  const { addClipFromAsset, removeClip, moveClip, trimClip, addTextClip, updateClip } =
    useProjectEditor(project, sequence, pushState);

  const { saveStatus } = useAutoSave(project.id, sequence);

  const updateProjectMutation = useUpdateProject(project.id);
  const handleUpdateSettings = useCallback((settings: ProjectSettings) => {
    updateProjectMutation.mutate({ settings });
    const clamped = clampClipsToDuration(sequence, settings.durationMs);
    pushState(clamped);
  }, [updateProjectMutation, sequence, pushState]);

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
      toolbar={
        <SaveIndicator
          status={saveStatus}
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={undo}
          onRedo={redo}
        />
      }
      preview={
        <PreviewPlayer
          project={currentProject}
          currentTimeMs={currentTimeMs}
          onTimeUpdate={onSeek}
          isPlaying={isPlaying}
          onPlayPause={onPlayPause}
          selectedClipId={selectedClipId}
          onSelectClip={handleSelectClip}
        />
      }
      mainPanel={
        <>
          <EditorMainPanel
            selectedClipId={selectedClipId}
            inspectorContent={
              <InspectorPanel
                project={currentProject}
                selectedClipId={selectedClipId}
                onUpdateClip={updateClip}
                onMoveClip={moveClip}
              />
            }
            assetsContent={
              <div>
                <AssetPanel
                  project={currentProject}
                  onAddToTimeline={addClipFromAsset}
                />
                <div style={{ padding: "8px", borderTop: `1px solid ${theme.border}`, marginTop: "8px" }}>
                  <button
                    onClick={() => {
                      addTextClip(currentTimeMs, 3000, {
                        value: "Text",
                        fontSize: 48,
                        color: theme.white,
                        backgroundColor: theme.black,
                      });
                    }}
                    style={{
                      width: "100%",
                      padding: "6px",
                      background: theme.clipText,
                      color: theme.buttonText,
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
              <div style={{ padding: "8px", fontSize: "12px", color: theme.text }}>
                <label style={{ color: theme.textMuted, display: "block", marginBottom: "4px" }}>
                  Filename
                </label>
                <input
                  type="text"
                  value={exportFilename}
                  onChange={(e) => setExportFilename(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "6px 8px",
                    background: theme.bgPanel,
                    color: theme.text,
                    border: `1px solid ${theme.border}`,
                    borderRadius: "4px",
                    fontSize: "13px",
                    marginBottom: "12px",
                    boxSizing: "border-box",
                  }}
                />
                <button
                  onClick={handleExport}
                  disabled={!!isExporting || exportMutation.isPending}
                  style={{
                    width: "100%",
                    padding: "8px",
                    background: isExporting ? theme.bgDark : theme.button,
                    color: isExporting ? theme.textMuted : theme.buttonText,
                    border: "none",
                    borderRadius: "4px",
                    cursor: isExporting ? "default" : "pointer",
                    fontSize: "13px",
                    marginBottom: "12px",
                  }}
                >
                  {isExporting ? "Exporting..." : "Start Export"}
                </button>
                {activeJobId && exportJob && (
                  <div>
                    <JobProgress job={exportJob} />
                    {exportJob.status === "completed" && (
                      <div style={{ color: theme.success, marginTop: "4px", fontSize: "12px" }}>
                        Export completed! Downloading...
                      </div>
                    )}
                    {exportJob.status === "failed" && (
                      <div style={{ color: theme.error, marginTop: "4px", fontSize: "12px" }}>
                        Export failed: {exportJob.error}
                      </div>
                    )}
                  </div>
                )}
              </div>
            }
            settingsContent={
              <ProjectSettingsPanel
                project={currentProject}
                onUpdateSettings={handleUpdateSettings}
                projectId={project.id}
              />
            }
          />
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
