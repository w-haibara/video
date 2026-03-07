import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { mkdtemp, rm, readdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  createProject,
  getProject,
  listProjects,
  updateProject,
  deleteProject,
} from "./project-service";
import { projectDir } from "../utils/paths";

let tmpDir: string;

beforeEach(async () => {
  tmpDir = await mkdtemp(path.join(tmpdir(), "video-test-"));
  process.env.WORKSPACE_DIR = tmpDir;
});

afterEach(async () => {
  delete process.env.WORKSPACE_DIR;
  await rm(tmpDir, { recursive: true, force: true });
});

describe("project-service", () => {
  test("createProject creates directory and project.json", async () => {
    const project = await createProject("Test Project");
    expect(project.name).toBe("Test Project");
    expect(project.id).toBeDefined();
    expect(project.assets).toEqual([]);
    expect(project.sequence).toEqual({ tracks: [] });

    const dir = projectDir(project.id);
    const entries = await readdir(dir);
    expect(entries).toContain("project.json");
    expect(entries).toContain("assets");
    expect(entries).toContain("proxies");
    expect(entries).toContain("thumbnails");
  });

  test("getProject reads project.json", async () => {
    const created = await createProject("Read Test");
    const fetched = await getProject(created.id);
    expect(fetched.id).toBe(created.id);
    expect(fetched.name).toBe("Read Test");
  });

  test("listProjects returns all projects", async () => {
    await createProject("Project A");
    await createProject("Project B");
    const list = await listProjects();
    expect(list.length).toBe(2);
    const names = list.map((p) => p.name).sort();
    expect(names).toEqual(["Project A", "Project B"]);
  });

  test("updateProject updates name and updatedAt", async () => {
    const created = await createProject("Original");
    const updated = await updateProject(created.id, { name: "Updated" });
    expect(updated.name).toBe("Updated");
    expect(updated.updatedAt).not.toBe(created.updatedAt);
  });

  test("deleteProject removes directory", async () => {
    const project = await createProject("To Delete");
    await deleteProject(project.id);
    const dir = projectDir(project.id);
    const exists = await Bun.file(path.join(dir, "project.json")).exists();
    expect(exists).toBe(false);
  });
});
