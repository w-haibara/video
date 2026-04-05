import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ChromiumSession = {
  /** Load an HTML file (file:// URL) or http URL */
  navigate: (url: string) => Promise<void>;
  /** Execute JS in the page and return the result */
  evaluate: <T>(expression: string, opts?: { timeoutMs?: number }) => Promise<T>;
  /** Capture frames as PNG Buffers via an async generator */
  captureFrames: (opts: {
    totalFrames: number;
    fps: number;
    /** JS expression evaluated per frame. Must return a data URL (e.g. canvas.toDataURL()).
     * The expression receives `__frameIndex` as a variable. */
    renderExpression: string;
    onProgress?: (fraction: number) => void;
  }) => AsyncGenerator<Buffer>;
  /** Close the session and kill the Chromium process */
  close: () => Promise<void>;
};

export type ChromiumTool = {
  /** Launch Chromium and establish CDP connection */
  launch: (opts?: {
    width?: number;
    height?: number;
  }) => Promise<ChromiumSession>;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const CHROMIUM_PATH =
  process.env.CHROMIUM_PATH ?? "/usr/bin/google-chrome-stable";

const LAUNCH_TIMEOUT_MS = 15_000;
const CDP_RESPONSE_TIMEOUT_MS = 10_000;

/**
 * Read from a ReadableStream line-by-line until a predicate matches, or the
 * stream ends / timeout fires.
 */
async function readUntil(
  stream: ReadableStream<Uint8Array>,
  predicate: (line: string) => boolean,
  timeoutMs: number,
): Promise<string> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buf = "";

  return new Promise<string>((resolve, reject) => {
    const timer = setTimeout(() => {
      reader.cancel();
      reject(
        new Error(
          `Timed out waiting for Chromium stderr (${timeoutMs}ms). Buffer so far:\n${buf}`,
        ),
      );
    }, timeoutMs);

    (async () => {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          const lines = buf.split("\n");
          buf = lines.pop() ?? "";
          for (const line of lines) {
            if (predicate(line)) {
              clearTimeout(timer);
              // Cancel reader – we don't need more stderr for detection.
              reader.cancel().catch(() => {});
              resolve(line);
              return;
            }
          }
        }
        // Stream ended without match
        clearTimeout(timer);
        reject(
          new Error(
            `Chromium stderr ended without matching line. Buffer:\n${buf}`,
          ),
        );
      } catch (err) {
        clearTimeout(timer);
        reject(err);
      }
    })();
  });
}

// ---------------------------------------------------------------------------
// CDP message dispatcher
// ---------------------------------------------------------------------------

type PendingCall = {
  resolve: (value: any) => void;
  reject: (err: Error) => void;
};

type EventHandler = (params: any) => void;

function createCdpConnection(ws: WebSocket) {
  let msgId = 0;
  const pending = new Map<number, PendingCall>();
  const eventHandlers = new Map<string, EventHandler[]>();
  const pendingOnce = new Set<(err: Error) => void>();

  function rejectAll(err: Error) {
    for (const p of pending.values()) p.reject(err);
    pending.clear();
    for (const reject of pendingOnce) reject(err);
    pendingOnce.clear();
  }

  ws.addEventListener("message", (ev) => {
    const data = JSON.parse(typeof ev.data === "string" ? ev.data : "{}");
    if (data.id != null) {
      const p = pending.get(data.id);
      if (p) {
        pending.delete(data.id);
        if (data.error) {
          p.reject(
            new Error(`CDP error ${data.error.code}: ${data.error.message}`),
          );
        } else {
          p.resolve(data.result);
        }
      }
    } else if (data.method) {
      const handlers = eventHandlers.get(data.method);
      if (handlers) {
        for (const h of handlers) h(data.params);
      }
    }
  });

  ws.addEventListener("error", (ev) => {
    rejectAll(new Error(`CDP WebSocket error: ${String(ev)}`));
  });

  ws.addEventListener("close", () => {
    rejectAll(new Error("CDP WebSocket closed"));
  });

  function send(
    method: string,
    params?: Record<string, unknown>,
    timeoutMs?: number,
  ): Promise<any> {
    const timeout = timeoutMs ?? CDP_RESPONSE_TIMEOUT_MS;
    return new Promise((resolve, reject) => {
      const id = ++msgId;
      const timer = setTimeout(() => {
        pending.delete(id);
        reject(new Error(`CDP call ${method} timed out (${timeout}ms)`));
      }, timeout);

      pending.set(id, {
        resolve: (value: any) => {
          clearTimeout(timer);
          resolve(value);
        },
        reject: (err: Error) => {
          clearTimeout(timer);
          reject(err);
        },
      });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  function on(event: string, handler: EventHandler) {
    const list = eventHandlers.get(event) ?? [];
    list.push(handler);
    eventHandlers.set(event, list);
  }

  function once(event: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const list = eventHandlers.get(event) ?? [];
      const handler = (params: any) => {
        const idx = list.indexOf(handler);
        if (idx >= 0) list.splice(idx, 1);
        pendingOnce.delete(reject);
        resolve(params);
      };
      list.push(handler);
      eventHandlers.set(event, list);
      pendingOnce.add(reject);
    });
  }

  return { send, on, once };
}

// ---------------------------------------------------------------------------
// WebSocket open helper
// ---------------------------------------------------------------------------

function openWebSocket(url: string): Promise<WebSocket> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url);
    ws.addEventListener("open", () => resolve(ws), { once: true });
    ws.addEventListener("error", (ev) => reject(new Error(`WS connect failed: ${String(ev)}`)), {
      once: true,
    });
  });
}

