import path from "node:path";

const WORKSPACE_ROOT = path.resolve("workspace");

export function resolveWorkspacePath(...segments: string[]): string {
  const resolved = path.resolve(WORKSPACE_ROOT, ...segments);
  if (!resolved.startsWith(WORKSPACE_ROOT + path.sep) && resolved !== WORKSPACE_ROOT) {
    throw new Error(`Path traversal detected: ${segments.join("/")}`);
  }
  return resolved;
}

export function projectDir(projectId: string): string {
  return resolveWorkspacePath("projects", projectId);
}

export function projectJsonPath(projectId: string): string {
  return resolveWorkspacePath("projects", projectId, "project.json");
}

export function assetsDir(projectId: string): string {
  return resolveWorkspacePath("projects", projectId, "assets");
}

export function proxyDir(projectId: string): string {
  return resolveWorkspacePath("projects", projectId, "proxy");
}

export function thumbnailDir(projectId: string): string {
  return resolveWorkspacePath("projects", projectId, "thumbnails");
}

export { WORKSPACE_ROOT };
