import { useEffect, useRef } from "react";
import type { Asset } from "@video/shared";
import { useJob, useRetryJob } from "../api/jobs";
import { JobProgress } from "./JobProgress";

type Props = {
  asset: Asset;
  projectId: string;
  jobId: string | null;
  onAddToTimeline?: (asset: Asset) => void;
  onDelete?: (assetId: string) => void;
  isInUse?: boolean;
  onJobComplete?: () => void;
};

export function AssetThumbnail({ asset, projectId, jobId, onAddToTimeline, onDelete, isInUse, onJobComplete }: Props) {
  const { data: job } = useJob(jobId);
  const retryJob = useRetryJob();

  const thumbnailUrl = asset.thumbnailPath
    ? `/media/projects/${projectId}/thumbnails/${asset.thumbnailPath.split("/").pop()}`
    : undefined;

  const isProcessing =
    job && job.status !== "completed" && job.status !== "failed";

  // Asset is ready when it has a thumbnail (or is audio with durationMs)
  const isAssetReady = asset.kind === "audio"
    ? asset.durationMs != null
    : !!asset.thumbnailPath;

  // Disable add button when job is running or asset metadata not yet available
  const addDisabled = isProcessing || (!isAssetReady && !!jobId);

  // Notify parent when job completes so project data is refetched
  const prevStatusRef = useRef(job?.status);
  useEffect(() => {
    if (prevStatusRef.current !== "completed" && job?.status === "completed") {
      onJobComplete?.();
    }
    prevStatusRef.current = job?.status;
  }, [job?.status, onJobComplete]);

  return (
    <div
      style={{
        position: "relative",
        aspectRatio: "16/9",
        background: "#333",
        borderRadius: "4px",
        overflow: "hidden",
      }}
    >
      {thumbnailUrl ? (
        <img
          src={thumbnailUrl}
          alt={asset.originalPath}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            color: "#666",
            fontSize: "12px",
          }}
        >
          {isProcessing ? "Processing..." : asset.kind}
        </div>
      )}
      {isProcessing && job && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            background: "rgba(0,0,0,0.7)",
            padding: "4px",
          }}
        >
          <JobProgress job={job} />
        </div>
      )}
      {!isProcessing && job?.status !== "failed" && (
        <div style={{ position: "absolute", top: "2px", right: "2px", display: "flex", gap: "2px" }}>
          {onDelete && !isInUse && (
            <button
              onClick={() => onDelete(asset.id)}
              style={{
                background: "rgba(0,0,0,0.7)",
                border: "none",
                color: "#f66",
                fontSize: "14px",
                width: "22px",
                height: "22px",
                borderRadius: "3px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 0,
              }}
              title="Delete asset"
            >
              ×
            </button>
          )}
          {onAddToTimeline && (
            <button
              onClick={() => !addDisabled && onAddToTimeline(asset)}
              disabled={addDisabled}
              style={{
                background: "rgba(0,0,0,0.7)",
                border: "none",
                color: "#fff",
                fontSize: "14px",
                width: "22px",
                height: "22px",
                borderRadius: "3px",
                cursor: addDisabled ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 0,
                opacity: addDisabled ? 0.4 : 1,
              }}
              title={addDisabled ? "Processing..." : "Add to timeline"}
            >
              +
            </button>
          )}
        </div>
      )}
      {job?.status === "failed" && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(200,0,0,0.5)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "4px",
            color: "#fff",
            fontSize: "12px",
          }}
          title={job.error ?? "Import failed"}
        >
          <span>Failed</span>
          <div style={{ display: "flex", gap: "4px" }}>
            <button
              onClick={() => retryJob.mutate(job.id)}
              disabled={retryJob.isPending}
              style={{
                background: "rgba(255,255,255,0.2)",
                border: "1px solid rgba(255,255,255,0.5)",
                color: "#fff",
                fontSize: "10px",
                padding: "2px 8px",
                borderRadius: "3px",
                cursor: "pointer",
              }}
            >
              {retryJob.isPending ? "..." : "Retry"}
            </button>
            {onDelete && (
              <button
                onClick={() => onDelete(asset.id)}
                style={{
                  background: "rgba(255,255,255,0.2)",
                  border: "1px solid rgba(255,255,255,0.5)",
                  color: "#f66",
                  fontSize: "10px",
                  padding: "2px 8px",
                  borderRadius: "3px",
                  cursor: "pointer",
                }}
              >
                Delete
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
