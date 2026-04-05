import { expect } from "storybook/test";
import preview from "../../../.storybook/preview";
import { ChromaKeyOverlay } from "./ChromaKeyOverlay";

const meta = preview.meta({
  title: "Components/renderers/ChromaKeyOverlay",
  component: ChromaKeyOverlay,
  decorators: [
    (Story) => (
      <div
        style={{
          position: "relative",
          width: "320px",
          height: "180px",
          background: "#111",
        }}
      >
        <Story />
      </div>
    ),
  ],
});

export const NoMedia = meta.story({
  args: {
    mediaElement: null,
    chromaKey: { color: "#00ff00", similarity: 0.3, blend: 0.1 },
    width: 320,
    height: 180,
  },
});

export const GreenScreen = meta.story({
  args: {
    mediaElement: null,
    chromaKey: { color: "#00ff00", similarity: 0.3, blend: 0.1 },
    width: 320,
    height: 180,
  },
});

export const BlueScreen = meta.story({
  args: {
    mediaElement: null,
    chromaKey: { color: "#0000ff", similarity: 0.5, blend: 0.2 },
    width: 320,
    height: 180,
  },
});

export const StrongBlend = meta.story({
  args: {
    mediaElement: null,
    chromaKey: { color: "#00ff00", similarity: 0.2, blend: 0.8 },
    width: 320,
    height: 180,
  },
});

NoMedia.test("renders a canvas element", async ({ canvasElement }) => {
  const canvasEl = canvasElement.querySelector("canvas");
  expect(canvasEl).toBeTruthy();
});

GreenScreen.test("canvas has correct dimensions", async ({ canvasElement }) => {
  const c = canvasElement.querySelector("canvas") as HTMLCanvasElement | null;
  expect(c).toBeTruthy();
  if (c) expect(c.width).toBe(320);
});
