import type { ExportCompositeStrategy } from "../composite-strategy-registry";

export const coverExportStrategy: ExportCompositeStrategy = {
  id: "cover",
  buildOverlayFilter(bottomLabel: string, topLabel: string, enable: string): string {
    return `${bottomLabel}${topLabel}overlay=0:0:enable='${enable}'`;
  },
};