// ---------------------------------------------------------------------------
// chromiumTool
// ---------------------------------------------------------------------------

export const chromiumTool: ChromiumTool = {
  async launch(opts) {
    const width = opts?.width ?? 1920;
    const height = opts?.height ?? 1080;
    const userDataDir = await mkdtemp(join(tmpdir(), "chromium-cdp-"));

    const args = [
      "--headless=new",
      "--disable-gpu",
      "--no-sandbox",
      "--disable-dev-shm-usage",
      "--remote-debugging-port=0",
      `--user-data-dir=${userDataDir}`,
      `--window-size=${width},${height}`,
    ];

    const proc = Bun.spawn([CHROMIUM_PATH, ...args], {
      stdout: "ignore",
      stderr: "pipe",
    });

    let browserWsUrl: string;
    try {
      const line = await readUntil(
        proc.stderr as ReadableStream<Uint8Array>,
        (l) => l.includes("DevTools listening on ws://"),
        LAUNCH_TIMEOUT_MS,
      );
      const match = line.match(/ws:\/\/[^\s]+/);
      if (!match) throw new Error(`Could not parse WS URL from: ${line}`);
      browserWsUrl = match[0];
    } catch (err) {
      proc.kill();
      await rm(userDataDir, { recursive: true, force: true }).catch(() => {});
      throw err;
    }

    // Discover the first page target via the /json endpoint.
    // Chromium may not have registered the page target immediately after
    // emitting "DevTools listening", so poll with retries.
    let ws: WebSocket;
    try {
      const debugPort = new URL(browserWsUrl).port;
      const jsonUrl = `http://127.0.0.1:${debugPort}/json`;
      let pageTarget: { type: string; webSocketDebuggerUrl: string } | undefined;
      for (let attempt = 0; attempt < 20; attempt++) {
        const targetsRes = await fetch(jsonUrl);
        const targets: { type: string; webSocketDebuggerUrl: string }[] =
          await targetsRes.json();
        pageTarget = targets.find((t) => t.type === "page");
        if (pageTarget) break;
        await new Promise((r) => setTimeout(r, 100));
      }
      if (!pageTarget) throw new Error("No page target found after retries");
      ws = await openWebSocket(pageTarget.webSocketDebuggerUrl);
    } catch (err) {
      proc.kill();
      await rm(userDataDir, { recursive: true, force: true }).catch(() => {});
      throw err;
    }
    const cdp = createCdpConnection(ws);

    // Enable Page domain
    await cdp.send("Page.enable");

    // -----------------------------------------------------------------------
    // Session methods
    // -----------------------------------------------------------------------

    const navigate = async (url: string): Promise<void> => {
      const loadPromise = Promise.race([
        cdp.once("Page.loadEventFired"),
        new Promise<never>((_, reject) =>
          setTimeout(
            () => reject(new Error(`navigate timed out: ${url}`)),
            CDP_RESPONSE_TIMEOUT_MS,
          ),
        ),
      ]);
      await cdp.send("Page.navigate", { url });
      await loadPromise;
    };

    const evaluate = async <T>(expression: string, evalOpts?: { timeoutMs?: number }): Promise<T> => {
      const result = await cdp.send("Runtime.evaluate", {
        expression,
        returnByValue: true,
        awaitPromise: true,
      }, evalOpts?.timeoutMs);
      if (result.exceptionDetails) {
        const desc =
          result.exceptionDetails.exception?.description ??
          result.exceptionDetails.text;
        throw new Error(`evaluate failed: ${desc}`);
      }
      return result.result.value as T;
    };

    async function* captureFrames(captureOpts: {
      totalFrames: number;
      fps: number;
      renderExpression: string;
      onProgress?: (fraction: number) => void;
    }): AsyncGenerator<Buffer> {
      for (let i = 0; i < captureOpts.totalFrames; i++) {
        // Set frame index and execute render in a single IIFE to avoid
        // __frameIndex races when multiple captureFrames run concurrently.
        const result = await cdp.send("Runtime.evaluate", {
          expression: `(async () => { var __frameIndex = ${i}; return (${captureOpts.renderExpression}); })()`,
          returnByValue: true,
          awaitPromise: true,
        });
        if (result.exceptionDetails) {
          const desc =
            result.exceptionDetails.exception?.description ??
            result.exceptionDetails.text;
          throw new Error(`captureFrames render failed at frame ${i}: ${desc}`);
        }
        const dataUrl = result.result.value;
        if (
          typeof dataUrl !== "string" ||
          !dataUrl.startsWith("data:image/png;base64,")
        ) {
          throw new Error(
            `captureFrames: expected PNG data URL at frame ${i}, got: ${String(dataUrl).slice(0, 80)}`,
          );
        }
        const base64 = dataUrl.slice("data:image/png;base64,".length);
        yield Buffer.from(base64, "base64");
        captureOpts.onProgress?.((i + 1) / captureOpts.totalFrames);
      }
    }

    const close = async (): Promise<void> => {
      try {
        ws.close();
      } catch {
        // ignore
      }
      try {
        proc.kill();
      } catch {
        // ignore
      }
      await rm(userDataDir, { recursive: true, force: true }).catch(() => {});
    };

    return { navigate, evaluate, captureFrames, close };
  },
};
