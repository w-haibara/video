import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "./client";
import type { GetJobResponse } from "@video/shared";
import { JOB_POLL_INTERVAL_MS } from "@video/shared";

export function useJob(jobId: string | null) {
  return useQuery({
    queryKey: ["jobs", jobId],
    queryFn: () => apiFetch<GetJobResponse>(`/api/jobs/${jobId}`),
    enabled: !!jobId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === "completed" || status === "failed") return false;
      return JOB_POLL_INTERVAL_MS;
    },
  });
}
