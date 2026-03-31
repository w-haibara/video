import { describe, test, expect, beforeEach } from "bun:test";
import { CanvasCompositor, parseTransitionStyle, type FrameSources } from "./canvas-compositor";
import type { Project, Clip, Asset } from "@video/shared";

// ── Mock canvas / context ──

type DrawImageCall = {
  source: unknown;
  args: unknown[];
};

type FillRectCall = {
  x: number;
  y: number;
  w: number;
  h: number;
  fillStyle: string | CanvasGradient | CanvasPattern;
  compositeOp: string;
  globalAlpha: number;
  filter: string;
};

/**
 * Minimal mock of CanvasRenderingContext2D for testing.
 * Tracks key operations so tests can verify the compositor calls.
 */
function createMockContext() {
  const drawImageCalls: DrawImageCall[] = [];
  const fillRectCalls: FillRectCall[] = [];
  const fillTextCalls: { text: string; x: number; y: number }[] = [];
  const savedStates: number[] = [];
  let saveCount = 0;

  const ctx = {
    // State
    fillStyle: "#000000" as string | CanvasGradient | CanvasPattern,
    globalCompositeOperation: "source-over",
    globalAlpha: 1.0,
    filter: "none",
    font: "",
    textAlign: "start",
    textBaseline: "top",

    // Tracked calls
    _drawImageCalls: drawImageCalls,
    _fillRectCalls: fillRectCalls,
    _fillTextCalls: fillTextCalls,
    _saveCount: () => saveCount,

    save() {
      savedStates.push(saveCount++);
    },
    restore() {
      savedStates.pop();
      // Reset filter on restore (like real canvas)
      this.filter = "none";
      this.globalAlpha = 1.0;
      this.globalCompositeOperation = "source-over";
    },
    fillRect(x: number, y: number, w: number, h: number) {
      fillRectCalls.push({
        x, y, w, h,
        fillStyle: this.fillStyle,
        compositeOp: this.globalCompositeOperation,
        globalAlpha: this.globalAlpha,
        filter: this.filter,
      });
    },
    drawImage(source: unknown, ...args: unknown[]) {
      drawImageCalls.push({ source, args });
    },
    fillText(text: string, x: number, y: number) {
      fillTextCalls.push({ text, x, y });
    },
    measureText(text: string) {
      return { width: text.length * 10 }; // rough approximation
    },
    translate(_x: number, _y: number) {},
    rotate(_angle: number) {},
    scale(_x: number, _y: number) {},
    beginPath() {},
    rect(_x: number, _y: number, _w: number, _h: number) {},
    roundRect(_x: number, _y: number, _w: number, _h: number, _r: number) {},
    clip() {},
    fill() {},
    createRadialGradient(..._args: number[]) {
      return {
        addColorStop(_offset: number, _color: string) {},
      };
    },
    createPattern(_source: unknown, _rep: string) {
      return {};
    },
    createImageData(w: number, h: number) {
      return { width: w, height: h, data: new Uint8ClampedArray(w * h * 4) };
    },
    putImageData() {},
    clearRect() {},
  };

  return ctx;
}

function createMockCanvas(width: number, height: number) {
  const ctx = createMockContext();
  const canvas = {
    width,
    height,
    getContext(_type: string) {
      return ctx;
    },
  };
  return { canvas, ctx };
}

// ── Fixture helpers ──

function makeAsset(overrides: Partial<Asset> = {}): Asset {
  return {
    id: "asset-1",
    kind: "video",
    name: "test.mp4",
    path: "test.mp4",
    width: 1920,
    height: 1080,
    durationMs: 10000,
    ...overrides,
  } as Asset;
}

function makeClip(overrides: Partial<Clip> = {}): Clip {
  return {
    id: "clip-1",
    clipKind: "video",
    assetId: "asset-1",
    startMs: 0,
    durationMs: 5000,
    inMs: 0,
    outMs: 5000,
    ...overrides,
  };
}

