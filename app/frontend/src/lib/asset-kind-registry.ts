import { DEFAULT_IMAGE_DURATION_MS } from "@video/shared";

export type AssetKindDescriptor = {
  kind: string;
  label: string;
  extensions: string[];
  mimePatterns: string[];
  defaultTrackKind: string;
  hasDuration: boolean;
  defaultDurationMs?: number;
};

export class AssetKindRegistry {
  private descriptors = new Map<string, AssetKindDescriptor>();

  register(descriptor: AssetKindDescriptor): void {
    this.descriptors.set(descriptor.kind, descriptor);
  }

  get(kind: string): AssetKindDescriptor | undefined {
    return this.descriptors.get(kind);
  }

  detectByExtension(ext: string): AssetKindDescriptor | undefined {
    const lower = ext.toLowerCase();
    for (const desc of this.descriptors.values()) {
      if (desc.extensions.includes(lower)) return desc;
    }
    return undefined;
  }

  all(): AssetKindDescriptor[] {
    return Array.from(this.descriptors.values());
  }
}

export const assetKindRegistry = new AssetKindRegistry();

// Register built-in asset kinds
assetKindRegistry.register({
  kind: "video",
  label: "Video",
  extensions: [".mp4", ".mov", ".avi", ".mkv", ".webm"],
  mimePatterns: ["video/*"],
  defaultTrackKind: "video",
  hasDuration: true,
});

assetKindRegistry.register({
  kind: "image",
  label: "Image",
  extensions: [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp", ".heic", ".tiff", ".svg"],
  mimePatterns: ["image/*"],
  defaultTrackKind: "video",
  hasDuration: false,
  defaultDurationMs: DEFAULT_IMAGE_DURATION_MS,
});

assetKindRegistry.register({
  kind: "audio",
  label: "Audio",
  extensions: [".mp3", ".wav", ".aac", ".m4a", ".ogg", ".flac"],
  mimePatterns: ["audio/*"],
  defaultTrackKind: "audio",
  hasDuration: true,
});
