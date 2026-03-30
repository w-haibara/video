import { describe, test, expect, beforeEach, afterAll } from "bun:test";
import { mkdtemp, rm, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { RenderCacheManager } from "./render-cache-manager";

let tmpDir: string;
let manager: RenderCacheManager;

beforeEach(async () => {
  tmpDir = await mkdtemp(path.join(tmpdir(), "render-cache-test-"));
  manager = new RenderCacheManager(tmpDir);
});

afterAll(async () => {
  if (tmpDir) {
    await rm(tmpDir, { recursive: true, force: true });
  }
});

describe("RenderCacheManager", () => {
  test("loadManifest creates empty manifest when file missing", async () => {
    await manager.loadManifest();
    expect(manager.getSync("nonexistent")).toBeNull();
  });

  test("loadManifest reads existing manifest", async () => {
    const manifestDir = path.join(tmpDir, "render-cache");
    await mkdir(manifestDir, { recursive: true });
    const manifest = {
      version: 1,
      entries: {
        asset1: {
          assetId: "asset1",
          sourceHash: "abc123",
          renderedPath: "/path/to/rendered.mp4",
          proxyPath: "render-cache/asset1/proxy.mp4",
          thumbnailPath: "render-cache/asset1/thumbnail.jpg",
          width: 1920,
          height: 1080,
          durationMs: 5000,
          createdAt: "2026-01-01T00:00:00Z",
        },
      },
    };
    await writeFile(
      path.join(manifestDir, "manifest.json"),
      JSON.stringify(manifest),
    );

    await manager.loadManifest();
    const entry = manager.getSync("asset1");
    expect(entry).not.toBeNull();
    expect(entry!.sourceHash).toBe("abc123");
    expect(entry!.width).toBe(1920);
  });

  test("hashFile returns SHA-256 hex string", async () => {
    const filePath = path.join(tmpDir, "test.txt");
    await writeFile(filePath, "hello world");
    const hash = await manager.hashFile(filePath);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  test("hashFile returns different hashes for different content", async () => {
    const file1 = path.join(tmpDir, "file1.txt");
    const file2 = path.join(tmpDir, "file2.txt");
    await writeFile(file1, "content A");
    await writeFile(file2, "content B");
    const hash1 = await manager.hashFile(file1);
    const hash2 = await manager.hashFile(file2);
    expect(hash1).not.toBe(hash2);
  });

  test("get returns null when no entry exists", async () => {
    const result = await manager.get("nonexistent", "somehash");
    expect(result).toBeNull();
  });

  test("get returns null when hash does not match", async () => {
    await manager.commitRender({
      assetId: "a1",
      sourceHash: "hash1",
      renderedPath: "/path/rendered.mp4",
      proxyPath: "render-cache/a1/proxy.mp4",
      thumbnailPath: "render-cache/a1/thumbnail.jpg",
      width: 1920,
      height: 1080,
      durationMs: 5000,
      createdAt: "2026-01-01T00:00:00Z",
    });

    const result = await manager.get("a1", "wrong-hash");
    expect(result).toBeNull();
  });

  test("get returns entry when hash matches", async () => {
    await manager.commitRender({
      assetId: "a1",
      sourceHash: "hash1",
      renderedPath: "/path/rendered.mp4",
      proxyPath: "render-cache/a1/proxy.mp4",
      thumbnailPath: "render-cache/a1/thumbnail.jpg",
      width: 1920,
      height: 1080,
      durationMs: 5000,
      createdAt: "2026-01-01T00:00:00Z",
    });

    const result = await manager.get("a1", "hash1");
    expect(result).not.toBeNull();
    expect(result!.assetId).toBe("a1");
  });

  test("getSync returns entry from loaded manifest", async () => {
    await manager.commitRender({
      assetId: "a1",
      sourceHash: "hash1",
      renderedPath: "/path/rendered.mp4",
      proxyPath: "render-cache/a1/proxy.mp4",
      thumbnailPath: "render-cache/a1/thumbnail.jpg",
      width: 1920,
      height: 1080,
      durationMs: 5000,
      createdAt: "2026-01-01T00:00:00Z",
    });

    const result = manager.getSync("a1");
    expect(result).not.toBeNull();
    expect(result!.sourceHash).toBe("hash1");
  });

  test("getOrNull returns entry when source unchanged", async () => {
    const filePath = path.join(tmpDir, "sketch.p5.js");
    await writeFile(filePath, "function setup() {}");
    const hash = await manager.hashFile(filePath);

    await manager.commitRender({
      assetId: "a1",
      sourceHash: hash,
      renderedPath: "/path/rendered.mp4",
      proxyPath: "render-cache/a1/proxy.mp4",
      thumbnailPath: "render-cache/a1/thumbnail.jpg",
      width: 1920,
      height: 1080,
      durationMs: 5000,
      createdAt: "2026-01-01T00:00:00Z",
    });

    const result = await manager.getOrNull("a1", filePath);
    expect(result).not.toBeNull();
  });

  test("getOrNull returns null when source changed", async () => {
    const filePath = path.join(tmpDir, "sketch.p5.js");
    await writeFile(filePath, "function setup() {}");

    await manager.commitRender({
      assetId: "a1",
      sourceHash: "old-hash",
      renderedPath: "/path/rendered.mp4",
      proxyPath: "render-cache/a1/proxy.mp4",
      thumbnailPath: "render-cache/a1/thumbnail.jpg",
      width: 1920,
      height: 1080,
      durationMs: 5000,
      createdAt: "2026-01-01T00:00:00Z",
    });

    const result = await manager.getOrNull("a1", filePath);
    expect(result).toBeNull();
  });

  test("commitRender persists entry to manifest file", async () => {
    await manager.commitRender({
      assetId: "a1",
      sourceHash: "hash1",
      renderedPath: "/path/rendered.mp4",
      proxyPath: "render-cache/a1/proxy.mp4",
      thumbnailPath: "render-cache/a1/thumbnail.jpg",
      width: 1920,
      height: 1080,
      durationMs: 5000,
      createdAt: "2026-01-01T00:00:00Z",
    });

    // Create new manager reading the same dir
    const manager2 = new RenderCacheManager(tmpDir);
    await manager2.loadManifest();
    const entry = manager2.getSync("a1");
    expect(entry).not.toBeNull();
    expect(entry!.sourceHash).toBe("hash1");
  });

  test("invalidate removes entry and cache directory", async () => {
    // Create cache dir with a file
    const cacheDir = path.join(tmpDir, "render-cache", "a1");
    await mkdir(cacheDir, { recursive: true });
    await writeFile(path.join(cacheDir, "rendered.mp4"), "fake video data");

    await manager.commitRender({
      assetId: "a1",
      sourceHash: "hash1",
      renderedPath: path.join(cacheDir, "rendered.mp4"),
      proxyPath: "render-cache/a1/proxy.mp4",
      thumbnailPath: "render-cache/a1/thumbnail.jpg",
      width: 1920,
      height: 1080,
      durationMs: 5000,
      createdAt: "2026-01-01T00:00:00Z",
    });

    expect(manager.getSync("a1")).not.toBeNull();
    await manager.invalidate("a1");
    expect(manager.getSync("a1")).toBeNull();
  });

  test("renderedMp4Path returns correct absolute path", () => {
    const result = manager.renderedMp4Path("asset1");
    expect(result).toBe(
      path.join(tmpDir, "render-cache", "asset1", "rendered.mp4"),
    );
  });

  test("relativeProxyPath returns project-relative path", () => {
    expect(manager.relativeProxyPath("a1")).toBe(
      "render-cache/a1/proxy.mp4",
    );
  });

  test("relativeThumbnailPath returns project-relative path", () => {
    expect(manager.relativeThumbnailPath("a1")).toBe(
      "render-cache/a1/thumbnail.jpg",
    );
  });

  test("absoluteProxyPath returns absolute path", () => {
    expect(manager.absoluteProxyPath("a1")).toBe(
      path.join(tmpDir, "render-cache", "a1", "proxy.mp4"),
    );
  });

  test("absoluteThumbnailPath returns absolute path", () => {
    expect(manager.absoluteThumbnailPath("a1")).toBe(
      path.join(tmpDir, "render-cache", "a1", "thumbnail.jpg"),
    );
  });

  test("multiple entries can coexist", async () => {
    await manager.commitRender({
      assetId: "a1",
      sourceHash: "hash1",
      renderedPath: "/path/a1/rendered.mp4",
      proxyPath: "render-cache/a1/proxy.mp4",
      thumbnailPath: "render-cache/a1/thumbnail.jpg",
      width: 1920,
      height: 1080,
      durationMs: 5000,
      createdAt: "2026-01-01T00:00:00Z",
    });
    await manager.commitRender({
      assetId: "a2",
      sourceHash: "hash2",
      renderedPath: "/path/a2/rendered.mp4",
      proxyPath: "render-cache/a2/proxy.mp4",
      thumbnailPath: "render-cache/a2/thumbnail.jpg",
      width: 1280,
      height: 720,
      durationMs: 3000,
      createdAt: "2026-01-01T00:00:00Z",
    });

    expect(manager.getSync("a1")!.sourceHash).toBe("hash1");
    expect(manager.getSync("a2")!.sourceHash).toBe("hash2");
  });

  test("invalidate of nonexistent asset does not throw", async () => {
    await expect(manager.invalidate("nonexistent")).resolves.toBeUndefined();
  });
});
