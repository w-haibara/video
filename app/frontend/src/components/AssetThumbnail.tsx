import type { Asset } from "@video/shared";
import { useJob } from "../api/jobs";
import { JobProgress } from "./JobProgress";

type Props = {
  asset: Asset;
  projectId: string;
  jobId: string | null;
  onAddToTimeline?: (asset: Asset) => void;
};

export function AssetThumbnail({ asset, projectId, jobId, onAddToTimeline }: Props) {
  const { data: job } = useJob(jobId);

  const thumbnailUrl = asset.thumbnailPath
    ? `/media/projects/${projectId}/thumbnails/${asset.thumbnailPath.split("/").pop()}`
    : undefined;

  const isProcessing =
    job && job.status !== "completed" && job.status !== "failed";

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
          {asset.kind}
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
      {!isProcessing && job?.status !== "failed" && onAddToTimeline && (
        <button
          onClick={() => onAddToTimeline(asset)}
          style={{
            position: "absolute",
            top: "2px",
            right: "2px",
            background: "rgba(0,0,0,0.7)",
            border: "none",
            color: "#fff",
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
          title="Add to timeline"
        >
          +
        </button>
      )}
      {job?.status === "failed" && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(200,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: "12px",
          }}
        >
          Failed
        </div>
      )}
    </div>
  );
}
