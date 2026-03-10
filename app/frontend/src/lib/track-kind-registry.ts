import { theme } from "../theme";

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

// Register built-in track kinds
trackKindRegistry.register({
  kind: "video",
  label: "V",
  clipColor: theme.clipVideo,
  clipSelectedColor: theme.clipVideoSelect,
  hasSourceTrim: true,
  hasAsset: true,
});

trackKindRegistry.register({
  kind: "audio",
  label: "A",
  clipColor: theme.clipAudio,
  clipSelectedColor: theme.clipAudioSelect,
  hasSourceTrim: true,
  hasAsset: true,
});

trackKindRegistry.register({
  kind: "title",
  label: "T",
  clipColor: theme.clipText,
  clipSelectedColor: theme.clipTextSelect,
  hasSourceTrim: false,
  hasAsset: false,
});
