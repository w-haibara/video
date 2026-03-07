import { describe, test, expect, beforeAll, afterAll, beforeEach } from "bun:test";
import { mkdtemp, rm, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { app } from "../app";
import { _reset, getJob } from "../services/job-queue";

let tmpDir: string;
let projectId: string;

beforeAll(async () => {
  tmpDir = await mkdtemp(path.join(tmpdir(), "video-exports-test-"));
  process.env.WORKSPACE_DIR = tmpDir;

  // Create a project with a video clip
  const createRes = await app.request("/api/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "export test" }),
  });
  const created = await createRes.json();
  projectId = created.id;

  // Add a dummy asset file
  const assetsPath = path.join(tmpDir, "projects", projectId, "assets");
  await mkdir(assetsPath, { recursive: true });
  await writeFile(path.join(assetsPath, "dummy.mp4"), "fake video");

  // Update project with a video clip
  await app.request(`/api/projects/${projectId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      assets: [
        { id: "v1", kind: "video", originalPath: "assets/dummy.mp4", durationMs: 5000, hasAudio: false },
      ],
      sequence: {
        tracks: [
          {
            id: "t1",
            kind: "video",
            clips: [
              { id: "c1", assetId: "v1", startMs: 0, durationMs: 5000, inMs: 0, outMs: 5000 },
            ],
          },
        ],
      },
    }),
  });
});

afterAll(async () => {
  delete process.env.WORKSPACE_DIR;
  await rm(tmpDir, { recursive: true, force: true });
});

beforeEach(() => _reset());

describe("routes/exports", () => {
  test("GET /api/projects/:id/exports returns export list", async () => {
    const res = await app.request(`/api/projects/${projectId}/exports`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty("exports");
    expect(Array.isArray(body.exports)).toBe(true);
  });

  test("POST /api/projects/:id/export starts export job", async () => {
    const res = await app.request(`/api/projects/${projectId}/export`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename: "test-export.mp4" }),
    });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body).toHaveProperty("jobId");
    expect(typeof body.jobId).toBe("string");
  });

  test("POST /api/projects/:id/export uses default filename", async () => {
    const res = await app.request(`/api/projects/${projectId}/export`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body).toHaveProperty("jobId");
  });

  test("export job is trackable via job queue", async () => {
    const res = await app.request(`/api/projects/${projectId}/export`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename: "track-test.mp4" }),
    });
    const { jobId } = await res.json();
    const job = getJob(jobId);
    expect(job).toBeTruthy();
    expect(job!.projectId).toBe(projectId);
  });
});
