import type { Job } from "@video/shared";
import { theme } from "../theme";

type Props = { job: Job };

export function JobProgress({ job }: Props) {
  const percent = Math.round(job.progress * 100);
  return (
    <div>
      <div
        style={{
          height: "3px",
          background: theme.bgHover,
          borderRadius: "2px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${percent}%`,
            background: job.status === "failed" ? theme.error : theme.primary,
            transition: "width 0.3s ease",
          }}
        />
      </div>
      <div style={{ fontSize: "10px", color: theme.textMuted, marginTop: "2px" }}>
        {job.status === "processing" ? `${percent}%` : job.status}
      </div>
    </div>
  );
}
