import type { CSSProperties } from "react";

export type PreviewCompositeStrategy = {
  id: string;
  label: string;
  containerStyle(ctx: { canvasW: number; canvasH: number }): CSSProperties;
};

export class CompositeStrategyRegistry {
  private strategies = new Map<string, PreviewCompositeStrategy>();

  register(strategy: PreviewCompositeStrategy): void {
    this.strategies.set(strategy.id, strategy);
  }

  get(id: string): PreviewCompositeStrategy | undefined {
    return this.strategies.get(id);
  }

  all(): PreviewCompositeStrategy[] {
    return Array.from(this.strategies.values());
  }
}

export const compositeStrategyRegistry = new CompositeStrategyRegistry();
