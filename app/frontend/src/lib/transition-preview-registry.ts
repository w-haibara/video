import type { CSSProperties } from "react";

export type TransitionPreviewHandler = {
  type: string;
  label: string;
  computeIncomingStyle: (progress: number) => CSSProperties;
  computeOutgoingStyle?: (progress: number) => CSSProperties;
};

export class TransitionPreviewRegistry {
  private handlers = new Map<string, TransitionPreviewHandler>();

  register(handler: TransitionPreviewHandler): void {
    this.handlers.set(handler.type, handler);
  }

  get(type: string): TransitionPreviewHandler | undefined {
    return this.handlers.get(type);
  }

  all(): TransitionPreviewHandler[] {
    return Array.from(this.handlers.values());
  }
}

export const transitionPreviewRegistry = new TransitionPreviewRegistry();
