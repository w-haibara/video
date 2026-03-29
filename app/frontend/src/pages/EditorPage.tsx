import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import type { Project, ProjectSettings, Clip } from "@video/shared";
import { generateId } from "@video/shared";
import { useProject, useUpdateProject } from "../api/projects";
import { useExport } from "../api/exports";
import { useJob } from "../api/jobs";
import { EditorLayout } from "../components/EditorLayout";
import { EditorMainPanel } from "../components/EditorMainPanel";
import { AssetPanel } from "../components/AssetPanel";
import { Timeline } from "../components/Timeline";
import { InspectorPanel } from "../components/InspectorPanel";
import { PreviewPlayer } from "../components/PreviewPlayer";
import { PreviewPopout } from "../components/PreviewPopout";
import { usePreviewPopout } from "../hooks/usePreviewPopout";
import { SaveIndicator } from "../components/SaveIndicator";
import { JobProgress } from "../components/JobProgress";
import { ProjectSettingsPanel } from "../components/ProjectSettingsPanel";
import { KeyboardShortcutsPanel } from "../components/KeyboardShortcutsPanel";
import { useProjectEditor } from "../hooks/useProjectEditor";
import { clampClipsToDuration, removeTrack } from "../lib/sequence-ops";
import { useUndoRedo } from "../hooks/useUndoRedo";
import { useAutoSave } from "../hooks/useAutoSave";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { theme, buttonStyle, inputStyle } from "../theme";

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
  const [isPreviewFullscreen, setIsPreviewFullscreen] = useState(false);
  const togglePreviewFullscreen = useCallback(() => setIsPreviewFullscreen((v) => !v), []);

  const { popoutWindow, isPopout, openPopout, closePopout } = usePreviewPopout();
  const togglePopout = useCallback(() => {
    if (isPopout) closePopout();
    else openPopout();
  }, [isPopout, openPopout, closePopout]);

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

  const { addClipFromAsset, removeClip, moveClip, trimClip, splitClip, addTextClip, addEmptyClip, updateClip, setTransition, rippleDelete, rippleTrim, duplicateClip, pasteClip, pasteAttributes } =
    useProjectEditor(project, sequence, pushState);

  // Internal clipboard for copy/paste
  const [clipboardClip, setClipboardClip] = useState<Clip | null>(null);

  type ToolMode = "select" | "razor";
  const [toolMode, setToolMode] = useState<ToolMode>("select");
  const [snapEnabled, setSnapEnabled] = useState(true);
  const toggleSnap = useCallback(() => setSnapEnabled((v) => !v), []);

  const { saveStatus } = useAutoSave(project.id, sequence);

  const updateProjectMutation = useUpdateProject(project.id);
  const handleUpdateSettings = useCallback((settings: ProjectSettings) => {
    updateProjectMutation.mutate({ settings });
    const clamped = clampClipsToDuration(sequence, settings.durationMs);
    pushState(clamped);
  }, [updateProjectMutation, sequence, pushState]);

  // Derive selected track from selected clip
  const selectedTrackId = selectedClipId
    ? sequence.tracks.find((t) => t.clips.some((c) => c.id === selectedClipId))?.id ?? null
    : null;

  const handleAddTrack = useCallback(() => {
    const newTrack = { id: generateId(), clips: [] };
    pushState({ ...sequence, tracks: [...sequence.tracks, newTrack] });
  }, [sequence, pushState]);

  const handleDeleteTrack = useCallback((trackId: string) => {
    pushState(removeTrack(sequence, trackId));
  }, [sequence, pushState]);

  const handleAddClipFromAsset = useCallback(
    (asset: Parameters<typeof addClipFromAsset>[0]) => {
      addClipFromAsset(asset, selectedTrackId ?? undefined);
    },
    [addClipFromAsset, selectedTrackId],
  );

  const handleAddTextClip = useCallback(
    (startMs: number, durationMs: number, text: Parameters<typeof addTextClip>[2]) => {
      addTextClip(startMs, durationMs, text, selectedTrackId ?? undefined);
    },
    [addTextClip, selectedTrackId],
  );

  const pendingAutoSelectRef = useRef(false);
  const prevClipIdsRef = useRef(new Set<string>());

  // Track clip IDs for auto-selection of newly added empty clips
  useEffect(() => {
    const currentIds = new Set(
      sequence.tracks.flatMap((t) => t.clips.map((c) => c.id)),
    );
    if (pendingAutoSelectRef.current && prevClipIdsRef.current.size > 0) {
      for (const id of currentIds) {
        if (!prevClipIdsRef.current.has(id)) {
          onSelectClip(id);
          break;
        }
      }
      pendingAutoSelectRef.current = false;
    }
    prevClipIdsRef.current = currentIds;
  }, [sequence, onSelectClip]);

  const handleAddEmptyClip = useCallback(
    (clipKind: string, startMs: number, trackId: string) => {
      pendingAutoSelectRef.current = true;
      addEmptyClip(clipKind, startMs, trackId);
    },
    [addEmptyClip],
  );

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

  const handleRippleDeleteClip = useCallback((clipId: string) => {
    rippleDelete(clipId);
    handleSelectClip(null);
  }, [rippleDelete, handleSelectClip]);

  // Copy: store the selected clip in clipboard
  const handleCopy = useCallback(() => {
    if (!selectedClipId) return;
    for (const track of sequence.tracks) {
      const clip = track.clips.find((c: Clip) => c.id === selectedClipId);
      if (clip) {
        setClipboardClip({ ...clip });
        return;
      }
    }
  }, [selectedClipId, sequence.tracks]);

  // Paste: insert clipboard clip at playhead on the selected track (or same track)
  const handlePaste = useCallback(() => {
    if (!clipboardClip) return;
    const targetTrackId = selectedTrackId
      ?? sequence.tracks.find((t) => t.clips.some((c) => c.id === clipboardClip.id))?.id
      ?? sequence.tracks[0]?.id;
    if (!targetTrackId) return;
    pasteClip(clipboardClip, currentTimeMs, targetTrackId);
  }, [clipboardClip, selectedTrackId, sequence.tracks, pasteClip, currentTimeMs]);

  // Duplicate: duplicate selected clip in place
  const handleDuplicate = useCallback(() => {
    if (!selectedClipId) return;
    duplicateClip(selectedClipId);
  }, [selectedClipId, duplicateClip]);

  // Paste attributes: paste only visual properties from clipboard to selected clip
  const handlePasteAttributes = useCallback(() => {
    if (!clipboardClip || !selectedClipId) return;
    pasteAttributes(clipboardClip, selectedClipId);
  }, [clipboardClip, selectedClipId, pasteAttributes]);

  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);

  // Compute frame time from export preset fps (default 30)
  const fps = currentProject.exportPreset?.fps ?? 30;
  const frameTimeMs = 1000 / fps;
  const durationMs = currentProject.settings.durationMs;

  // Compute sequence end (last clip end) for End key
  const sequenceEndMs = sequence.tracks.reduce((maxEnd, track) => {
    return track.clips.reduce((m, clip) => Math.max(m, clip.startMs + clip.durationMs), maxEnd);
  }, 0);

  // Find clip at playhead for split-at-playhead (S key)
  const handleSplitAtPlayhead = useCallback(() => {
    for (const track of sequence.tracks) {
      for (const clip of track.clips) {
        if (currentTimeMs > clip.startMs && currentTimeMs < clip.startMs + clip.durationMs) {
          splitClip(clip.id, currentTimeMs);
          return;
        }
      }
    }
  }, [sequence, currentTimeMs, splitClip]);

  // Centralized keyboard shortcuts
  useKeyboardShortcuts({
    isPlaying,
    onPlayPause,
    onUndo: undo,
    onRedo: redo,
    onSetToolSelect: () => setToolMode("select"),
    onSetToolRazor: () => setToolMode("razor"),
    onDeleteClip: () => { if (selectedClipId) handleDeleteClip(selectedClipId); },
    onRippleDeleteClip: () => { if (selectedClipId) handleRippleDeleteClip(selectedClipId); },
    onJumpToStart: () => onSeek(0),
    onJumpToEnd: () => onSeek(sequenceEndMs > 0 ? Math.min(durationMs, sequenceEndMs) : durationMs),
    onStepForward: () => onSeek(Math.min(durationMs, currentTimeMs + frameTimeMs)),
    onStepBackward: () => onSeek(Math.max(0, currentTimeMs - frameTimeMs)),
    onSplitAtPlayhead: handleSplitAtPlayhead,
    onToggleShortcutsHelp: () => setShowShortcutsHelp((v) => !v),
    onCopy: handleCopy,
    onPaste: handlePaste,
    onDuplicate: handleDuplicate,
    onToggleSnap: toggleSnap,
  });

  return (
    <>
    <EditorLayout
      toolbar={
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
            <button
              onClick={() => setToolMode("select")}
              title="Select tool (V)"
              style={{
                background: toolMode === "select" ? theme.bgHover : "none",
                border: `1px solid ${toolMode === "select" ? theme.border : "transparent"}`,
                color: toolMode === "select" ? theme.text : theme.textMuted,
                padding: "2px 8px",
                cursor: "pointer",
                borderRadius: "3px",
                fontSize: "12px",
                fontWeight: toolMode === "select" ? "bold" : "normal",
              }}
            >
              V
            </button>
            <button
              onClick={() => setToolMode("razor")}
              title="Razor tool (C)"
              style={{
                background: toolMode === "razor" ? theme.bgHover : "none",
                border: `1px solid ${toolMode === "razor" ? theme.border : "transparent"}`,
                color: toolMode === "razor" ? theme.text : theme.textMuted,
                padding: "2px 8px",
                cursor: "pointer",
                borderRadius: "3px",
                fontSize: "12px",
                fontWeight: toolMode === "razor" ? "bold" : "normal",
              }}
            >
              C
            </button>
          </div>
          <SaveIndicator
            status={saveStatus}
            canUndo={canUndo}
            canRedo={canRedo}
            onUndo={undo}
            onRedo={redo}
          />
        </div>
      }
      preview={
        <>
          {isPopout && popoutWindow ? (
            <>
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                height: "100%",
                background: theme.bgDark,
                flexDirection: "column",
                gap: "8px",
              }}>
                <span style={{ color: theme.textMuted, fontSize: "14px" }}>
                  別ウィンドウで表示中
                </span>
                <button
                  onClick={closePopout}
                  style={{ ...buttonStyle.secondary, padding: "4px 16px", fontSize: "13px" }}
                >
                  ↙ 元に戻す
                </button>
              </div>
              <PreviewPopout popoutWindow={popoutWindow}>
                <PreviewPlayer
                  project={currentProject}
                  currentTimeMs={currentTimeMs}
                  onTimeUpdate={onSeek}
                  isPlaying={isPlaying}
                  onPlayPause={onPlayPause}
                  selectedClipId={selectedClipId}
                  onSelectClip={handleSelectClip}
                  isPopout={isPopout}
                  onTogglePopout={togglePopout}
                />
              </PreviewPopout>
            </>
          ) : (
            <PreviewPlayer
              project={currentProject}
              currentTimeMs={currentTimeMs}
              onTimeUpdate={onSeek}
              isPlaying={isPlaying}
              onPlayPause={onPlayPause}
              selectedClipId={selectedClipId}
              onSelectClip={handleSelectClip}
              isFullscreen={isPreviewFullscreen}
              onToggleFullscreen={togglePreviewFullscreen}
              isPopout={isPopout}
              onTogglePopout={togglePopout}
            />
          )}
        </>
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
                onSetTransition={setTransition}
              />
            }
            assetsContent={
              <div>
                <AssetPanel
                  project={currentProject}
                  onAddToTimeline={handleAddClipFromAsset}
                />
                <div style={{ padding: "8px", borderTop: `1px solid ${theme.border}`, marginTop: "8px" }}>
                  <button
                    onClick={() => {
                      handleAddTextClip(currentTimeMs, 3000, {
                        value: "Text",
                        fontSize: 48,
                        color: theme.white,
                        backgroundColor: theme.black,
                      });
                    }}
                    style={{ ...buttonStyle.primary, width: "100%", padding: "6px", background: theme.clipText }}
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
                  style={{ ...inputStyle, padding: "6px 8px", fontSize: "13px", marginBottom: "12px" }}
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
          onRippleDeleteClip={handleRippleDeleteClip}
          onMoveClip={moveClip}
          onTrimClip={trimClip}
          onRippleTrimClip={rippleTrim}
          onSplitClip={splitClip}
          toolMode={toolMode}
          onAddTrack={handleAddTrack}
          onDeleteTrack={handleDeleteTrack}
          onSetTransition={setTransition}
          onAddEmptyClip={handleAddEmptyClip}
          onCopyClip={handleCopy}
          onPasteClip={handlePaste}
          onDuplicateClip={handleDuplicate}
          onPasteAttributes={handlePasteAttributes}
          hasClipboard={clipboardClip !== null}
          snapEnabled={snapEnabled}
          onToggleSnap={toggleSnap}
        />
      }
    />
    {showShortcutsHelp && (
      <KeyboardShortcutsPanel onClose={() => setShowShortcutsHelp(false)} />
    )}
    </>
  );
}

export function EditorPage() {
  const { id } = useParams<{ id: string }>();
  return <EditorPageInner projectId={id!} />;
}
