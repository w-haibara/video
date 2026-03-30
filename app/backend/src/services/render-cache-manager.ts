import { createHash } from "node:crypto";
import { readFile, writeFile, mkdir, rm } from "node:fs/promises";
import path from "node:path";

export type RenderCacheEntry = {
  assetId: string;
  sourceHash: string;
  renderedPath: string;
  proxyPath: string;
  thumbnailPath: string;
  width: number;
  height: number;
  durationMs: number;
  createdAt: string;
};

export type RenderCacheManifest = {
  version: 1;
  entries: Record<string, RenderCacheEntry>;
};

export class RenderCacheManager {
  private manifest: RenderCacheManifest | null = null;
  private readonly manifestPath: string;

  constructor(private readonly projectDir: string) {
    this.manifestPath = path.join(
      projectDir,
      "render-cache",
      "manifest.json",
    );
  }

  async loadManifest(): Promise<void> {
    try {
      const data = await readFile(this.manifestPath, "utf-8");
      this.manifest = JSON.parse(data) as RenderCacheManifest;
    } catch {
      this.manifest = { version: 1, entries: {} };
    }
  }

  private ensureManifest(): RenderCacheManifest {
    if (!this.manifest) {
      this.manifest = { version: 1, entries: {} };
    }
    return this.manifest;
  }

  async hashFile(filePath: string): Promise<string> {
    const data = await readFile(filePath);
    return createHash("sha256").update(data).digest("hex");
  }

  async get(
    assetId: string,
    sourceHash: string,
  ): Promise<RenderCacheEntry | null> {
    const manifest = this.ensureManifest();
    const entry = manifest.entries[assetId];
    if (!entry) return null;
    if (entry.sourceHash !== sourceHash) return null;
    return entry;
  }

  getSync(assetId: string): RenderCacheEntry | null {
    const manifest = this.ensureManifest();
    return manifest.entries[assetId] ?? null;
  }

  async getOrNull(
    assetId: string,
    sourceFilePath: string,
  ): Promise<RenderCacheEntry | null> {
    const hash = await this.hashFile(sourceFilePath);
    return this.get(assetId, hash);
  }

  async commitRender(entry: RenderCacheEntry): Promise<void> {
    const manifest = this.ensureManifest();
    manifest.entries[entry.assetId] = entry;
    await this.saveManifest();
  }

  async invalidate(assetId: string): Promise<void> {
    const manifest = this.ensureManifest();
    delete manifest.entries[assetId];
    await this.saveManifest();

    // Delete cache files for this asset
    const cacheDir = path.join(this.projectDir, "render-cache", assetId);
    await rm(cacheDir, { recursive: true, force: true }).catch(() => {});
  }

  renderedMp4Path(assetId: string): string {
    return path.join(
      this.projectDir,
      "render-cache",
      assetId,
      "rendered.mp4",
    );
  }

  relativeProxyPath(assetId: string): string {
    return `render-cache/${assetId}/proxy.mp4`;
  }

  relativeThumbnailPath(assetId: string): string {
    return `render-cache/${assetId}/thumbnail.jpg`;
  }

  absoluteProxyPath(assetId: string): string {
    return path.join(this.projectDir, this.relativeProxyPath(assetId));
  }

  absoluteThumbnailPath(assetId: string): string {
    return path.join(this.projectDir, this.relativeThumbnailPath(assetId));
  }

  private async saveManifest(): Promise<void> {
    const dir = path.dirname(this.manifestPath);
    await mkdir(dir, { recursive: true });
    await writeFile(
      this.manifestPath,
      JSON.stringify(this.ensureManifest(), null, 2),
    );
  }
}
