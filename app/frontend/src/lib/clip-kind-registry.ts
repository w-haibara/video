export type ClipKindDescriptor = {
  kind: string;
  label: string;
  clipColor: string;
  clipSelectedColor: string;
  hasSourceTrim: boolean;
  hasAsset: boolean;
};

export class ClipKindRegistry {
  private descriptors = new Map<string, ClipKindDescriptor>();

  register(descriptor: ClipKindDescriptor): void {
    this.descriptors.set(descriptor.kind, descriptor);
  }

  get(kind: string): ClipKindDescriptor | undefined {
    return this.descriptors.get(kind);
  }

  all(): ClipKindDescriptor[] {
    return Array.from(this.descriptors.values());
  }
}

export const clipKindRegistry = new ClipKindRegistry();
