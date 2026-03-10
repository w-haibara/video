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
