import { describe, test, expect, beforeEach } from "bun:test";
import { enqueue, getJob, _reset } from "../services/job-queue";

beforeEach(() => _reset());

describe("routes/jobs", () => {
  const getApp = async () => (await import("../app")).app;

  test("GET /api/jobs/:id returns job", async () => {
    const app = await getApp();
    const job = enqueue("p1", "a1", async () => {});
    const res = await app.request(`/api/jobs/${job.id}`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.id).toBe(job.id);
  });

  test("GET /api/jobs/:id returns 404 for unknown", async () => {
    const app = await getApp();
    const res = await app.request("/api/jobs/nonexistent");
    expect(res.status).toBe(404);
  });

  test("POST /api/jobs/:id/retry retries failed job", async () => {
    const app = await getApp();
    const job = enqueue("p1", "a1", async () => {
      throw new Error("fail");
    });
    await new Promise((r) => setTimeout(r, 50));
    expect(getJob(job.id)?.status).toBe("failed");

    const res = await app.request(`/api/jobs/${job.id}/retry`, {
      method: "POST",
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(["pending", "processing", "completed"]).toContain(body.status);
  });

  test("POST /api/jobs/:id/retry returns 400 for non-failed job", async () => {
    const app = await getApp();
    const job = enqueue("p1", "a1", async () => {});
    await new Promise((r) => setTimeout(r, 50));

    const res = await app.request(`/api/jobs/${job.id}/retry`, {
      method: "POST",
    });
    expect(res.status).toBe(400);
  });
});
