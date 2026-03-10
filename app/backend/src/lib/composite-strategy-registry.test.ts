import { describe, test, expect, beforeEach } from "bun:test";
import { CompositeStrategyRegistry, exportCompositeStrategyRegistry } from "./composite-strategy-registry";
import type { ExportCompositeStrategy } from "./composite-strategy-registry";
import { coverExportStrategy } from "./composite-strategies/cover-strategy";

describe("CompositeStrategyRegistry (export)", () => {
  test("builtin plugin registers cover strategy", () => {
    const cover = exportCompositeStrategyRegistry.get("cover");
    expect(cover).toBeDefined();
    expect(cover!.id).toBe("cover");
  });

  test("all() includes the cover strategy", () => {
    const all = exportCompositeStrategyRegistry.all();
    expect(all.length).toBeGreaterThan(0);
    expect(all.some((s) => s.id === "cover")).toBe(true);
  });

  describe("CoverExportStrategy", () => {
    test("buildOverlayFilter produces correct FFmpeg overlay filter", () => {
      const result = coverExportStrategy.buildOverlayFilter("[base]", "[v0]", "between(t,0,5)");
      expect(result).toBe("[base][v0]overlay=0:0:enable='between(t,0,5)'");
    });

    test("buildOverlayFilter handles different labels", () => {
      const result = coverExportStrategy.buildOverlayFilter("[ov2]", "[v3]", "between(t,2,8)");
      expect(result).toBe("[ov2][v3]overlay=0:0:enable='between(t,2,8)'");
    });
  });

  describe("isolated instance", () => {
    let registry: CompositeStrategyRegistry;

    beforeEach(() => {
      registry = new CompositeStrategyRegistry();
    });

    test("register and get work", () => {
      const strategy: ExportCompositeStrategy = {
        id: "custom",
        buildOverlayFilter: (b, t, e) => `${b}${t}custom:${e}`,
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
      registry.register({ id: "s", buildOverlayFilter: () => "v1" });
      registry.register({ id: "s", buildOverlayFilter: () => "v2" });
      expect(registry.get("s")!.buildOverlayFilter("", "", "")).toBe("v2");
      expect(registry.all().length).toBe(1);
    });
  });
});
