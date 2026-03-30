import type { PipelineContext } from "../pipeline/types";

export type GenerativeAssetHandler = {
  assetKind: string;
  defaultDurationMs?: number;
  prepare: (ctx: PipelineContext) => Promise<void>;
};

export class GenerativeAssetHandlerRegistry {
  private handlers = new Map<string, GenerativeAssetHandler>();

  register(handler: GenerativeAssetHandler): void {
    this.handlers.set(handler.assetKind, handler);
  }

  get(assetKind: string): GenerativeAssetHandler | undefined {
    return this.handlers.get(assetKind);
  }

  has(assetKind: string): boolean {
    return this.handlers.has(assetKind);
  }
}

export const generativeAssetHandlerRegistry =
  new GenerativeAssetHandlerRegistry();
