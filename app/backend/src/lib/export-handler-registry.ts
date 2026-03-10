import type { Project, Clip, Asset, ExportPreset } from "@video/shared";

export type ExportBuildContext = {
  project: Project;
  preset: ExportPreset;
  assetsBase: string;
  inputArgs: string[];
  filterParts: string[];
  inputIndex: number;
};

export type ExportClipHandler = {
  assetKind: string;
  buildInput: (clip: Clip, asset: Asset, ctx: ExportBuildContext) => void;
};

export type ExportOverlayHandler = {
  trackKind: string;
  buildOverlay: (clips: Clip[], ctx: ExportBuildContext, videoOutLabel: string) => string;
};

export type ExportAudioHandler = {
  trackKind: string;
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

  getOverlayHandlers(): ExportOverlayHandler[] {
    return [...this.overlayHandlers];
  }

  getAudioHandlers(): ExportAudioHandler[] {
    return [...this.audioHandlers];
  }
}

export const exportHandlerRegistry = new ExportHandlerRegistry();
