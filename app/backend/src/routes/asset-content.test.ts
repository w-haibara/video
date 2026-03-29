import { describe, test, expect, beforeAll, afterAll, beforeEach } from "bun:test";
import { mkdtemp, rm, mkdir, writeFile, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { app } from "../app";
import { _reset as resetJobQueue } from "../services/job-queue";

let tmpDir: string;
let projectId: string;
let assetId: string;

beforeAll(async () => {
  tmpDir = await mkdtemp(path.join(tmpdir(), "video-asset-content-test-"));
  process.env.WORKSPACE_DIR = tmpDir;
});

afterAll(async () => {
  delete process.env.WORKSPACE_DIR;
  await rm(tmpDir, { recursive: true, force: true });
});

beforeEach(() => {
  resetJobQueue();
});

async function createProjectWithP5jsAsset(): Promise<{ projectId: string; assetId: string }> {
  // Create project
  const createRes = await app.request("/api/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "p5js-test" }),
  });
  const project = await createRes.json();
  const pid = project.id as string;

  // Import a p5.js asset
  const sketchCode = 'function setup() { createCanvas(400, 400); }\nfunction draw() { background(220); }';
  const importRes = await app.request(
    `/api/assets/import?projectId=${pid}&filename=sketch.p5.js`,
    {
      method: "POST",
      headers: { "Content-Type": "application/octet-stream" },
      body: sketchCode,
    },
  );
  const importBody = await importRes.json();
  return { projectId: pid, assetId: importBody.asset.id as string };
}

describe("routes/asset-content", () => {
  test("GET /api/projects/:id/assets/:assetId/content reads file content", async () => {
    const { projectId: pid, assetId: aid } = await createProjectWithP5jsAsset();

    const res = await app.request(`/api/projects/${pid}/assets/${aid}/content`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.content).toContain("createCanvas");
  });

  test("GET content returns 404 for unknown asset", async () => {
    const { projectId: pid } = await createProjectWithP5jsAsset();

    const res = await app.request(`/api/projects/${pid}/assets/nonexistent/content`);
    expect(res.status).toBe(404);
  });

  test("PUT /api/projects/:id/assets/:assetId/content writes file content", async () => {
    const { projectId: pid, assetId: aid } = await createProjectWithP5jsAsset();

    const newCode = 'function setup() { createCanvas(800, 600); }';
    const res = await app.request(`/api/projects/${pid}/assets/${aid}/content`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newCode }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);

    // Verify it was written
    const readRes = await app.request(`/api/projects/${pid}/assets/${aid}/content`);
    const readBody = await readRes.json();
    expect(readBody.content).toBe(newCode);
  });

  test("PUT content returns 404 for unknown asset", async () => {
    const { projectId: pid } = await createProjectWithP5jsAsset();

    const res = await app.request(`/api/projects/${pid}/assets/nonexistent/content`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: "test" }),
    });
    expect(res.status).toBe(404);
  });

  test("POST /api/projects/:id/assets/:assetId/reprocess enqueues job", async () => {
    const { projectId: pid, assetId: aid } = await createProjectWithP5jsAsset();

    const res = await app.request(`/api/projects/${pid}/assets/${aid}/reprocess`, {
      method: "POST",
    });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.jobId).toBeDefined();
    expect(typeof body.jobId).toBe("string");
  });

  test("POST reprocess returns 404 for unknown asset", async () => {
    const { projectId: pid } = await createProjectWithP5jsAsset();

    const res = await app.request(`/api/projects/${pid}/assets/nonexistent/reprocess`, {
      method: "POST",
    });
    expect(res.status).toBe(404);
  });
});
