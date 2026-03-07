import { Hono } from "hono";
import { getJob, getJobsByProject, retry } from "../services/job-queue";

const jobsRouter = new Hono();

jobsRouter.get("/by-project/:projectId", (c) => {
  const jobs = getJobsByProject(c.req.param("projectId"));
  return c.json({ jobs });
});

jobsRouter.get("/:id", (c) => {
  const job = getJob(c.req.param("id"));
  if (!job) return c.json({ error: "Job not found" }, 404);
  return c.json(job);
});

jobsRouter.post("/:id/retry", (c) => {
  try {
    const job = retry(c.req.param("id"));
    return c.json(job);
  } catch (err) {
    return c.json({ error: (err as Error).message }, 400);
  }
});

export { jobsRouter };
