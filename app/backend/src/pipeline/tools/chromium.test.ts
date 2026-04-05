import { describe, expect, test } from "bun:test";
import { chromiumTool } from "./chromium";

describe("chromiumTool", () => {
  test(
    "launch and close",
    async () => {
      const session = await chromiumTool.launch({ width: 320, height: 240 });
      try {
        expect(session).toBeDefined();
        expect(typeof session.navigate).toBe("function");
        expect(typeof session.evaluate).toBe("function");
        expect(typeof session.captureFrames).toBe("function");
        expect(typeof session.close).toBe("function");
      } finally {
        await session.close();
      }
    },
    { timeout: 10_000 },
  );

  test(
    "navigate and evaluate",
    async () => {
      const session = await chromiumTool.launch({ width: 320, height: 240 });
      try {
        await session.navigate(
          "data:text/html,<html><body><h1>Hello</h1></body></html>",
        );

        const sum = await session.evaluate<number>("1 + 1");
        expect(sum).toBe(2);

        const title = await session.evaluate<string>(
          "document.querySelector('h1').textContent",
        );
        expect(title).toBe("Hello");
      } finally {
        await session.close();
      }
    },
    { timeout: 10_000 },
  );

  test(
    "evaluate propagates errors from evaluated expression",
    async () => {
      const session = await chromiumTool.launch({ width: 320, height: 240 });
      try {
        await session.navigate("data:text/html,<html></html>");
        await expect(
          session.evaluate("throw new Error('test error')"),
        ).rejects.toThrow("evaluate failed");
      } finally {
        await session.close();
      }
    },
    { timeout: 10_000 },
  );

  test(
    "close() can be called twice without error",
    async () => {
      const session = await chromiumTool.launch({ width: 320, height: 240 });
      await session.close();
      await session.close();
    },
    { timeout: 10_000 },
  );

  test(
    "captureFrames returns valid PNGs",
    async () => {
      const session = await chromiumTool.launch({ width: 320, height: 240 });
      try {
        // Navigate to a page with a canvas
        await session.navigate(
          `data:text/html,${encodeURIComponent(`
            <canvas id="c" width="320" height="240"></canvas>
            <script>
              function render(idx) {
                const c = document.getElementById('c');
                const ctx = c.getContext('2d');
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, 320, 240);
                ctx.fillStyle = '#fff';
                ctx.font = '48px monospace';
                ctx.fillText(String(idx), 100, 130);
                return c.toDataURL('image/png');
              }
            </script>
          `)}`,
        );

        const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47]); // \x89PNG
        const frames: Buffer[] = [];

        for await (const frame of session.captureFrames({
          totalFrames: 3,
          fps: 1,
          renderExpression: "render(__frameIndex)",
        })) {
          frames.push(frame);
        }

        expect(frames).toHaveLength(3);
        for (const frame of frames) {
          expect(frame.length).toBeGreaterThan(0);
          // Check PNG magic bytes
          expect(frame.subarray(0, 4).equals(PNG_MAGIC)).toBe(true);
        }
      } finally {
        await session.close();
      }
    },
    { timeout: 10_000 },
  );
});
