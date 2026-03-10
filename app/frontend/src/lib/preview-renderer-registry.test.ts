import { describe, test, expect, beforeEach } from "bun:test";
import { PreviewRendererRegistry } from "./preview-renderer-registry";
import type { PreviewLayerRenderer, PlaybackTickStrategy } from "./preview-renderer-registry";
import { previewRendererRegistry } from "./preview-renderer-registry";

const dummyComponent = (() => null) as unknown as PreviewLayerRenderer["Component"];

describe("PreviewRendererRegistry", () => {
  test("builtin plugin registers renderers", () => {
    const all = previewRendererRegistry.all();
    expect(all.length).toBeGreaterThan(0);
  });

  test("builtin plugin registers tick strategies", () => {
    expect(previewRendererRegistry.getTickStrategy("video")).toBeDefined();
    expect(previewRendererRegistry.getTickStrategy("image")).toBeDefined();
  });

  describe("isolated instance", () => {
    let registry: PreviewRendererRegistry;

    beforeEach(() => {
      registry = new PreviewRendererRegistry();
    });

    test("all returns renderers sorted by zOrder", () => {
      registry.register({
        id: "top",
        zOrder: 100,
        findActiveContent: () => null,
        Component: dummyComponent,
      });
      registry.register({
        id: "bottom",
        zOrder: 1,
        findActiveContent: () => null,
        Component: dummyComponent,
      });
      registry.register({
        id: "middle",
        zOrder: 50,
        findActiveContent: () => null,
        Component: dummyComponent,
      });

      const all = registry.all();
      expect(all.map((r) => r.id)).toEqual(["bottom", "middle", "top"]);
    });

    test("all returns empty array when nothing registered", () => {
      expect(registry.all()).toEqual([]);
    });

    test("registerTickStrategy and getTickStrategy work", () => {
      const strategy: PlaybackTickStrategy = {
        assetKind: "custom",
        tick: () => null,
      };
      registry.registerTickStrategy(strategy);
      expect(registry.getTickStrategy("custom")).toBe(strategy);
    });

    test("getTickStrategy returns undefined for unregistered kind", () => {
      expect(registry.getTickStrategy("nonexistent")).toBeUndefined();
    });

    test("all returns a copy of renderers array", () => {
      registry.register({
        id: "r1",
        zOrder: 1,
        findActiveContent: () => null,
        Component: dummyComponent,
      });
      const first = registry.all();
      const second = registry.all();
      expect(first).not.toBe(second);
      expect(first).toEqual(second);
    });
  });
});
