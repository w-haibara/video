export type CompositeContext = {
  overlayIdx: number;
  canvasW: number;
  canvasH: number;
  totalDurationSec: number;
  fps: number;
};

export type ExportCompositeStrategy = {
  id: string;
  buildOverlayFilter(bottomLabel: string, topLabel: string, enable: string, position?: string, ctx?: CompositeContext): string;
};

export class CompositeStrategyRegistry {
  private strategies = new Map<string, ExportCompositeStrategy>();

  register(strategy: ExportCompositeStrategy): void {
    this.strategies.set(strategy.id, strategy);
  }

  get(id: string): ExportCompositeStrategy | undefined {
    return this.strategies.get(id);
  }

  all(): ExportCompositeStrategy[] {
    return Array.from(this.strategies.values());
  }
}

export const exportCompositeStrategyRegistry = new CompositeStrategyRegistry();
