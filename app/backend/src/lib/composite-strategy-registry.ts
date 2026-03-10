export type ExportCompositeStrategy = {
  id: string;
  buildOverlayFilter(bottomLabel: string, topLabel: string, enable: string): string;
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
