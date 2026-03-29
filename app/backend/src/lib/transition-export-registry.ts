export type TransitionExportHandler = {
  type: string;
  /** Build FFmpeg filter for the incoming clip's fade-in effect. Returns filter string or empty. */
  buildFadeIn?: (inputLabel: string, outLabel: string, ptsOffset: number, fadeDur: number) => string;
  /** Build FFmpeg filter for the outgoing clip's fade-out effect. Returns filter string or empty. */
  buildFadeOut?: (inputLabel: string, outLabel: string, fadeOutStart: number, fadeDur: number) => string;
  /** Build overlay position expression for time-dependent slide. Returns position string or undefined (use default). */
  buildOverlayPosition?: (startSec: number, fadeDur: number, preset: { width: number; height: number }) => string;
};

export class TransitionExportRegistry {
  private handlers = new Map<string, TransitionExportHandler>();

  register(handler: TransitionExportHandler): void {
    this.handlers.set(handler.type, handler);
  }

  get(type: string): TransitionExportHandler | undefined {
    return this.handlers.get(type);
  }

  all(): TransitionExportHandler[] {
    return Array.from(this.handlers.values());
  }
}

export const transitionExportRegistry = new TransitionExportRegistry();
