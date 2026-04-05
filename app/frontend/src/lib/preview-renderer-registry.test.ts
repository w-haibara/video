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

  test("p5js tick strategy is registered", () => {
    expect(previewRendererRegistry.getTickStrategy("p5js")).toBeDefined();
  });

  test("p5js renderer is registered with findActiveContent", () => {
    const all = previewRendererRegistry.all();
    const p5jsRenderer = all.find((r) => r.id === "p5js-clip");
    expect(p5jsRenderer).toBeDefined();
    expect(p5jsRenderer!.findActiveContent).toBeDefined();
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

    test("register is idempotent by id (same id registered twice yields one entry)", () => {
      const renderer: PreviewLayerRenderer = {
        id: "dup",
        zOrder: 10,
        findActiveContent: () => null,
        Component: dummyComponent,
      };
      registry.register(renderer);
      registry.register(renderer);
      const all = registry.all();
      expect(all.filter((r) => r.id === "dup").length).toBe(1);
      expect(all.length).toBe(1);
    });

    test("re-registering with updated fields replaces the original (latest wins)", () => {
      registry.register({
        id: "swap",
        zOrder: 1,
        findActiveContent: () => null,
        Component: dummyComponent,
      });
      registry.register({
        id: "swap",
        zOrder: 99,
        findActiveContent: () => null,
        Component: dummyComponent,
      });
      const all = registry.all();
      expect(all.length).toBe(1);
      expect(all[0].zOrder).toBe(99);
    });

    test("registering different ids still accumulates all entries", () => {
      registry.register({
        id: "a",
        zOrder: 1,
        findActiveContent: () => null,
        Component: dummyComponent,
      });
      registry.register({
        id: "b",
        zOrder: 2,
        findActiveContent: () => null,
        Component: dummyComponent,
      });
      registry.register({
        id: "c",
        zOrder: 3,
        findActiveContent: () => null,
        Component: dummyComponent,
      });
      const all = registry.all();
      expect(all.map((r) => r.id).sort()).toEqual(["a", "b", "c"]);
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
