import { describe, test, expect, beforeEach } from "bun:test";
import { CompositeStrategyRegistry, compositeStrategyRegistry } from "./composite-strategy-registry";
import type { PreviewCompositeStrategy } from "./composite-strategy-registry";
import { coverPreviewStrategy } from "./composite-strategies/cover-strategy";

describe("CompositeStrategyRegistry (preview)", () => {
  test("builtin plugin registers cover strategy", () => {
    const cover = compositeStrategyRegistry.get("cover");
    expect(cover).toBeDefined();
    expect(cover!.id).toBe("cover");
  });

  test("all() includes the cover strategy", () => {
    const all = compositeStrategyRegistry.all();
    expect(all.length).toBeGreaterThan(0);
    expect(all.some((s) => s.id === "cover")).toBe(true);
  });

  describe("CoverPreviewStrategy", () => {
    test("containerStyle returns position relative", () => {
      const style = coverPreviewStrategy.containerStyle({ canvasW: 1920, canvasH: 1080 });
      expect(style.position).toBe("relative");
    });

    test("containerStyle works with different canvas sizes", () => {
      const style = coverPreviewStrategy.containerStyle({ canvasW: 1080, canvasH: 1920 });
      expect(style.position).toBe("relative");
    });
  });

  describe("isolated instance", () => {
    let registry: CompositeStrategyRegistry;

    beforeEach(() => {
      registry = new CompositeStrategyRegistry();
    });

    test("register and get work", () => {
      const strategy: PreviewCompositeStrategy = {
        id: "custom",
        label: "Custom",
        containerStyle: () => ({ position: "absolute" }),
      };
      registry.register(strategy);
      expect(registry.get("custom")).toBe(strategy);
    });

    test("get returns undefined for unregistered strategy", () => {
      expect(registry.get("nonexistent")).toBeUndefined();
    });

    test("all returns empty array initially", () => {
      expect(registry.all()).toEqual([]);
    });

    test("register overwrites existing strategy", () => {
      registry.register({ id: "s", label: "V1", containerStyle: () => ({}) });
      registry.register({ id: "s", label: "V2", containerStyle: () => ({}) });
      expect(registry.get("s")!.label).toBe("V2");
      expect(registry.all().length).toBe(1);
    });
  });
});
