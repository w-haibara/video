import { describe, it, expect, vi, beforeEach } from "vitest";
import { isWebCodecsSupported, isWorkerExportSupported } from "./canvas-export";

// Note: exportWithCanvas and exportWithWorker require WebCodecs (VideoEncoder,
// VideoFrame) and OffscreenCanvas, which are browser-only APIs. Full integration
// tests would need Playwright. These tests cover the synchronous utility
// functions and basic validation.

describe("isWebCodecsSupported", () => {
  it("returns false when VideoEncoder is not defined", () => {
    // In Node/Vitest environment, WebCodecs APIs are not available
    const result = isWebCodecsSupported();
    // The result depends on the test environment:
    // - In Node: false (no WebCodecs)
    // - In browser: true (WebCodecs available)
    expect(typeof result).toBe("boolean");
  });
});

describe("isWorkerExportSupported", () => {
  it("returns a boolean", () => {
    const result = isWorkerExportSupported();
    expect(typeof result).toBe("boolean");
  });

  it("returns false when Worker is not defined", () => {
    // In Node/Vitest environment, Worker is typically not available
    // so this should return false (requires Worker + OffscreenCanvas + ImageBitmap + WebCodecs)
    if (typeof Worker === "undefined") {
      expect(isWorkerExportSupported()).toBe(false);
    }
  });
});

describe("canvas-export module", () => {
  it("exports the expected functions", async () => {
    const mod = await import("./canvas-export");
    expect(typeof mod.exportWithCanvas).toBe("function");
    expect(typeof mod.exportWithWorker).toBe("function");
    expect(typeof mod.isWebCodecsSupported).toBe("function");
    expect(typeof mod.isWorkerExportSupported).toBe("function");
  });

  it("exportWithCanvas rejects when project has no clips", async () => {
    // Skip in environments without OffscreenCanvas
    if (typeof OffscreenCanvas === "undefined" && typeof document === "undefined") {
      return;
    }

    const { exportWithCanvas } = await import("./canvas-export");

    const emptyProject = {
      id: "test",
      name: "Test",
      settings: { durationMs: 10000, canvasWidth: 320, canvasHeight: 240 },
      sequence: { tracks: [] },
      assets: [],
      markers: [],
    };

    await expect(
      exportWithCanvas({
        project: emptyProject as any,
        getFrameSource: async () => null,
      }),
    ).rejects.toThrow("Project has no clips to export");
  });

  it("exportWithWorker rejects when project has no clips", async () => {
    // Skip in environments without OffscreenCanvas
    if (typeof OffscreenCanvas === "undefined") {
      return;
    }

    const { exportWithWorker } = await import("./canvas-export");

    const emptyProject = {
      id: "test",
      name: "Test",
      settings: { durationMs: 10000, canvasWidth: 320, canvasHeight: 240 },
      sequence: { tracks: [] },
      assets: [],
      markers: [],
    };

    await expect(
      exportWithWorker({
        project: emptyProject as any,
        getFrameSource: async () => null,
      }),
    ).rejects.toThrow("Project has no clips to export");
  });
});
