import { describe, test, expect, beforeEach } from "bun:test";
import { ClipKindRegistry } from "./clip-kind-registry";
import { clipKindRegistry } from "./clip-kind-registry";

describe("ClipKindRegistry", () => {
  test("builtin plugin registers 3 default kinds", () => {
    const all = clipKindRegistry.all();
    expect(all.length).toBe(3);
    const kinds = all.map((d) => d.kind);
    expect(kinds).toContain("video");
    expect(kinds).toContain("audio");
    expect(kinds).toContain("title");
  });

  test("get returns descriptor for registered kind", () => {
    const video = clipKindRegistry.get("video");
    expect(video).toBeDefined();
    expect(video!.kind).toBe("video");
    expect(video!.hasSourceTrim).toBe(true);
    expect(video!.hasAsset).toBe(true);
  });

  test("get returns undefined for unregistered kind", () => {
    expect(clipKindRegistry.get("nonexistent")).toBeUndefined();
  });

  describe("isolated instance", () => {
    let registry: ClipKindRegistry;

    beforeEach(() => {
      registry = new ClipKindRegistry();
    });

    test("register adds a new kind", () => {
      registry.register({
        kind: "custom",
        label: "C",
        clipColor: "#123",
        clipSelectedColor: "#456",
        hasSourceTrim: false,
        hasAsset: false,
      });
      expect(registry.get("custom")).toBeDefined();
      expect(registry.all().length).toBe(1);
    });

    test("register overwrites existing kind", () => {
      registry.register({
        kind: "test",
        label: "T1",
        clipColor: "#aaa",
        clipSelectedColor: "#bbb",
        hasSourceTrim: true,
        hasAsset: true,
      });
      registry.register({
        kind: "test",
        label: "T2",
        clipColor: "#ccc",
        clipSelectedColor: "#ddd",
        hasSourceTrim: false,
        hasAsset: false,
      });
      expect(registry.get("test")!.label).toBe("T2");
    });

    test("all returns empty array when nothing registered", () => {
      expect(registry.all()).toEqual([]);
    });
  });
});
