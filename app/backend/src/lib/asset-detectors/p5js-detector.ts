import type { AssetDetector, AssetDetectionContext } from "../asset-detector-registry";

/**
 * Detect p5.js sketch files by the `.p5.js` filename suffix.
 * Higher priority than extension-detector so `.p5.js` files are not
 * misidentified as generic JS files.
 */
export const p5jsDetector: AssetDetector = {
  name: "p5js",
  priority: 10,
  detect: (ctx: AssetDetectionContext): string | null => {
    if (ctx.filename.endsWith(".p5.js")) return "p5js";
    return null;
  },
};
