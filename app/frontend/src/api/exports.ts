import { useQuery, useMutation } from "@tanstack/react-query";
import { apiFetch } from "./client";

type ExportResponse = { jobId: string };
type ExportFile = { filename: string; path: string };
type ExportListResponse = { exports: ExportFile[] };

export function useExport(projectId: string) {
  return useMutation({
    mutationFn: (filename: string) =>
      apiFetch<ExportResponse>(`/api/projects/${projectId}/export`, {
        method: "POST",
        body: JSON.stringify({ filename }),
      }),
  });
}

export function useExports(projectId: string) {
  return useQuery({
    queryKey: ["exports", projectId],
    queryFn: () =>
      apiFetch<ExportListResponse>(`/api/projects/${projectId}/exports`),
  });
}
