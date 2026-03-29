import type { PipelineStep } from "../types";
import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";

const P5_MIN_JS_PATH = resolve(import.meta.dir, "../../../vendor/p5.min.js");

export function buildP5jsHtml(
  sketchCode: string,
  width: number,
  height: number,
): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>html,body{margin:0;padding:0;overflow:hidden;}</style>
</head>
<body>
<script src="file://${P5_MIN_JS_PATH}"></script>
<script>
// User sketch code
${sketchCode}

// Rendering control API for web-render step
(function() {
  var _origSetup = typeof setup === 'function' ? setup : function() {};
  var _origDraw = typeof draw === 'function' ? draw : function() {};

  window.setup = function() {
    createCanvas(${width}, ${height});
    _origSetup();
    noLoop();
    window.__ready = true;
  };

  window.__renderFrame = function(frameIndex) {
    // Advance to the target frame by calling draw
    _origDraw();
  };
})();
</script>
</body>
</html>`;
}

export const p5jsPrepareStep: PipelineStep = {
  name: "p5js-prepare",

  canHandle: (ctx) => ctx.asset.kind === "p5js",

  async execute(ctx) {
    // Read the sketch code from the source file (not the rendered MP4)
    const sketchPath = join(ctx.projectDir, ctx.asset.sourcePath ?? ctx.asset.originalPath);
    const sketchCode = await readFile(sketchPath, "utf-8");

    // Get project dimensions (from shared context or defaults)
    const width = (ctx.shared.get("canvasWidth") as number) ?? 1920;
    const height = (ctx.shared.get("canvasHeight") as number) ?? 1080;
    const fps = (ctx.shared.get("fps") as number) ?? 30;
    const durationMs =
      (ctx.shared.get("durationMs") as number) ?? ctx.asset.durationMs ?? 5000;

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
