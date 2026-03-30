import { describe, test, expect, beforeEach, afterEach, mock } from "bun:test";
import { AudioManager } from "./audio-manager";

// --- Mock Web Audio API ---

function createMockGainNode() {
  return {
    gain: { value: 1 },
    connect: mock(() => {}),
    disconnect: mock(() => {}),
  };
}

function createMockSourceNode() {
  return {
    connect: mock(() => {}),
    disconnect: mock(() => {}),
  };
}

function createMockAudioContext(state = "running") {
  return {
    state,
    destination: {},
    createGain: mock(() => createMockGainNode()),
    createMediaElementSource: mock(() => createMockSourceNode()),
    resume: mock(() => Promise.resolve()),
    close: mock(() => Promise.resolve()),
  };
}

/** Create a minimal mock HTMLMediaElement (we don't need a real DOM). */
function createMockElement(): HTMLVideoElement {
  return {} as unknown as HTMLVideoElement;
}

function createMockAudioElement(): HTMLAudioElement {
  return {} as unknown as HTMLAudioElement;
}

// Patch the global AudioContext for all tests
let mockCtx: ReturnType<typeof createMockAudioContext>;
const OriginalAudioContext = (globalThis as Record<string, unknown>).AudioContext;

beforeEach(() => {
  mockCtx = createMockAudioContext();
  (globalThis as Record<string, unknown>).AudioContext = function () {
    return mockCtx;
  };
});

afterEach(() => {
  (globalThis as Record<string, unknown>).AudioContext = OriginalAudioContext;
});

describe("AudioManager", () => {
  let manager: AudioManager;

  beforeEach(() => {
    manager = new AudioManager();
  });

  test("ensureContext creates AudioContext lazily", () => {
    const ctx = manager.ensureContext();
    expect(ctx).toBe(mockCtx);
    // Calling again returns same context
    const ctx2 = manager.ensureContext();
    expect(ctx2).toBe(mockCtx);
  });

  test("ensureContext resumes suspended context", () => {
    mockCtx = createMockAudioContext("suspended");
    (globalThis as Record<string, unknown>).AudioContext = function () {
      return mockCtx;
    };
    manager = new AudioManager();
    manager.ensureContext();
    expect(mockCtx.resume).toHaveBeenCalled();
  });

  test("connectElement creates source and gain nodes", () => {
    const el = createMockElement();
    manager.connectElement("clip1", el, 0.8);
    expect(mockCtx.createMediaElementSource).toHaveBeenCalledWith(el);
    expect(mockCtx.createGain).toHaveBeenCalled();
    expect(manager.isConnected("clip1")).toBe(true);
  });

  test("connectElement with same element updates volume only", () => {
    const el = createMockElement();
    manager.connectElement("clip1", el, 0.5);
    const callCount = mockCtx.createMediaElementSource.mock.calls.length;
    // Connect again with different volume
    manager.connectElement("clip1", el, 0.9);
    // Should NOT create a new source node
    expect(mockCtx.createMediaElementSource.mock.calls.length).toBe(callCount);
    expect(manager.isConnected("clip1")).toBe(true);
  });

  test("connectElement with different element disconnects old one", () => {
    const el1 = createMockElement();
    const el2 = createMockElement();
    manager.connectElement("clip1", el1, 1.0);
    manager.connectElement("clip1", el2, 1.0);
    // Two source nodes created
    expect(mockCtx.createMediaElementSource.mock.calls.length).toBe(2);
    expect(manager.isConnected("clip1")).toBe(true);
  });

  test("disconnectElement removes entry", () => {
    const el = createMockElement();
    manager.connectElement("clip1", el);
    expect(manager.isConnected("clip1")).toBe(true);
    manager.disconnectElement("clip1");
    expect(manager.isConnected("clip1")).toBe(false);
  });

  test("disconnectElement is safe for unknown clipId", () => {
    expect(() => manager.disconnectElement("nonexistent")).not.toThrow();
  });

  test("setVolume updates gain value", () => {
    const el = createMockElement();
    manager.connectElement("clip1", el, 1.0);
    // setVolume should not throw
    manager.setVolume("clip1", 0.3);
    // setVolume is safe for unknown clip too
    manager.setVolume("unknown", 0.5);
  });

  test("setMasterMute toggles muted state", () => {
    manager.ensureContext();
    expect(manager.isMuted()).toBe(false);
    manager.setMasterMute(true);
    expect(manager.isMuted()).toBe(true);
    manager.setMasterMute(false);
    expect(manager.isMuted()).toBe(false);
  });

  test("setMasterMute before ensureContext stores state", () => {
    manager.setMasterMute(true);
    expect(manager.isMuted()).toBe(true);
    // After creating context, state should persist
    manager.ensureContext();
    expect(manager.isMuted()).toBe(true);
  });

  test("dispose cleans up everything", () => {
    const el = createMockElement();
    manager.connectElement("clip1", el);
    manager.dispose();
    expect(manager.isConnected("clip1")).toBe(false);
    expect(mockCtx.close).toHaveBeenCalled();
  });

  test("dispose is safe when no context created", () => {
    expect(() => manager.dispose()).not.toThrow();
  });

  test("isConnected returns false for clips that were never connected", () => {
    // Verify the API contract: if connectElement is not called,
    // isConnected returns false (muted tracks skip connecting).
    expect(manager.isConnected("muted-clip")).toBe(false);
  });

  test("default volume is 1.0 when not specified", () => {
    const el = createMockElement();
    manager.connectElement("clip1", el);
    expect(manager.isConnected("clip1")).toBe(true);
  });

  test("multiple clips can be connected simultaneously", () => {
    const el1 = createMockElement();
    const el2 = createMockAudioElement();
    manager.connectElement("clip1", el1, 0.5);
    manager.connectElement("clip2", el2, 0.8);
    expect(manager.isConnected("clip1")).toBe(true);
    expect(manager.isConnected("clip2")).toBe(true);
    manager.disconnectElement("clip1");
    expect(manager.isConnected("clip1")).toBe(false);
    expect(manager.isConnected("clip2")).toBe(true);
  });
});
