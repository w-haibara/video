export type TrackKindDescriptor = {
  kind: string;
  label: string;
  clipColor: string;
  clipSelectedColor: string;
  hasSourceTrim: boolean;
  hasAsset: boolean;
};

export class TrackKindRegistry {
  private descriptors = new Map<string, TrackKindDescriptor>();

  register(descriptor: TrackKindDescriptor): void {
    this.descriptors.set(descriptor.kind, descriptor);
  }

  get(kind: string): TrackKindDescriptor | undefined {
    return this.descriptors.get(kind);
  }

  all(): TrackKindDescriptor[] {
    return Array.from(this.descriptors.values());
  }
}

export const trackKindRegistry = new TrackKindRegistry();
