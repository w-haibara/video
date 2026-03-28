import path from "node:path";

export function getWorkspaceRoot(): string {
  return path.resolve(process.env.WORKSPACE_DIR ?? "workspace");
}

/**
 * Resolve path segments under a base directory. Returns null if the result escapes the base.
 */
export function resolveUnder(base: string, ...parts: string[]): string | null {
  const resolved = path.resolve(base, ...parts);
  if (resolved === base || resolved.startsWith(base + path.sep)) return resolved;
  return null;
}

export function resolveWorkspacePath(...segments: string[]): string {
  const root = getWorkspaceRoot();
  const resolved = resolveUnder(root, ...segments);
  if (resolved === null) {
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
