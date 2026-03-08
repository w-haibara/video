import type { Project } from "@video/shared";
import { generateId, DEFAULT_PROJECT_DURATION_MS } from "@video/shared";
import {
  projectDir,
  projectJsonPath,
  assetsDir,
  proxyDir,
  thumbnailDir,
  resolveWorkspacePath,
} from "../utils/paths";
import { mkdir, readdir, readFile, writeFile, rm } from "node:fs/promises";

export async function createProject(name: string): Promise<Project> {
  const id = generateId();
  const now = new Date().toISOString();
  const project: Project = {
    id,
    name,
    createdAt: now,
    updatedAt: now,
    assets: [],
    sequence: { tracks: [] },
    settings: { durationMs: DEFAULT_PROJECT_DURATION_MS },
  };
  await mkdir(projectDir(id), { recursive: true });
  await mkdir(assetsDir(id), { recursive: true });
  await mkdir(proxyDir(id), { recursive: true });
  await mkdir(thumbnailDir(id), { recursive: true });
  await writeFile(projectJsonPath(id), JSON.stringify(project, null, 2));
  return project;
}

export async function getProject(id: string): Promise<Project> {
  const data = await readFile(projectJsonPath(id), "utf-8");
  return JSON.parse(data) as Project;
}

export async function listProjects(): Promise<Project[]> {
  const projectsRoot = resolveWorkspacePath("projects");
  await mkdir(projectsRoot, { recursive: true });
  const entries = await readdir(projectsRoot, { withFileTypes: true });
  const projects: Project[] = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    try {
      const project = await getProject(entry.name);
      projects.push(project);
    } catch {
      // skip directories without valid project.json
    }
  }
  return projects;
}

export async function updateProject(
  id: string,
  updates: Partial<Pick<Project, "name" | "sequence" | "settings">>,
): Promise<Project> {
  const project = await getProject(id);
  if (updates.name !== undefined) project.name = updates.name;
  if (updates.sequence !== undefined) project.sequence = updates.sequence;
  if (updates.settings !== undefined) project.settings = updates.settings;
  project.updatedAt = new Date().toISOString();
  await writeFile(projectJsonPath(id), JSON.stringify(project, null, 2));
  return project;
}

export async function deleteProject(id: string): Promise<void> {
  await rm(projectDir(id), { recursive: true, force: true });
}

export async function saveProject(project: Project): Promise<void> {
  project.updatedAt = new Date().toISOString();
  await writeFile(projectJsonPath(project.id), JSON.stringify(project, null, 2));
}
