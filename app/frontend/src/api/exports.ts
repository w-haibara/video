import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "./client";

type ExportResponse = { jobId: string };

export function useExport(projectId: string) {
  return useMutation({
    mutationFn: (filename: string) =>
      apiFetch<ExportResponse>(`/api/projects/${projectId}/export`, {
        method: "POST",
        body: JSON.stringify({ filename }),
      }),
  });
}
