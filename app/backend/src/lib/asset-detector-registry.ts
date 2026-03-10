export type AssetDetectionContext = {
  filename: string;
  extension: string;
  filePath?: string;
};

export type AssetDetector = {
  name: string;
  priority: number;
  detect: (ctx: AssetDetectionContext) => string | null;
};

export class AssetDetectorRegistry {
  private detectors: AssetDetector[] = [];

  register(detector: AssetDetector): void {
    this.detectors.push(detector);
  }

  detect(ctx: AssetDetectionContext): string {
    const sorted = [...this.detectors].sort((a, b) => b.priority - a.priority);
    for (const detector of sorted) {
      const result = detector.detect(ctx);
      if (result !== null) return result;
    }
    return "image";
  }
}

export const assetDetectorRegistry = new AssetDetectorRegistry();
