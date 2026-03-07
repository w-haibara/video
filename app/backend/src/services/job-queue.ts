import type { Job } from "@video/shared";
import { generateId } from "@video/shared";

type JobTask = (job: Job) => Promise<void>;

const jobs = new Map<string, Job>();
const tasks = new Map<string, JobTask>();
const queue: string[] = [];
let running = false;

export function enqueue(
  projectId: string,
  assetId: string,
  task: JobTask,
): Job {
  const now = new Date().toISOString();
  const job: Job = {
    id: generateId(),
    projectId,
    assetId,
    status: "pending",
    progress: 0,
    createdAt: now,
    updatedAt: now,
  };
  jobs.set(job.id, job);
  tasks.set(job.id, task);
  queue.push(job.id);
  drain();
  return job;
}

export function getJob(id: string): Job | undefined {
  return jobs.get(id);
}

export function getJobsByProject(projectId: string): Job[] {
  return [...jobs.values()].filter((j) => j.projectId === projectId);
}

export function retry(id: string): Job {
  const job = jobs.get(id);
  if (!job) throw new Error(`Job not found: ${id}`);
  if (job.status !== "failed") throw new Error(`Job is not failed: ${id}`);
  job.status = "pending";
  job.progress = 0;
  job.error = undefined;
  job.updatedAt = new Date().toISOString();
  queue.push(id);
  drain();
  return job;
}

async function drain(): Promise<void> {
  if (running) return;
  running = true;
  try {
    while (queue.length > 0) {
      const jobId = queue.shift()!;
      const job = jobs.get(jobId);
      const task = tasks.get(jobId);
      if (!job || !task) continue;

      job.status = "processing";
      job.updatedAt = new Date().toISOString();

      try {
        await task(job);
        job.status = "completed";
        job.progress = 1;
      } catch (err) {
        job.status = "failed";
        job.error = err instanceof Error ? err.message : String(err);
      }
      job.updatedAt = new Date().toISOString();
    }
  } finally {
    running = false;
  }
}

export function _reset(): void {
  jobs.clear();
  tasks.clear();
  queue.length = 0;
  running = false;
}
