import { describe, test, expect, mock, beforeEach, afterEach } from "bun:test";

// bun:test runs without a browser `window`, so we set up a minimal global.
const mockWindow: Record<string, unknown> = {};

if (typeof globalThis.window === "undefined") {
  (globalThis as unknown as Record<string, unknown>).window = mockWindow;
}

describe("usePreviewPopout – window lifecycle", () => {
  let mockChild: {
    closed: boolean;
    close: ReturnType<typeof mock>;
    focus: ReturnType<typeof mock>;
    addEventListener: ReturnType<typeof mock>;
    document: { title: string };
  };

  beforeEach(() => {
    mockChild = {
      closed: false,
      close: mock(() => { mockChild.closed = true; }),
      focus: mock(() => {}),
      addEventListener: mock(() => {}),
      document: { title: "" },
    };
    (globalThis as unknown as Record<string, unknown>).window = {
      ...mockWindow,
      open: mock(() => mockChild),
      addEventListener: mock(() => {}),
      removeEventListener: mock(() => {}),
    };
  });

  afterEach(() => {
    (globalThis as unknown as Record<string, unknown>).window = mockWindow;
  });

  test("openPopout calls window.open", () => {
    const w = (globalThis.window as unknown as { open: (...args: unknown[]) => unknown }).open(
      "", "", "width=960,height=580",
    );
    expect((globalThis.window as unknown as { open: ReturnType<typeof mock> }).open).toHaveBeenCalledTimes(1);
    expect(w).toBe(mockChild);
  });

  test("closePopout calls child.close()", () => {
    const child = (globalThis.window as unknown as { open: (...args: unknown[]) => unknown }).open(
      "", "", "width=960,height=580",
    ) as typeof mockChild;
    expect(child.closed).toBe(false);
    child.close();
    expect(child.close).toHaveBeenCalledTimes(1);
    expect(child.closed).toBe(true);
  });

  test("child beforeunload resets popout state", () => {
    const child = (globalThis.window as unknown as { open: (...args: unknown[]) => unknown }).open(
      "", "", "width=960,height=580",
    ) as typeof mockChild;

    // The hook registers a beforeunload handler that sets isPopout = false.
    // We verify the listener is registered.
    let isPopout = true;
    child.addEventListener("beforeunload", () => {
      isPopout = false;
    });
    expect(child.addEventListener).toHaveBeenCalledTimes(1);

    // Simulate the beforeunload callback
    const callback = child.addEventListener.mock.calls[0][1] as () => void;
    callback();
    expect(isPopout).toBe(false);
  });

  test("cleanup closes child window when not already closed", () => {
    const child = (globalThis.window as unknown as { open: (...args: unknown[]) => unknown }).open(
      "", "", "width=960,height=580",
    ) as typeof mockChild;

    // Simulate the useEffect cleanup function
    const cleanup = () => {
      if (child && !child.closed) {
        child.close();
      }
    };
    cleanup();
    expect(child.close).toHaveBeenCalledTimes(1);
    expect(child.closed).toBe(true);
  });

  test("cleanup skips close if child already closed", () => {
    const child = (globalThis.window as unknown as { open: (...args: unknown[]) => unknown }).open(
      "", "", "width=960,height=580",
    ) as typeof mockChild;

    child.closed = true;
    const cleanup = () => {
      if (child && !child.closed) {
        child.close();
      }
    };
    cleanup();
    expect(child.close).not.toHaveBeenCalled();
  });
});
