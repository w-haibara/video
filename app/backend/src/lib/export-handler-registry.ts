import type { Project, Clip, Asset, ExportPreset } from "@video/shared";

export type ExportBuildContext = {
  project: Project;
  preset: ExportPreset;
  assetsBase: string;
  inputArgs: string[];
  filterParts: string[];
  inputIndex: number;
  clipInputIndices: Map<string, number>;
  clipHasTransform: Map<string, boolean>;
  resolveAssetVideoPath: (asset: Asset) => string;
};

export type ExportClipHandler = {
  assetKind: string;
  buildInput: (clip: Clip, asset: Asset, ctx: ExportBuildContext) => void;
};

export type ExportOverlayHandler = {
  clipKind: string;
  buildOverlay: (clips: Clip[], ctx: ExportBuildContext, videoOutLabel: string) => string;
};

export type ExportAudioHandler = {
  clipKind: string;
  buildAudio: (clips: Clip[], ctx: ExportBuildContext, videoClips: Clip[]) => string;
};

export class ExportHandlerRegistry {
  private clipHandlers: ExportClipHandler[] = [];
  private overlayHandlers: ExportOverlayHandler[] = [];
  private audioHandlers: ExportAudioHandler[] = [];

  registerClipHandler(handler: ExportClipHandler): void {
    this.clipHandlers.push(handler);
  }

  registerOverlayHandler(handler: ExportOverlayHandler): void {
    this.overlayHandlers.push(handler);
  }

  registerAudioHandler(handler: ExportAudioHandler): void {
    this.audioHandlers.push(handler);
  }

  getClipHandler(assetKind: string): ExportClipHandler | undefined {
    return this.clipHandlers.find((h) => h.assetKind === assetKind);
  }

  hasClipHandler(assetKind: string): boolean {
    return this.clipHandlers.some((h) => h.assetKind === assetKind);
  }

  getOverlayHandlers(): ExportOverlayHandler[] {
    return [...this.overlayHandlers];
  }

  getAudioHandlers(): ExportAudioHandler[] {
    return [...this.audioHandlers];
  }
}

export const exportHandlerRegistry = new ExportHandlerRegistry();
