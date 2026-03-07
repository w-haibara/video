import { describe, test, expect } from "bun:test";
import { resolveWorkspacePath, projectDir, assetsDir, proxyDir, thumbnailDir, projectJsonPath } from "./paths";

describe("paths", () => {
  test("resolveWorkspacePath returns absolute path within workspace", () => {
    const p = resolveWorkspacePath("projects", "abc", "assets");
    expect(p).toContain("workspace/projects/abc/assets");
  });

  test("resolveWorkspacePath throws on path traversal with ..", () => {
    expect(() => resolveWorkspacePath("../etc/passwd")).toThrow("Path traversal");
  });

  test("resolveWorkspacePath throws on nested path traversal", () => {
    expect(() => resolveWorkspacePath("projects", "..", "..", "etc")).toThrow("Path traversal");
  });

  test("projectDir returns correct path", () => {
    expect(projectDir("test-id")).toContain("workspace/projects/test-id");
  });

  test("projectJsonPath returns correct path", () => {
    expect(projectJsonPath("test-id")).toContain("workspace/projects/test-id/project.json");
  });

  test("assetsDir returns correct path", () => {
    expect(assetsDir("test-id")).toContain("workspace/projects/test-id/assets");
  });

  test("proxyDir returns correct path", () => {
    expect(proxyDir("test-id")).toContain("workspace/projects/test-id/proxy");
  });

  test("thumbnailDir returns correct path", () => {
    expect(thumbnailDir("test-id")).toContain("workspace/projects/test-id/thumbnails");
  });
});
