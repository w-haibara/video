import path from "node:path";

export function getWorkspaceRoot(): string {
  return path.resolve(process.env.WORKSPACE_DIR ?? "workspace");
}

export function resolveWorkspacePath(...segments: string[]): string {
  const root = getWorkspaceRoot();
  const resolved = path.resolve(root, ...segments);
  if (!resolved.startsWith(root + path.sep) && resolved !== root) {
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
  return resolveWorkspacePath("projects", projectId, "proxies");
}

export function thumbnailDir(projectId: string): string {
  return resolveWorkspacePath("projects", projectId, "thumbnails");
}

export function exportDir(projectId: string): string {
  return resolveWorkspacePath("projects", projectId, "exports");
}

/** @deprecated Use getWorkspaceRoot() instead */
export const WORKSPACE_ROOT = getWorkspaceRoot();
