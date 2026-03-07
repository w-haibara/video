import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../api/client";
import type { Job } from "@video/shared";
import { JOB_POLL_INTERVAL_MS } from "@video/shared";

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
  pending: "#fa0",
  processing: "#4af",
  completed: "#4a4",
  failed: "#f44",
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
        color: "#ccc",
        background: "#1a1a1a",
        minHeight: "100vh",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <h2 style={{ margin: 0, color: "#fff" }}>Job Log</h2>
        <Link
          to={`/projects/${id}`}
          style={{ color: "#4a7fff", textDecoration: "none", fontSize: "14px" }}
        >
          Back to Editor
        </Link>
      </div>

      {isLoading && <div>Loading...</div>}
      {error && <div style={{ color: "#f44" }}>Error: {error.message}</div>}

      {data && data.jobs.length === 0 && (
        <div style={{ color: "#666" }}>No jobs yet.</div>
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
            <tr style={{ borderBottom: "2px solid #444" }}>
              <th style={{ textAlign: "left", padding: "8px 4px", color: "#888" }}>ID</th>
              <th style={{ textAlign: "left", padding: "8px 4px", color: "#888" }}>Asset</th>
              <th style={{ textAlign: "left", padding: "8px 4px", color: "#888" }}>Status</th>
              <th style={{ textAlign: "left", padding: "8px 4px", color: "#888" }}>Progress</th>
              <th style={{ textAlign: "left", padding: "8px 4px", color: "#888" }}>Updated</th>
              <th style={{ textAlign: "left", padding: "8px 4px", color: "#888" }}>Error</th>
            </tr>
          </thead>
          <tbody>
            {[...data.jobs].reverse().map((job) => (
              <tr key={job.id} style={{ borderBottom: "1px solid #333" }}>
                <td style={{ padding: "6px 4px", fontFamily: "monospace", fontSize: "11px" }}>
                  {job.id.slice(0, 8)}
                </td>
                <td style={{ padding: "6px 4px" }}>
                  {job.assetId === "export" ? "export" : job.assetId.slice(0, 8)}
                </td>
                <td style={{ padding: "6px 4px" }}>
                  <span
                    style={{
                      color: STATUS_COLOR[job.status] ?? "#ccc",
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
                      : "—"}
                </td>
                <td style={{ padding: "6px 4px", fontSize: "11px" }}>
                  {new Date(job.updatedAt).toLocaleTimeString()}
                </td>
                <td
                  style={{
                    padding: "6px 4px",
                    color: "#f44",
                    fontSize: "11px",
                    maxWidth: "200px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title={job.error}
                >
                  {job.error ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
