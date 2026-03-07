export type JobStatus = "pending" | "processing" | "completed" | "failed";

export type Job = {
  id: string;
  projectId: string;
  assetId: string;
  status: JobStatus;
  progress: number; // 0.0 - 1.0
  error?: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
};
