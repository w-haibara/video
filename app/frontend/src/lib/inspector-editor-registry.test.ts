import { describe, test, expect, beforeEach } from "bun:test";
import { InspectorEditorRegistry } from "./inspector-editor-registry";
import type { InspectorEditorContext, InspectorEditorPlugin } from "./inspector-editor-registry";
import { inspectorEditorRegistry } from "./inspector-editor-registry";

const dummyComponent = (() => null) as unknown as React.ComponentType<InspectorEditorContext>;

function makeCtx(overrides: Partial<InspectorEditorContext> = {}): InspectorEditorContext {
  return {
    clip: { id: "c1", assetId: "a1", startMs: 0, durationMs: 5000, inMs: 0, outMs: 5000 },
    asset: { id: "a1", kind: "video", originalPath: "/test.mp4", durationMs: 10000 },
    clipKind: "video",
    projectId: "proj-1",
    onUpdate: () => {},
    ...overrides,
  };
}

describe("InspectorEditorRegistry", () => {
  test("builtin plugin registers editors", () => {
    const ctx = makeCtx();
    const editors = inspectorEditorRegistry.getEditorsFor(ctx);
    expect(editors.length).toBeGreaterThan(0);
  });

  describe("isolated instance", () => {
    let registry: InspectorEditorRegistry;

    beforeEach(() => {
      registry = new InspectorEditorRegistry();
    });

    test("getEditorsFor filters by canHandle", () => {
      registry.register({
        id: "editor-a",
        label: "A",
        order: 1,
        canHandle: () => true,
        Component: dummyComponent,
      });
      registry.register({
        id: "editor-b",
        label: "B",
        order: 2,
        canHandle: () => false,
        Component: dummyComponent,
      });

      const editors = registry.getEditorsFor(makeCtx());
      expect(editors.length).toBe(1);
      expect(editors[0].id).toBe("editor-a");
    });

    test("getEditorsFor sorts by order ascending", () => {
      registry.register({
        id: "high",
        label: "High",
        order: 10,
        canHandle: () => true,
        Component: dummyComponent,
      });
      registry.register({
        id: "low",
        label: "Low",
        order: 1,
        canHandle: () => true,
        Component: dummyComponent,
      });
      registry.register({
        id: "mid",
        label: "Mid",
        order: 5,
        canHandle: () => true,
        Component: dummyComponent,
      });

      const editors = registry.getEditorsFor(makeCtx());
      expect(editors.map((e) => e.id)).toEqual(["low", "mid", "high"]);
    });

    test("getEditorsFor returns empty when no editors match", () => {
      registry.register({
        id: "never",
        label: "Never",
        order: 1,
        canHandle: () => false,
        Component: dummyComponent,
      });
      expect(registry.getEditorsFor(makeCtx())).toEqual([]);
    });

    test("canHandle receives correct context", () => {
      const calls: InspectorEditorContext[] = [];
      registry.register({
        id: "spy",
        label: "Spy",
        order: 1,
        canHandle: (ctx) => {
          calls.push(ctx);
          return false;
        },
        Component: dummyComponent,
      });

      const ctx = makeCtx({ clipKind: "audio" });
      registry.getEditorsFor(ctx);
      expect(calls.length).toBe(1);
      expect(calls[0].clipKind).toBe("audio");
    });
  });
});
