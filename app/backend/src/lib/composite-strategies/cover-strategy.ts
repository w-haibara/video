import type { ExportCompositeStrategy } from "../composite-strategy-registry";

export const coverExportStrategy: ExportCompositeStrategy = {
  id: "cover",
  buildOverlayFilter(bottomLabel: string, topLabel: string, enable: string, position?: string): string {
    const pos = position ?? "0:0";
    return `${bottomLabel}${topLabel}overlay=${pos}:enable='${enable}'`;
  },
};
