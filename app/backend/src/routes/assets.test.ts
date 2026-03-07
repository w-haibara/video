import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { app } from "../app";

let tmpDir: string;

beforeAll(async () => {
  tmpDir = await mkdtemp(path.join(tmpdir(), "video-assets-test-"));
  process.env.WORKSPACE_DIR = tmpDir;
});

afterAll(async () => {
  delete process.env.WORKSPACE_DIR;
  await rm(tmpDir, { recursive: true, force: true });
});

describe("routes/assets", () => {
  test("POST /api/assets/import returns 400 without params", async () => {
    const res = await app.request("/api/assets/import", {
      method: "POST",
    });
    expect(res.status).toBe(400);
  });

  test("POST /api/assets/import creates asset and job", async () => {
    // Create project first
    const createRes = await app.request("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "import test" }),
    });
    const project = await createRes.json();

    const res = await app.request(
      `/api/assets/import?projectId=${project.id}&filename=test.jpg`,
      {
        method: "POST",
        headers: { "Content-Type": "application/octet-stream" },
        body: "fake-image-data",
      },
    );
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.asset.id).toBeDefined();
    expect(body.asset.kind).toBe("image");
    expect(body.jobId).toBeDefined();
  });
});
