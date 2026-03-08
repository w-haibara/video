import { useState, useEffect, useRef } from "react";
import { useExport } from "../api/exports";
import { useJob } from "../api/jobs";
import { JobProgress } from "./JobProgress";

type Props = {
  projectId: string;
  onClose: () => void;
};

export function ExportDialog({ projectId, onClose }: Props) {
  const [filename, setFilename] = useState(`export-${Date.now()}.mp4`);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const exportMutation = useExport(projectId);
  const { data: job } = useJob(activeJobId);

  const exportedFilenameRef = useRef<string | null>(null);
  const downloadedRef = useRef(false);

  const handleExport = async () => {
    exportedFilenameRef.current = filename;
    downloadedRef.current = false;
    const result = await exportMutation.mutateAsync(filename);
    setActiveJobId(result.jobId);
  };

  const isExporting =
    activeJobId && job && job.status !== "completed" && job.status !== "failed";

  useEffect(() => {
    if (
      job?.status === "completed" &&
      exportedFilenameRef.current &&
      !downloadedRef.current
    ) {
      downloadedRef.current = true;
      const a = document.createElement("a");
      a.href = `/media/projects/${projectId}/exports/${exportedFilenameRef.current}`;
      a.download = exportedFilenameRef.current;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  }, [job?.status, projectId]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#2a2a2a",
          borderRadius: "8px",
          padding: "20px",
          minWidth: "400px",
          maxWidth: "500px",
          color: "#ccc",
        }}
      >
        <h3 style={{ margin: "0 0 16px", color: "#fff" }}>Export</h3>

        {/* Filename */}
        <label style={{ display: "block", marginBottom: "4px", fontSize: "12px", color: "#888" }}>
          Filename
        </label>
        <input
          type="text"
          value={filename}
          onChange={(e) => setFilename(e.target.value)}
          style={{
            width: "100%",
            padding: "6px 8px",
            background: "#333",
            color: "#fff",
            border: "1px solid #555",
            borderRadius: "4px",
            fontSize: "13px",
            marginBottom: "12px",
            boxSizing: "border-box",
          }}
        />

        {/* Export button */}
        <button
          onClick={handleExport}
          disabled={!!isExporting || exportMutation.isPending}
          style={{
            width: "100%",
            padding: "8px",
            background: isExporting ? "#555" : "#3a6ad4",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: isExporting ? "default" : "pointer",
            fontSize: "14px",
            marginBottom: "12px",
          }}
        >
          {isExporting ? "Exporting..." : "Start Export"}
        </button>

        {/* Progress */}
        {activeJobId && job && (
          <div style={{ marginBottom: "12px" }}>
            <JobProgress job={job} />
            {job.status === "completed" && (
              <div style={{ color: "#4a4", marginTop: "4px", fontSize: "12px" }}>
                Export completed! Downloading...
              </div>
            )}
            {job.status === "failed" && (
              <div style={{ color: "#f44", marginTop: "4px", fontSize: "12px" }}>
                Export failed: {job.error}
              </div>
            )}
          </div>
        )}

        {/* Close */}
        <button
          onClick={onClose}
          style={{
            width: "100%",
            padding: "6px",
            background: "none",
            color: "#888",
            border: "1px solid #555",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "12px",
            marginTop: "8px",
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}
