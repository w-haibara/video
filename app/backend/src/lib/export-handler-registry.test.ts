import { describe, test, expect, beforeEach } from "bun:test";
import { ExportHandlerRegistry } from "./export-handler-registry";
import type {
  ExportClipHandler,
  ExportOverlayHandler,
  ExportAudioHandler,
  ExportBuildContext,
} from "./export-handler-registry";
import { exportHandlerRegistry } from "./export-handler-registry";

describe("ExportHandlerRegistry", () => {
  test("builtin plugin registers video clip handler", () => {
    expect(exportHandlerRegistry.getClipHandler("video")).toBeDefined();
  });

  test("builtin plugin registers image clip handler", () => {
    expect(exportHandlerRegistry.getClipHandler("image")).toBeDefined();
  });

  test("builtin plugin registers overlay handlers", () => {
    const overlays = exportHandlerRegistry.getOverlayHandlers();
    expect(overlays.length).toBeGreaterThan(0);
  });

  test("builtin plugin registers audio handlers", () => {
    const audio = exportHandlerRegistry.getAudioHandlers();
    expect(audio.length).toBeGreaterThan(0);
  });

  describe("isolated instance", () => {
    let registry: ExportHandlerRegistry;

    beforeEach(() => {
      registry = new ExportHandlerRegistry();
    });

    test("registerClipHandler and getClipHandler work", () => {
      const handler: ExportClipHandler = {
        assetKind: "custom",
        buildInput: () => {},
      };
      registry.registerClipHandler(handler);
      expect(registry.getClipHandler("custom")).toBe(handler);
    });

    test("getClipHandler returns undefined for unregistered kind", () => {
      expect(registry.getClipHandler("nonexistent")).toBeUndefined();
    });

    test("registerOverlayHandler and getOverlayHandlers work", () => {
      const handler: ExportOverlayHandler = {
        clipKind: "subtitle",
        buildOverlay: () => "out",
      };
      registry.registerOverlayHandler(handler);
      const handlers = registry.getOverlayHandlers();
      expect(handlers.length).toBe(1);
      expect(handlers[0].clipKind).toBe("subtitle");
    });

    test("registerAudioHandler and getAudioHandlers work", () => {
      const handler: ExportAudioHandler = {
        clipKind: "sfx",
        buildAudio: () => "out",
      };
      registry.registerAudioHandler(handler);
      const handlers = registry.getAudioHandlers();
      expect(handlers.length).toBe(1);
      expect(handlers[0].clipKind).toBe("sfx");
    });

    test("getOverlayHandlers returns a copy", () => {
      registry.registerOverlayHandler({
        clipKind: "t",
        buildOverlay: () => "out",
      });
      const first = registry.getOverlayHandlers();
      const second = registry.getOverlayHandlers();
      expect(first).not.toBe(second);
      expect(first).toEqual(second);
    });

    test("getAudioHandlers returns a copy", () => {
      registry.registerAudioHandler({
        clipKind: "t",
        buildAudio: () => "out",
      });
      const first = registry.getAudioHandlers();
      const second = registry.getAudioHandlers();
      expect(first).not.toBe(second);
      expect(first).toEqual(second);
    });

    test("multiple clip handlers can coexist", () => {
      registry.registerClipHandler({ assetKind: "a", buildInput: () => {} });
      registry.registerClipHandler({ assetKind: "b", buildInput: () => {} });
      expect(registry.getClipHandler("a")).toBeDefined();
      expect(registry.getClipHandler("b")).toBeDefined();
      expect(registry.getClipHandler("a")!.assetKind).toBe("a");
    });

    test("clip handler buildInput mutates context", () => {
      const handler: ExportClipHandler = {
        assetKind: "test",
        buildInput: (_clip, _asset, ctx) => {
          ctx.inputArgs.push("-i", "test.mp4");
          ctx.filterParts.push("[0:v]trim=0:5[v0]");
          ctx.inputIndex++;
        },
      };
      registry.registerClipHandler(handler);

      const ctx: ExportBuildContext = {
        project: {} as any,
        preset: { width: 1920, height: 1080, fps: 30, videoBitrate: "8M", audioBitrate: "192k" },
        assetsBase: "/assets",
        inputArgs: [],
        filterParts: [],
        inputIndex: 0,
        clipInputIndices: new Map(),
      };

      handler.buildInput({} as any, {} as any, ctx);
      expect(ctx.inputArgs).toEqual(["-i", "test.mp4"]);
      expect(ctx.filterParts).toEqual(["[0:v]trim=0:5[v0]"]);
      expect(ctx.inputIndex).toBe(1);
    });
  });
});
