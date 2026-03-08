import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../api/client";
import type { Job } from "@video/shared";
import { JOB_POLL_INTERVAL_MS } from "@video/shared";
import { theme } from "../theme";

type JobListResponse = { jobs: Job[] };

function useProjectJobs(projectId: string) {
  return useQuery({
    queryKey: ["jobs", "by-project", projectId],
    queryFn: () =>
      apiFetch<JobListResponse>(`/api/jobs/by-project/${projectId}`),
    refetchInterval: (query) => {
      const jobs = query.state.data?.jobs;
      if (jobs?.some((j) => j.status === "pending" || j.status === "processing")) {
        return JOB_POLL_INTERVAL_MS;
      }
      return false;
    },
  });
}

const STATUS_COLOR: Record<string, string> = {
  pending: theme.warning,
  processing: theme.primary,
  completed: theme.success,
  failed: theme.error,
};

export function JobLogPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useProjectJobs(id!);

  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "0 auto",
        padding: "20px",
        color: theme.text,
        background: theme.bg,
        minHeight: "100vh",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <h2 style={{ margin: 0 }}>Job Log</h2>
        <Link
          to={`/projects/${id}`}
          style={{ color: theme.primary, textDecoration: "none", fontSize: "14px" }}
        >
          Back to Editor
        </Link>
      </div>

      {isLoading && <div>Loading...</div>}
      {error && <div style={{ color: theme.error }}>Error: {error.message}</div>}

      {data && data.jobs.length === 0 && (
        <div style={{ color: theme.textMuted }}>No jobs yet.</div>
      )}

      {data && data.jobs.length > 0 && (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "13px",
          }}
        >
          <thead>
            <tr style={{ borderBottom: `2px solid ${theme.border}` }}>
              <th style={{ textAlign: "left", padding: "8px 4px", color: theme.textMuted }}>ID</th>
              <th style={{ textAlign: "left", padding: "8px 4px", color: theme.textMuted }}>Asset</th>
              <th style={{ textAlign: "left", padding: "8px 4px", color: theme.textMuted }}>Status</th>
              <th style={{ textAlign: "left", padding: "8px 4px", color: theme.textMuted }}>Progress</th>
              <th style={{ textAlign: "left", padding: "8px 4px", color: theme.textMuted }}>Updated</th>
              <th style={{ textAlign: "left", padding: "8px 4px", color: theme.textMuted }}>Error</th>
            </tr>
          </thead>
          <tbody>
            {[...data.jobs].reverse().map((job) => (
              <tr key={job.id} style={{ borderBottom: `1px solid ${theme.borderLight}` }}>
                <td style={{ padding: "6px 4px", fontFamily: "monospace", fontSize: "11px" }}>
                  {job.id.slice(0, 8)}
                </td>
                <td style={{ padding: "6px 4px" }}>
                  {job.assetId === "export" ? "export" : job.assetId.slice(0, 8)}
                </td>
                <td style={{ padding: "6px 4px" }}>
                  <span
                    style={{
                      color: STATUS_COLOR[job.status] ?? theme.text,
                      fontWeight: "bold",
                    }}
                  >
                    {job.status}
                  </span>
                </td>
                <td style={{ padding: "6px 4px" }}>
                  {job.status === "processing"
                    ? `${Math.round(job.progress * 100)}%`
                    : job.status === "completed"
                      ? "100%"
                      : "\u2014"}
                </td>
                <td style={{ padding: "6px 4px", fontSize: "11px" }}>
                  {new Date(job.updatedAt).toLocaleTimeString()}
                </td>
                <td
                  style={{
                    padding: "6px 4px",
                    color: theme.error,
                    fontSize: "11px",
                    maxWidth: "200px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title={job.error}
                >
                  {job.error ?? "\u2014"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
