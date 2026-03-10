import { describe, test, expect, beforeEach } from "bun:test";
import { AssetKindRegistry } from "./asset-kind-registry";
import { assetKindRegistry } from "./asset-kind-registry";

describe("AssetKindRegistry", () => {
  test("builtin plugin registers video, image, audio kinds", () => {
    const all = assetKindRegistry.all();
    const kinds = all.map((d) => d.kind);
    expect(kinds).toContain("video");
    expect(kinds).toContain("image");
    expect(kinds).toContain("audio");
  });

  test("detectByExtension returns correct kind for video", () => {
    expect(assetKindRegistry.detectByExtension(".mp4")?.kind).toBe("video");
    expect(assetKindRegistry.detectByExtension(".mov")?.kind).toBe("video");
    expect(assetKindRegistry.detectByExtension(".webm")?.kind).toBe("video");
  });

  test("detectByExtension returns correct kind for image", () => {
    expect(assetKindRegistry.detectByExtension(".jpg")?.kind).toBe("image");
    expect(assetKindRegistry.detectByExtension(".png")?.kind).toBe("image");
  });

  test("detectByExtension returns correct kind for audio", () => {
    expect(assetKindRegistry.detectByExtension(".mp3")?.kind).toBe("audio");
    expect(assetKindRegistry.detectByExtension(".wav")?.kind).toBe("audio");
  });

  test("detectByExtension is case-insensitive", () => {
    expect(assetKindRegistry.detectByExtension(".MP4")?.kind).toBe("video");
    expect(assetKindRegistry.detectByExtension(".JPG")?.kind).toBe("image");
  });

  test("detectByExtension returns undefined for unknown extension", () => {
    expect(assetKindRegistry.detectByExtension(".xyz")).toBeUndefined();
    expect(assetKindRegistry.detectByExtension(".doc")).toBeUndefined();
  });

  describe("isolated instance", () => {
    let registry: AssetKindRegistry;

    beforeEach(() => {
      registry = new AssetKindRegistry();
    });

    test("register and get work", () => {
      registry.register({
        kind: "custom",
        label: "Custom",
        extensions: [".cst"],
        mimePatterns: ["application/custom"],
        defaultTrackKind: "video",
        hasDuration: true,
      });
      expect(registry.get("custom")).toBeDefined();
      expect(registry.detectByExtension(".cst")?.kind).toBe("custom");
    });

    test("detectByExtension returns undefined on empty registry", () => {
      expect(registry.detectByExtension(".mp4")).toBeUndefined();
    });
  });
});
