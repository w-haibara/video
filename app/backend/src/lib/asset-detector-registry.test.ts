import { describe, test, expect, beforeEach } from "bun:test";
import { AssetDetectorRegistry } from "./asset-detector-registry";
import { assetDetectorRegistry } from "./asset-detector-registry";

describe("AssetDetectorRegistry", () => {
  test("builtin detector resolves video extensions", () => {
    expect(
      assetDetectorRegistry.detect({ filename: "test.mp4", extension: ".mp4" }),
    ).toBe("video");
  });

  test("builtin detector resolves image extensions", () => {
    expect(
      assetDetectorRegistry.detect({ filename: "photo.jpg", extension: ".jpg" }),
    ).toBe("image");
  });

  test("builtin detector resolves audio extensions", () => {
    expect(
      assetDetectorRegistry.detect({ filename: "track.mp3", extension: ".mp3" }),
    ).toBe("audio");
  });

  describe("p5js detector", () => {
    test("detects .p5.js files as p5js", () => {
      expect(
        assetDetectorRegistry.detect({ filename: "sketch.p5.js", extension: ".js" }),
      ).toBe("p5js");
    });

    test("does not detect generic .js files", () => {
      expect(
        assetDetectorRegistry.detect({ filename: "script.js", extension: ".js" }),
      ).not.toBe("p5js");
    });

    test("does not detect .p5.js.bak files", () => {
      expect(
        assetDetectorRegistry.detect({ filename: "sketch.p5.js.bak", extension: ".bak" }),
      ).not.toBe("p5js");
    });

    test("p5js has higher priority than extension-detector for .p5.js files", () => {
      // Verify that test.p5.js is detected as p5js (not as some other kind via extension-detector)
      expect(
        assetDetectorRegistry.detect({ filename: "test.p5.js", extension: ".js" }),
      ).toBe("p5js");
    });
  });

  describe("isolated instance", () => {
    let registry: AssetDetectorRegistry;

    beforeEach(() => {
      registry = new AssetDetectorRegistry();
    });

    test("detectors are evaluated in priority descending order", () => {
      const calls: string[] = [];

      registry.register({
        name: "low",
        priority: 1,
        detect: (ctx) => {
          calls.push("low");
          return null;
        },
      });
      registry.register({
        name: "high",
        priority: 10,
        detect: (ctx) => {
          calls.push("high");
          return null;
        },
      });
      registry.register({
        name: "mid",
        priority: 5,
        detect: (ctx) => {
          calls.push("mid");
          return null;
        },
      });

      registry.detect({ filename: "test.xyz", extension: ".xyz" });
      expect(calls).toEqual(["high", "mid", "low"]);
    });

    test("returns result from highest priority match", () => {
      registry.register({
        name: "low",
        priority: 1,
        detect: () => "low-result",
      });
      registry.register({
        name: "high",
        priority: 10,
        detect: () => "high-result",
      });

      const result = registry.detect({
        filename: "test.xyz",
        extension: ".xyz",
      });
      expect(result).toBe("high-result");
    });

    test("skips detectors that return null", () => {
      registry.register({
        name: "skip",
        priority: 10,
        detect: () => null,
      });
      registry.register({
        name: "match",
        priority: 5,
        detect: () => "found",
      });

      const result = registry.detect({
        filename: "test.xyz",
        extension: ".xyz",
      });
      expect(result).toBe("found");
    });

    test("falls back to 'image' when all detectors return null", () => {
      registry.register({
        name: "nope",
        priority: 10,
        detect: () => null,
      });

      const result = registry.detect({
        filename: "test.xyz",
        extension: ".xyz",
      });
      expect(result).toBe("image");
    });

    test("falls back to 'image' with no detectors registered", () => {
      const result = registry.detect({
        filename: "test.xyz",
        extension: ".xyz",
      });
      expect(result).toBe("image");
    });
  });
});
