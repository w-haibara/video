import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { app } from "../app";

let tmpDir: string;

beforeAll(async () => {
  tmpDir = await mkdtemp(path.join(tmpdir(), "video-routes-test-"));
  process.env.WORKSPACE_DIR = tmpDir;
});

afterAll(async () => {
  delete process.env.WORKSPACE_DIR;
  await rm(tmpDir, { recursive: true, force: true });
});

describe("routes/projects", () => {
  test("POST /api/projects creates project", async () => {
    const res = await app.request("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "test project" }),
    });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.id).toBeDefined();
    expect(body.name).toBe("test project");
  });

  test("GET /api/projects returns list", async () => {
    const res = await app.request("/api/projects");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.projects).toBeInstanceOf(Array);
    expect(body.projects.length).toBeGreaterThan(0);
  });

  test("GET /api/projects/:id returns project", async () => {
    const createRes = await app.request("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "get test" }),
    });
    const created = await createRes.json();

    const res = await app.request(`/api/projects/${created.id}`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.name).toBe("get test");
  });

  test("PUT /api/projects/:id updates project", async () => {
    const createRes = await app.request("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "before update" }),
    });
    const created = await createRes.json();

    const res = await app.request(`/api/projects/${created.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "after update" }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.name).toBe("after update");
  });

  test("DELETE /api/projects/:id deletes project", async () => {
    const createRes = await app.request("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "to delete" }),
    });
    const created = await createRes.json();

    const res = await app.request(`/api/projects/${created.id}`, {
      method: "DELETE",
    });
    expect(res.status).toBe(204);
  });

  test("GET /api/projects/:id returns 500 for unknown", async () => {
    const res = await app.request("/api/projects/nonexistent");
    expect(res.status).toBe(500);
  });

  test("GET /api/health returns ok", async () => {
    const res = await app.request("/api/health");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
  });
});