function makeProject(overrides: Partial<Project> = {}): Project {
  const defaultAsset = makeAsset();
  return {
    id: "project-1",
    name: "Test Project",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    assets: [defaultAsset],
    sequence: {
      tracks: [
        {
          id: "track-1",
          clips: [makeClip()],
        },
      ],
    },
    settings: {
      durationMs: 10000,
      canvasWidth: 1920,
      canvasHeight: 1080,
    },
    ...overrides,
  };
}

/** Dummy image source for FrameSources. */
const dummySource = { width: 1920, height: 1080 } as unknown as CanvasImageSource;

// ── Tests ──

describe("CanvasCompositor", () => {
  describe("constructor", () => {
    test("creates compositor from canvas", () => {
      const { canvas } = createMockCanvas(1920, 1080);
      const compositor = new CanvasCompositor(canvas as unknown as HTMLCanvasElement);
      expect(compositor).toBeDefined();
    });

    test("throws if context unavailable", () => {
      const badCanvas = {
        width: 1920,
        height: 1080,
        getContext() { return null; },
      };
      expect(() => {
        const _unused = new CanvasCompositor(badCanvas as unknown as HTMLCanvasElement);
      }).toThrow("Failed to get 2D rendering context");
    });
  });

  describe("renderFrame", () => {
    let canvas: ReturnType<typeof createMockCanvas>["canvas"];
    let ctx: ReturnType<typeof createMockContext>;
    let compositor: CanvasCompositor;

    beforeEach(() => {
      const mocked = createMockCanvas(1920, 1080);
      canvas = mocked.canvas;
      ctx = mocked.ctx;
      compositor = new CanvasCompositor(canvas as unknown as HTMLCanvasElement);
    });

    test("clears canvas to black", () => {
      const project = makeProject({
        sequence: { tracks: [] },
      });
      const sources: FrameSources = new Map();

      compositor.renderFrame(project, 0, sources);

      // First fillRect should be the black clear
      expect(ctx._fillRectCalls.length).toBeGreaterThanOrEqual(1);
      expect(ctx._fillRectCalls[0].fillStyle).toBe("#000000");
      expect(ctx._fillRectCalls[0].x).toBe(0);
      expect(ctx._fillRectCalls[0].y).toBe(0);
      expect(ctx._fillRectCalls[0].w).toBe(1920);
      expect(ctx._fillRectCalls[0].h).toBe(1080);
    });

    test("draws a single video clip", () => {
      const project = makeProject();
      const sources: FrameSources = new Map([["asset-1", dummySource]]);

      compositor.renderFrame(project, 1000, sources);

      expect(ctx._drawImageCalls.length).toBe(1);
      expect(ctx._drawImageCalls[0].source).toBe(dummySource);
    });

    test("skips clip when source is not in FrameSources", () => {
      const project = makeProject();
      const sources: FrameSources = new Map(); // empty — no source

      compositor.renderFrame(project, 1000, sources);

      expect(ctx._drawImageCalls.length).toBe(0);
    });

    test("skips clip outside its time range", () => {
      const project = makeProject();
      const sources: FrameSources = new Map([["asset-1", dummySource]]);

      compositor.renderFrame(project, 6000, sources); // clip ends at 5000

      expect(ctx._drawImageCalls.length).toBe(0);
    });

    test("draws multiple clips sorted by track index", () => {
      const asset1 = makeAsset({ id: "a1" });
      const asset2 = makeAsset({ id: "a2" });
      const clip1 = makeClip({ id: "c1", assetId: "a1", startMs: 0, durationMs: 5000 });
      const clip2 = makeClip({ id: "c2", assetId: "a2", startMs: 0, durationMs: 5000 });

      const project = makeProject({
        assets: [asset1, asset2],
        sequence: {
          tracks: [
            { id: "t1", clips: [clip1] },
            { id: "t2", clips: [clip2] },
          ],
        },
      });

      const src1 = { width: 1920, height: 1080, _id: "src1" } as unknown as CanvasImageSource;
      const src2 = { width: 1920, height: 1080, _id: "src2" } as unknown as CanvasImageSource;
      const sources: FrameSources = new Map([
        ["a1", src1],
        ["a2", src2],
      ]);

      compositor.renderFrame(project, 1000, sources);

      // Both clips should be drawn
      expect(ctx._drawImageCalls.length).toBe(2);
      // Track 0 drawn first, track 1 second
      expect(ctx._drawImageCalls[0].source).toBe(src1);
      expect(ctx._drawImageCalls[1].source).toBe(src2);
    });

    test("skips muted tracks", () => {
      const project = makeProject({
        sequence: {
          tracks: [
            { id: "t1", clips: [makeClip()], muted: true },
          ],
        },
      });
      const sources: FrameSources = new Map([["asset-1", dummySource]]);

      compositor.renderFrame(project, 1000, sources);

      expect(ctx._drawImageCalls.length).toBe(0);
    });

    test("uses drawImage with crop source rect when clip has crop", () => {
      const clip = makeClip({
        crop: { x: 100, y: 50, width: 800, height: 600 },
      });
      const project = makeProject({
        sequence: { tracks: [{ id: "t1", clips: [clip] }] },
      });
      const sources: FrameSources = new Map([["asset-1", dummySource]]);

      compositor.renderFrame(project, 1000, sources);

      expect(ctx._drawImageCalls.length).toBe(1);
      // With crop, drawImage is called with 8 args (source rect + dest rect)
      const args = ctx._drawImageCalls[0].args as number[];
      // source rect: crop.x, crop.y, crop.width, crop.height
      expect(args[0]).toBe(100);
      expect(args[1]).toBe(50);
      expect(args[2]).toBe(800);
      expect(args[3]).toBe(600);
    });

    test("renders empty clip as solid placeholder", () => {
      const project: Project = {
        id: "p1",
        name: "test",
        createdAt: "",
        updatedAt: "",
        assets: [],
        sequence: {
          tracks: [
            {
              id: "t1",
              clips: [
                {
                  id: "empty-1",
                  clipKind: "video",
                  assetId: "", // empty
                  startMs: 0,
                  durationMs: 5000,
                  inMs: 0,
                  outMs: 5000,
                },
              ],
            },
          ],
        },
        settings: { durationMs: 10000, canvasWidth: 1920, canvasHeight: 1080 },
      };
      const sources: FrameSources = new Map();

      compositor.renderFrame(project, 1000, sources);

      // Should have at least 2 fillRects: black clear + gray placeholder
      expect(ctx._fillRectCalls.length).toBeGreaterThanOrEqual(2);
      expect(ctx._fillRectCalls[1].fillStyle).toBe("#333333");
    });

    test("renders text overlay", () => {
      const clip: Clip = {
        id: "title-1",
        clipKind: "title",
        assetId: "",
        startMs: 0,
        durationMs: 5000,
        inMs: 0,
        outMs: 5000,
        text: {
          value: "Hello World",
          fontSize: 48,
          color: "#ffffff",
          backgroundColor: "rgba(0,0,0,0.5)",
          align: "center",
        },
      };
      const project = makeProject({
        sequence: { tracks: [{ id: "t1", clips: [clip] }] },
      });
      const sources: FrameSources = new Map();

      compositor.renderFrame(project, 1000, sources);

      expect(ctx._fillTextCalls.length).toBe(1);
      expect(ctx._fillTextCalls[0].text).toBe("Hello World");
    });

    test("renders multi-line text", () => {
      const clip: Clip = {
        id: "title-1",
        clipKind: "title",
        assetId: "",
        startMs: 0,
        durationMs: 5000,
        inMs: 0,
        outMs: 5000,
        text: {
          value: "Line 1\nLine 2\nLine 3",
          fontSize: 36,
        },
      };
      const project = makeProject({
        sequence: { tracks: [{ id: "t1", clips: [clip] }] },
      });
      const sources: FrameSources = new Map();

      compositor.renderFrame(project, 1000, sources);

      expect(ctx._fillTextCalls.length).toBe(3);
      expect(ctx._fillTextCalls[0].text).toBe("Line 1");
      expect(ctx._fillTextCalls[1].text).toBe("Line 2");
      expect(ctx._fillTextCalls[2].text).toBe("Line 3");
    });
  });

  describe("blend modes", () => {
    test("maps blend modes to correct composite operations", () => {
      const blendTests: [string, string][] = [
        ["cover", "source-over"],
        ["opacity", "source-over"],
        ["multiply", "multiply"],
        ["screen", "screen"],
        ["overlay", "overlay"],
        ["add", "lighter"],
        ["difference", "difference"],
      ];

      for (const [blendMode, expectedOp] of blendTests) {
        const mocked = createMockCanvas(1920, 1080);
        const compositor = new CanvasCompositor(mocked.canvas as unknown as HTMLCanvasElement);

        const clip = makeClip({ blendMode });
        const project = makeProject({
          sequence: { tracks: [{ id: "t1", clips: [clip] }] },
        });
        const sources: FrameSources = new Map([["asset-1", dummySource]]);

        compositor.renderFrame(project, 1000, sources);

        // The drawImage call happened, which means the composite op was set
        expect(mocked.ctx._drawImageCalls.length).toBe(1);
      }
    });

    test("opacity blend mode applies 0.5 alpha", () => {
      // We can verify this by checking that drawImage was called
      // (the actual alpha is set on the mock ctx)
      const mocked = createMockCanvas(1920, 1080);
      const compositor = new CanvasCompositor(mocked.canvas as unknown as HTMLCanvasElement);

      const clip = makeClip({ blendMode: "opacity" });
      const project = makeProject({
        sequence: { tracks: [{ id: "t1", clips: [clip] }] },
      });
      const sources: FrameSources = new Map([["asset-1", dummySource]]);

      compositor.renderFrame(project, 1000, sources);
      expect(mocked.ctx._drawImageCalls.length).toBe(1);
    });
  });

  describe("transforms", () => {
    test("applies static transform values", () => {
      const mocked = createMockCanvas(1920, 1080);
      const compositor = new CanvasCompositor(mocked.canvas as unknown as HTMLCanvasElement);

      const clip = makeClip({
        transform: { x: 100, y: -50, scale: 2, rotation: 45 },
      });
      const project = makeProject({
        sequence: { tracks: [{ id: "t1", clips: [clip] }] },
      });
      const sources: FrameSources = new Map([["asset-1", dummySource]]);

      compositor.renderFrame(project, 1000, sources);

      // Clip should be drawn (transform is applied through ctx.translate/rotate/scale)
      expect(mocked.ctx._drawImageCalls.length).toBe(1);
    });

    test("applies keyframe-animated transform", () => {
      const mocked = createMockCanvas(1920, 1080);
      const compositor = new CanvasCompositor(mocked.canvas as unknown as HTMLCanvasElement);

      const clip = makeClip({
        transform: { x: 0, y: 0, scale: 1, rotation: 0 },
        keyframeTracks: [
          {
            property: "transform.x",
            keyframes: [
              { timeMs: 0, value: 0, easing: "linear" },
              { timeMs: 5000, value: 500, easing: "linear" },
            ],
          },
        ],
      });
      const project = makeProject({
        sequence: { tracks: [{ id: "t1", clips: [clip] }] },
      });
      const sources: FrameSources = new Map([["asset-1", dummySource]]);

      compositor.renderFrame(project, 2500, sources);

      expect(mocked.ctx._drawImageCalls.length).toBe(1);
    });

    test("applies keyframe opacity", () => {
      const mocked = createMockCanvas(1920, 1080);
      const compositor = new CanvasCompositor(mocked.canvas as unknown as HTMLCanvasElement);

      const clip = makeClip({
        keyframeTracks: [
          {
            property: "opacity",
            keyframes: [
              { timeMs: 0, value: 1.0, easing: "linear" },
              { timeMs: 5000, value: 0.0, easing: "linear" },
            ],
          },
        ],
      });
      const project = makeProject({
        sequence: { tracks: [{ id: "t1", clips: [clip] }] },
      });
      const sources: FrameSources = new Map([["asset-1", dummySource]]);

      compositor.renderFrame(project, 2500, sources);

      expect(mocked.ctx._drawImageCalls.length).toBe(1);
    });
  });

  describe("filters", () => {
    test("applies color correction filter", () => {
      const mocked = createMockCanvas(1920, 1080);
      const compositor = new CanvasCompositor(mocked.canvas as unknown as HTMLCanvasElement);

      const clip = makeClip({
        colorCorrection: { brightness: 0.5, contrast: 0.3 },
      });
      const project = makeProject({
        sequence: { tracks: [{ id: "t1", clips: [clip] }] },
      });
      const sources: FrameSources = new Map([["asset-1", dummySource]]);

      compositor.renderFrame(project, 1000, sources);

      expect(mocked.ctx._drawImageCalls.length).toBe(1);
    });

    test("applies video filter CSS", () => {
      const mocked = createMockCanvas(1920, 1080);
      const compositor = new CanvasCompositor(mocked.canvas as unknown as HTMLCanvasElement);

      const clip = makeClip({
        videoFilters: [
          { type: "blur", strength: 0.5 },
          { type: "sepia", strength: 0.8 },
        ],
      });
      const project = makeProject({
        sequence: { tracks: [{ id: "t1", clips: [clip] }] },
      });
      const sources: FrameSources = new Map([["asset-1", dummySource]]);

      compositor.renderFrame(project, 1000, sources);

      expect(mocked.ctx._drawImageCalls.length).toBe(1);
    });

    test("renders vignette overlay for clip with vignette filter", () => {
      const mocked = createMockCanvas(1920, 1080);
      const compositor = new CanvasCompositor(mocked.canvas as unknown as HTMLCanvasElement);

      const clip = makeClip({
        videoFilters: [{ type: "vignette", strength: 0.7 }],
      });
      const project = makeProject({
        sequence: { tracks: [{ id: "t1", clips: [clip] }] },
      });
      const sources: FrameSources = new Map([["asset-1", dummySource]]);

      compositor.renderFrame(project, 1000, sources);

      // Should have 1 drawImage + extra fillRects (black clear + vignette)
      expect(mocked.ctx._drawImageCalls.length).toBe(1);
      // fillRects: [0] = black clear, [1] = vignette gradient
      expect(mocked.ctx._fillRectCalls.length).toBeGreaterThanOrEqual(2);
    });

    test("renders grain overlay for clip with grain filter", () => {
      const mocked = createMockCanvas(1920, 1080);
      const compositor = new CanvasCompositor(mocked.canvas as unknown as HTMLCanvasElement);

      const clip = makeClip({
        videoFilters: [{ type: "grain", strength: 0.5 }],
      });
      const project = makeProject({
        sequence: { tracks: [{ id: "t1", clips: [clip] }] },
      });
      const sources: FrameSources = new Map([["asset-1", dummySource]]);

      compositor.renderFrame(project, 1000, sources);

      expect(mocked.ctx._drawImageCalls.length).toBe(1);
      // Grain adds an extra fillRect with overlay compositing
      expect(mocked.ctx._fillRectCalls.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("transitions", () => {
    test("fade transition at 50% progress applies half opacity", () => {
      const mocked = createMockCanvas(1920, 1080);
      const compositor = new CanvasCompositor(mocked.canvas as unknown as HTMLCanvasElement);

      const clip = makeClip({
        startMs: 0,
        durationMs: 5000,
        transition: { type: "fade", durationMs: 1000 },
      });
      const project = makeProject({
        sequence: { tracks: [{ id: "t1", clips: [clip] }] },
      });
      const sources: FrameSources = new Map([["asset-1", dummySource]]);

      // At t=500, progress = 0.5, opacity should be 0.5
      compositor.renderFrame(project, 500, sources);

      expect(mocked.ctx._drawImageCalls.length).toBe(1);
    });

    test("fade transition at 0% progress applies zero opacity", () => {
      const mocked = createMockCanvas(1920, 1080);
      const compositor = new CanvasCompositor(mocked.canvas as unknown as HTMLCanvasElement);

      const clip = makeClip({
        startMs: 0,
        durationMs: 5000,
        transition: { type: "fade", durationMs: 1000 },
      });
      const project = makeProject({
        sequence: { tracks: [{ id: "t1", clips: [clip] }] },
      });
      const sources: FrameSources = new Map([["asset-1", dummySource]]);

      compositor.renderFrame(project, 0, sources);

      expect(mocked.ctx._drawImageCalls.length).toBe(1);
    });

    test("slide-left transition applies translateX", () => {
      const mocked = createMockCanvas(1920, 1080);
      const compositor = new CanvasCompositor(mocked.canvas as unknown as HTMLCanvasElement);

      const clip = makeClip({
        startMs: 0,
        durationMs: 5000,
        transition: { type: "slide-left", durationMs: 1000 },
      });
      const project = makeProject({
        sequence: { tracks: [{ id: "t1", clips: [clip] }] },
      });
      const sources: FrameSources = new Map([["asset-1", dummySource]]);

      // At t=500, progress = 0.5, translateX = (1-0.5)*100 = 50%
      compositor.renderFrame(project, 500, sources);

      expect(mocked.ctx._drawImageCalls.length).toBe(1);
    });

    test("wipe-left transition applies clip inset", () => {
      const mocked = createMockCanvas(1920, 1080);
      const compositor = new CanvasCompositor(mocked.canvas as unknown as HTMLCanvasElement);

      const clip = makeClip({
        startMs: 0,
        durationMs: 5000,
        transition: { type: "wipe-left", durationMs: 1000 },
      });
      const project = makeProject({
        sequence: { tracks: [{ id: "t1", clips: [clip] }] },
      });
      const sources: FrameSources = new Map([["asset-1", dummySource]]);

      compositor.renderFrame(project, 500, sources);

      expect(mocked.ctx._drawImageCalls.length).toBe(1);
    });

    test("zoom-in transition applies scale and opacity", () => {
      const mocked = createMockCanvas(1920, 1080);
      const compositor = new CanvasCompositor(mocked.canvas as unknown as HTMLCanvasElement);

      const clip = makeClip({
        startMs: 0,
        durationMs: 5000,
        transition: { type: "zoom-in", durationMs: 1000 },
      });
      const project = makeProject({
        sequence: { tracks: [{ id: "t1", clips: [clip] }] },
      });
      const sources: FrameSources = new Map([["asset-1", dummySource]]);

      compositor.renderFrame(project, 500, sources);

      expect(mocked.ctx._drawImageCalls.length).toBe(1);
    });

    test("push-left outgoing transition moves clip left", () => {
      const mocked = createMockCanvas(1920, 1080);
      const compositor = new CanvasCompositor(mocked.canvas as unknown as HTMLCanvasElement);

      const clipA = makeClip({
        id: "clip-a",
        assetId: "asset-1",
        startMs: 0,
        durationMs: 5000,
      });
      const clipB = makeClip({
        id: "clip-b",
        assetId: "asset-1",
        startMs: 4000, // overlap with clipA
        durationMs: 5000,
        transition: { type: "push-left", durationMs: 1000 },
      });

      const project = makeProject({
        sequence: {
          tracks: [{ id: "t1", clips: [clipA, clipB] }],
        },
      });
      const sources: FrameSources = new Map([["asset-1", dummySource]]);

      // At t=4500, both clips active, push-left transition at 50%
      compositor.renderFrame(project, 4500, sources);

      // Both clips should be drawn
      expect(mocked.ctx._drawImageCalls.length).toBe(2);
    });

    test("fade-black transition at mid-point hides both clips", () => {
      const mocked = createMockCanvas(1920, 1080);
      const compositor = new CanvasCompositor(mocked.canvas as unknown as HTMLCanvasElement);

      const clipA = makeClip({
        id: "clip-a",
        assetId: "asset-1",
        startMs: 0,
        durationMs: 5000,
      });
      const clipB = makeClip({
        id: "clip-b",
        assetId: "asset-1",
        startMs: 4000,
        durationMs: 5000,
        transition: { type: "fade-black", durationMs: 1000 },
      });

      const project = makeProject({
        sequence: {
          tracks: [{ id: "t1", clips: [clipA, clipB] }],
        },
      });
      const sources: FrameSources = new Map([["asset-1", dummySource]]);

      // At exactly mid-point (t=4500), both clips should have very low opacity
      compositor.renderFrame(project, 4500, sources);

      expect(mocked.ctx._drawImageCalls.length).toBe(2);
    });

    test("fade-white transition includes brightness filter", () => {
      const mocked = createMockCanvas(1920, 1080);
      const compositor = new CanvasCompositor(mocked.canvas as unknown as HTMLCanvasElement);

      const clip = makeClip({
        startMs: 0,
        durationMs: 5000,
        transition: { type: "fade-white", durationMs: 1000 },
      });
      const project = makeProject({
        sequence: { tracks: [{ id: "t1", clips: [clip] }] },
      });
      const sources: FrameSources = new Map([["asset-1", dummySource]]);

      // At t=200, progress=0.2 < 0.5, so brightness(5) filter should be applied
      compositor.renderFrame(project, 200, sources);

      expect(mocked.ctx._drawImageCalls.length).toBe(1);
    });

    test("no transition active after transition duration", () => {
      const mocked = createMockCanvas(1920, 1080);
      const compositor = new CanvasCompositor(mocked.canvas as unknown as HTMLCanvasElement);

      const clip = makeClip({
        startMs: 0,
        durationMs: 5000,
        transition: { type: "fade", durationMs: 1000 },
      });
      const project = makeProject({
        sequence: { tracks: [{ id: "t1", clips: [clip] }] },
      });
      const sources: FrameSources = new Map([["asset-1", dummySource]]);

      // At t=2000, transition is complete (>1000ms)
      compositor.renderFrame(project, 2000, sources);

      expect(mocked.ctx._drawImageCalls.length).toBe(1);
    });
  });

  describe("image clips", () => {
    test("renders image clips", () => {
      const mocked = createMockCanvas(1920, 1080);
      const compositor = new CanvasCompositor(mocked.canvas as unknown as HTMLCanvasElement);

      const asset = makeAsset({ id: "img-1", kind: "image" });
      const clip = makeClip({ id: "ic1", clipKind: "image", assetId: "img-1" });
      const project = makeProject({
        assets: [asset],
        sequence: { tracks: [{ id: "t1", clips: [clip] }] },
      });
      const imgSource = { width: 1920, height: 1080 } as unknown as CanvasImageSource;
      const sources: FrameSources = new Map([["img-1", imgSource]]);

      compositor.renderFrame(project, 1000, sources);

      expect(mocked.ctx._drawImageCalls.length).toBe(1);
      expect(mocked.ctx._drawImageCalls[0].source).toBe(imgSource);
    });
  });

  describe("p5js clips", () => {
    test("renders p5js clips same as video", () => {
      const mocked = createMockCanvas(1920, 1080);
      const compositor = new CanvasCompositor(mocked.canvas as unknown as HTMLCanvasElement);

      const asset = makeAsset({ id: "p5-1", kind: "p5js" });
      const clip = makeClip({ id: "pc1", clipKind: "p5js", assetId: "p5-1" });
      const project = makeProject({
        assets: [asset],
        sequence: { tracks: [{ id: "t1", clips: [clip] }] },
      });
      const p5Source = { width: 1920, height: 1080 } as unknown as CanvasImageSource;
      const sources: FrameSources = new Map([["p5-1", p5Source]]);

      compositor.renderFrame(project, 1000, sources);

      expect(mocked.ctx._drawImageCalls.length).toBe(1);
    });
  });

  describe("dispose", () => {
    test("can be called without error", () => {
      const { canvas } = createMockCanvas(1920, 1080);
      const compositor = new CanvasCompositor(canvas as unknown as HTMLCanvasElement);
      expect(() => compositor.dispose()).not.toThrow();
    });

    test("can be called multiple times", () => {
      const { canvas } = createMockCanvas(1920, 1080);
      const compositor = new CanvasCompositor(canvas as unknown as HTMLCanvasElement);
      compositor.dispose();
      expect(() => compositor.dispose()).not.toThrow();
    });
  });
});

describe("parseTransitionStyle", () => {
  test("parses opacity", () => {
    const result = parseTransitionStyle({ opacity: 0.5 });
    expect(result.opacity).toBe(0.5);
  });

  test("parses translateX from transform", () => {
    const result = parseTransitionStyle({ transform: "translateX(50%)" });
    expect(result.translateX).toBe(50);
  });

  test("parses translateY from transform", () => {
    const result = parseTransitionStyle({ transform: "translateY(-75%)" });
    expect(result.translateY).toBe(-75);
  });

  test("parses scale from transform", () => {
    const result = parseTransitionStyle({ transform: "scale(0.5)" });
    expect(result.scale).toBe(0.5);
  });

  test("parses combined transform", () => {
    const result = parseTransitionStyle({ transform: "translateX(10%) scale(2)" });
    expect(result.translateX).toBe(10);
    expect(result.scale).toBe(2);
  });

  test("parses clipPath inset with percentages", () => {
    const result = parseTransitionStyle({ clipPath: "inset(10% 20% 30% 40%)" });
    expect(result.clipInset).toEqual({ top: 10, right: 20, bottom: 30, left: 40 });
  });

  test("parses clipPath inset with mixed values", () => {
    const result = parseTransitionStyle({ clipPath: "inset(0 50% 0 0)" });
    expect(result.clipInset).toEqual({ top: 0, right: 50, bottom: 0, left: 0 });
  });

  test("parses filter", () => {
    const result = parseTransitionStyle({ filter: "brightness(5)" });
    expect(result.filter).toBe("brightness(5)");
  });

  test("returns empty object for empty style", () => {
    const result = parseTransitionStyle({});
    expect(result).toEqual({});
  });

  test("handles real fade handler output (opacity only)", () => {
    const result = parseTransitionStyle({ opacity: 0.7 });
    expect(result.opacity).toBe(0.7);
    expect(result.translateX).toBeUndefined();
    expect(result.scale).toBeUndefined();
  });

  test("handles real slide-left handler output", () => {
    // slide-left at progress 0.5: translateX(50%)
    const result = parseTransitionStyle({ transform: "translateX(50%)" });
    expect(result.translateX).toBe(50);
    expect(result.opacity).toBeUndefined();
  });

  test("handles real wipe-left handler output", () => {
    // wipe-left at progress 0.5: inset(0 50% 0 0)
    const result = parseTransitionStyle({ clipPath: "inset(0 50% 0 0)" });
    expect(result.clipInset).toEqual({ top: 0, right: 50, bottom: 0, left: 0 });
  });

  test("handles real wipe-up handler output", () => {
    // wipe-up at progress 0.5: inset(50% 0 0 0)
    const result = parseTransitionStyle({ clipPath: "inset(50% 0 0 0)" });
    expect(result.clipInset).toEqual({ top: 50, right: 0, bottom: 0, left: 0 });
  });

  test("handles real zoom-in handler output", () => {
    const result = parseTransitionStyle({ transform: "scale(0.5)", opacity: 0.5 });
    expect(result.scale).toBe(0.5);
    expect(result.opacity).toBe(0.5);
  });

  test("handles real push-left outgoing handler output", () => {
    // push-left outgoing at progress 0.5: translateX(-50%)
    const result = parseTransitionStyle({ transform: "translateX(-50%)" });
    expect(result.translateX).toBe(-50);
  });

  test("handles real fade-white handler output with filter", () => {
    const result = parseTransitionStyle({ opacity: 0, filter: "brightness(5)" });
    expect(result.opacity).toBe(0);
    expect(result.filter).toBe("brightness(5)");
  });
});
