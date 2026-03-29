import { describe, expect, it, beforeAll, afterAll } from "bun:test";
import { buildP5jsHtml, p5jsPrepareStep } from "./p5js-prepare";
import type { PipelineContext } from "../types";
import type { Asset } from "@video/shared";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

const SAMPLE_SKETCH = `function setup() {
  // user setup
}

function draw() {
  background(0);
  fill(255);
  ellipse(mouseX, mouseY, 50, 50);
}`;

describe("buildP5jsHtml", () => {
  it("includes the sketch code", () => {
    const html = buildP5jsHtml(SAMPLE_SKETCH, 800, 600);
    expect(html).toContain("background(0)");
    expect(html).toContain("ellipse(mouseX, mouseY, 50, 50)");
  });

  it("includes createCanvas with correct dimensions", () => {
    const html = buildP5jsHtml(SAMPLE_SKETCH, 1280, 720);
    expect(html).toContain("createCanvas(1280, 720)");
  });

  it("includes the __ready and __renderFrame APIs", () => {
    const html = buildP5jsHtml(SAMPLE_SKETCH, 800, 600);
    expect(html).toContain("window.__ready = true");
    expect(html).toContain("window.__renderFrame = function(frameIndex)");
  });

  it("references p5.min.js", () => {
    const html = buildP5jsHtml(SAMPLE_SKETCH, 800, 600);
    expect(html).toContain("p5.min.js");
  });

  it("calls noLoop() for frame-by-frame control", () => {
    const html = buildP5jsHtml(SAMPLE_SKETCH, 800, 600);
    expect(html).toContain("noLoop()");
  });
});

describe("p5jsPrepareStep.canHandle", () => {
  const makeCtx = (kind: string): PipelineContext => ({
    asset: { id: "a1", kind, originalPath: "sketch.js" },
    projectDir: "/tmp",
    projectId: "p1",
    shared: new Map(),
    reportProgress: () => {},
  });

  it("returns true for p5js assets", () => {
    expect(p5jsPrepareStep.canHandle(makeCtx("p5js"))).toBe(true);
  });

  it("returns false for video assets", () => {
    expect(p5jsPrepareStep.canHandle(makeCtx("video"))).toBe(false);
  });

  it("returns false for image assets", () => {
    expect(p5jsPrepareStep.canHandle(makeCtx("image"))).toBe(false);
  });
});

describe("p5jsPrepareStep.execute", () => {
  let tmpDir: string;

  beforeAll(async () => {
    tmpDir = await mkdtemp(join(tmpdir(), "p5js-test-"));
    await writeFile(join(tmpDir, "sketch.js"), SAMPLE_SKETCH);
  });

  afterAll(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  it("sets webRenderHtml and webRenderSettings in shared context", async () => {
    const shared = new Map<string, unknown>();
    const asset: Asset = {
      id: "test-asset",
      kind: "p5js",
      originalPath: "sketch.js",
      durationMs: 3000,
    };
    const ctx: PipelineContext = {
      asset,
      projectDir: tmpDir,
      projectId: "test-project",
      shared,
      reportProgress: () => {},
    };

    await p5jsPrepareStep.execute(ctx);

    expect(shared.has("webRenderHtml")).toBe(true);
    expect(shared.has("webRenderSettings")).toBe(true);

    const html = shared.get("webRenderHtml") as string;
    expect(html).toContain(SAMPLE_SKETCH);
    expect(html).toContain("createCanvas(1920, 1080)");

    const settings = shared.get("webRenderSettings") as {
      width: number;
      height: number;
      fps: number;
      durationMs: number;
    };
    expect(settings.width).toBe(1920);
    expect(settings.height).toBe(1080);
    expect(settings.fps).toBe(30);
    expect(settings.durationMs).toBe(3000);
  });

  it("uses shared context values when provided", async () => {
    const shared = new Map<string, unknown>([
      ["canvasWidth", 640],
      ["canvasHeight", 480],
      ["fps", 24],
      ["durationMs", 10000],
    ]);
    const asset: Asset = {
      id: "test-asset-2",
      kind: "p5js",
      originalPath: "sketch.js",
    };
    const ctx: PipelineContext = {
      asset,
      projectDir: tmpDir,
      projectId: "test-project",
      shared,
      reportProgress: () => {},
    };

    await p5jsPrepareStep.execute(ctx);

    const html = shared.get("webRenderHtml") as string;
    expect(html).toContain("createCanvas(640, 480)");

    const settings = shared.get("webRenderSettings") as {
      width: number;
      height: number;
      fps: number;
      durationMs: number;
    };
    expect(settings.width).toBe(640);
    expect(settings.height).toBe(480);
    expect(settings.fps).toBe(24);
    expect(settings.durationMs).toBe(10000);
  });
});
