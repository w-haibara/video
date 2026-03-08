import type { Project } from "./project";
import type { Asset } from "./asset";
import type { Job } from "./job";

// --- Projects ---
export type CreateProjectRequest = {
  name: string;
};

export type CreateProjectResponse = Project;

export type ListProjectsResponse = {
  projects: Project[];
};

export type GetProjectResponse = Project;

export type UpdateProjectRequest = Partial<Pick<Project, "name" | "sequence" | "settings">>;

export type UpdateProjectResponse = Project;

// --- Assets ---
// Import は query params (projectId, filename) + raw body stream
export type ImportAssetResponse = {
  asset: Asset;
  jobId: string;
};

// --- Jobs ---
export type GetJobResponse = Job;
