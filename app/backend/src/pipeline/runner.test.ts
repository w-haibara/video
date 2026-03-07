import { describe, test, expect } from "bun:test";
import { registerStep, definePipeline } from "./registry";
import { runPipeline } from "./runner";
import type { PipelineContext, PipelineStep } from "./types";

function makeCtx(kind: "video" | "image" | "audio" = "video"): PipelineContext {
  return {
    asset: { id: "a1", kind, originalPath: "assets/test.mp4" },
    projectDir: "/tmp/test",
    projectId: "p1",
    shared: new Map(),
    reportProgress: () => {},
  };
}

describe("pipeline runner", () => {
  test("runs steps in order", async () => {
    const order: string[] = [];

    registerStep({
      name: "test-step-1",
      canHandle: () => true,
      execute: async () => { order.push("step-1"); },
    });
    registerStep({
      name: "test-step-2",
      canHandle: () => true,
      execute: async () => { order.push("step-2"); },
    });
    definePipeline("video", ["test-step-1", "test-step-2"]);

    await runPipeline("video", makeCtx());
    expect(order).toEqual(["step-1", "step-2"]);
  });

  test("skips steps where canHandle returns false", async () => {
    const executed: string[] = [];

    registerStep({
      name: "test-always",
      canHandle: () => true,
      execute: async () => { executed.push("always"); },
    });
    registerStep({
      name: "test-never",
      canHandle: () => false,
      execute: async () => { executed.push("never"); },
    });
    definePipeline("video", ["test-always", "test-never"]);

    await runPipeline("video", makeCtx());
    expect(executed).toEqual(["always"]);
  });

  test("reports progress correctly", async () => {
    const progress: Array<{ overall: number; step: string }> = [];

    registerStep({
      name: "test-prog-1",
      canHandle: () => true,
      execute: async () => {},
    });
    registerStep({
      name: "test-prog-2",
      canHandle: () => true,
      execute: async () => {},
    });
    definePipeline("video", ["test-prog-1", "test-prog-2"]);

    await runPipeline("video", makeCtx(), (overall, step) => {
      progress.push({ overall, step });
    });

    // Should have progress reports: 0, 0.5, 1.0
    expect(progress.length).toBeGreaterThanOrEqual(3);
    expect(progress[progress.length - 1].overall).toBe(1.0);
    expect(progress[progress.length - 1].step).toBe("done");
  });

  test("propagates step errors", async () => {
    registerStep({
      name: "test-error",
      canHandle: () => true,
      execute: async () => { throw new Error("step failed"); },
    });
    definePipeline("video", ["test-error"]);

    await expect(runPipeline("video", makeCtx())).rejects.toThrow("step failed");
  });
});
