import type { GenerativeAssetHandler } from "../generative-asset-handler-registry";
import { buildP5jsHtml } from "../../pipeline/steps/p5js-prepare";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const p5jsHandler: GenerativeAssetHandler = {
  assetKind: "p5js",
  defaultDurationMs: 5000,

  async prepare(ctx) {
    // Read the sketch code from the source file (originalPath always points to the source)
    const sketchPath = join(ctx.projectDir, ctx.asset.originalPath);
    const sketchCode = await readFile(sketchPath, "utf-8");

    // Get project dimensions (from shared context or defaults)
    const width = (ctx.shared.get("canvasWidth") as number) ?? 1920;
    const height = (ctx.shared.get("canvasHeight") as number) ?? 1080;
    const fps = (ctx.shared.get("fps") as number) ?? 30;
    const durationMs =
      (ctx.shared.get("durationMs") as number) ??
      ctx.asset.durationMs ??
      5000;

    const html = buildP5jsHtml(sketchCode, width, height);

    ctx.shared.set("webRenderHtml", html);
    ctx.shared.set("webRenderSettings", {
      width,
      height,
      fps,
      durationMs,
    });
  },
};
