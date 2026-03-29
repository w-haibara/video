import { describe, test, expect } from "bun:test";
import { transitionPreviewRegistry } from "./transition-preview-registry";
import { computeTransitionStyle } from "./preview-renderer-registry";
import type { Clip, Project } from "@video/shared";

describe("TransitionPreviewRegistry", () => {
  test("all 7 transitions are registered", () => {
    expect(transitionPreviewRegistry.all().length).toBe(7);
  });

  describe("fade handler", () => {
    const handler = transitionPreviewRegistry.get("fade")!;

    test("computeIncomingStyle", () => {
      expect(handler.computeIncomingStyle(0)).toEqual({ opacity: 0 });
      expect(handler.computeIncomingStyle(1)).toEqual({ opacity: 1 });
      expect(handler.computeIncomingStyle(0.5)).toEqual({ opacity: 0.5 });
    });

    test("computeOutgoingStyle", () => {
      expect(handler.computeOutgoingStyle!(0)).toEqual({ opacity: 1 });
      expect(handler.computeOutgoingStyle!(1)).toEqual({ opacity: 0 });
    });
  });

  describe("fade-black handler", () => {
    const handler = transitionPreviewRegistry.get("fade-black")!;

    test("computeIncomingStyle", () => {
      expect(handler.computeIncomingStyle(0)).toEqual({ opacity: 0 });
      expect(handler.computeIncomingStyle(0.5)).toEqual({ opacity: 0 });
      expect(handler.computeIncomingStyle(1)).toEqual({ opacity: 1 });
    });

    test("computeOutgoingStyle", () => {
      expect(handler.computeOutgoingStyle!(0)).toEqual({ opacity: 1 });
      expect(handler.computeOutgoingStyle!(0.5)).toEqual({ opacity: 0 });
    });
  });

  describe("fade-white handler", () => {
    const handler = transitionPreviewRegistry.get("fade-white")!;

    test("computeIncomingStyle at progress 0.25 has brightness filter", () => {
      const style = handler.computeIncomingStyle(0.25);
      expect(style.filter).toBe("brightness(5)");
    });

    test("computeIncomingStyle at progress 0.75 has no filter", () => {
      const style = handler.computeIncomingStyle(0.75);
      expect(style.filter).toBeUndefined();
    });

    test("computeOutgoingStyle at progress 0.25 has brightness filter", () => {
      const style = handler.computeOutgoingStyle!(0.25);
      expect(style.filter).toBe("brightness(5)");
    });

    test("computeOutgoingStyle at progress 0.75 has opacity 0", () => {
      const style = handler.computeOutgoingStyle!(0.75);
      expect(style.opacity).toBe(0);
    });
  });

  describe("slide-left handler", () => {
    const handler = transitionPreviewRegistry.get("slide-left")!;

    test("computeIncomingStyle", () => {
      expect(handler.computeIncomingStyle(0)).toEqual({ transform: "translateX(100%)" });
      expect(handler.computeIncomingStyle(1)).toEqual({ transform: "translateX(0%)" });
    });

    test("has no computeOutgoingStyle", () => {
      expect(handler.computeOutgoingStyle).toBeUndefined();
    });
  });

  describe("slide-right handler", () => {
    const handler = transitionPreviewRegistry.get("slide-right")!;

    test("computeIncomingStyle", () => {
      expect(handler.computeIncomingStyle(0)).toEqual({ transform: "translateX(-100%)" });
      expect(handler.computeIncomingStyle(1)).toEqual({ transform: "translateX(0%)" });
    });

    test("has no computeOutgoingStyle", () => {
      expect(handler.computeOutgoingStyle).toBeUndefined();
    });
  });

  describe("slide-up handler", () => {
    const handler = transitionPreviewRegistry.get("slide-up")!;

    test("computeIncomingStyle", () => {
      expect(handler.computeIncomingStyle(0)).toEqual({ transform: "translateY(100%)" });
      expect(handler.computeIncomingStyle(1)).toEqual({ transform: "translateY(0%)" });
    });

    test("has no computeOutgoingStyle", () => {
      expect(handler.computeOutgoingStyle).toBeUndefined();
    });
  });

  describe("slide-down handler", () => {
    const handler = transitionPreviewRegistry.get("slide-down")!;

    test("computeIncomingStyle", () => {
      expect(handler.computeIncomingStyle(0)).toEqual({ transform: "translateY(-100%)" });
      expect(handler.computeIncomingStyle(1)).toEqual({ transform: "translateY(0%)" });
    });

    test("has no computeOutgoingStyle", () => {
      expect(handler.computeOutgoingStyle).toBeUndefined();
    });
  });
});

describe("computeTransitionStyle", () => {
  function makeProject(clips: Clip[]): Project {
    return {
      id: "p1",
      name: "Test",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
      assets: [],
      sequence: {
        tracks: [{ id: "t1", clips }],
      },
      settings: { durationMs: 10000, canvasWidth: 1920, canvasHeight: 1080 },
    };
  }

  test("clip with fade transition at 50% incoming progress returns opacity 0.5", () => {
    const clip: Clip = {
      id: "c1",
      clipKind: "video",
      assetId: "a1",
      startMs: 0,
      durationMs: 5000,
      inMs: 0,
      outMs: 5000,
      transition: { type: "fade", durationMs: 1000 },
    };
    const project = makeProject([clip]);
    // At 500ms, progress = 500/1000 = 0.5
    const style = computeTransitionStyle(clip, project, 500);
    expect(style.opacity).toBe(0.5);
  });

  test("clip with no transition returns empty object", () => {
    const clip: Clip = {
      id: "c2",
      clipKind: "video",
      assetId: "a1",
      startMs: 0,
      durationMs: 5000,
      inMs: 0,
      outMs: 5000,
    };
    const project = makeProject([clip]);
    const style = computeTransitionStyle(clip, project, 2500);
    expect(style).toEqual({});
  });
});
