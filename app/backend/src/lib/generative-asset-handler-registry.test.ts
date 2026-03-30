import { describe, test, expect } from "bun:test";
import { GenerativeAssetHandlerRegistry } from "./generative-asset-handler-registry";

describe("GenerativeAssetHandlerRegistry", () => {
  test("has returns false for unregistered kind", () => {
    const registry = new GenerativeAssetHandlerRegistry();
    expect(registry.has("unknown")).toBe(false);
  });

  test("has returns true after registration", () => {
    const registry = new GenerativeAssetHandlerRegistry();
    registry.register({
      assetKind: "p5js",
      prepare: async () => {},
    });
    expect(registry.has("p5js")).toBe(true);
  });

  test("get returns undefined for unregistered kind", () => {
    const registry = new GenerativeAssetHandlerRegistry();
    expect(registry.get("unknown")).toBeUndefined();
  });

  test("get returns handler after registration", () => {
    const registry = new GenerativeAssetHandlerRegistry();
    const handler = {
      assetKind: "p5js",
      defaultDurationMs: 5000,
      prepare: async () => {},
    };
    registry.register(handler);
    expect(registry.get("p5js")).toBe(handler);
  });

  test("register overwrites existing handler for same kind", () => {
    const registry = new GenerativeAssetHandlerRegistry();
    const handler1 = { assetKind: "p5js", prepare: async () => {} };
    const handler2 = {
      assetKind: "p5js",
      defaultDurationMs: 3000,
      prepare: async () => {},
    };
    registry.register(handler1);
    registry.register(handler2);
    expect(registry.get("p5js")).toBe(handler2);
  });

  test("multiple handlers can be registered for different kinds", () => {
    const registry = new GenerativeAssetHandlerRegistry();
    const p5jsHandler = { assetKind: "p5js", prepare: async () => {} };
    const glslHandler = { assetKind: "glsl", prepare: async () => {} };
    registry.register(p5jsHandler);
    registry.register(glslHandler);
    expect(registry.has("p5js")).toBe(true);
    expect(registry.has("glsl")).toBe(true);
    expect(registry.get("p5js")).toBe(p5jsHandler);
    expect(registry.get("glsl")).toBe(glslHandler);
  });
});
