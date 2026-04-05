import { expect } from "storybook/test";
import preview from "../../../.storybook/preview";
import { GrainOverlay } from "./GrainOverlay";

const meta = preview.meta({
  title: "Components/renderers/GrainOverlay",
  component: GrainOverlay,
  decorators: [
    (Story) => (
      <div
        style={{
          position: "relative",
          width: "320px",
          height: "180px",
          background: "#333",
        }}
      >
        <Story />
      </div>
    ),
  ],
});

export const Subtle = meta.story({
  args: { width: 320, height: 180, strength: 0.2 },
});

export const Medium = meta.story({
  args: { width: 320, height: 180, strength: 0.5 },
});

export const Strong = meta.story({
  args: { width: 320, height: 180, strength: 0.9 },
});

Subtle.test("renders canvas", async ({ canvasElement }) => {
  const c = canvasElement.querySelector("canvas");
  expect(c).toBeTruthy();
});

Strong.test("canvas opacity matches strength", async ({ canvasElement }) => {
  const c = canvasElement.querySelector("canvas") as HTMLCanvasElement;
  expect(c).toBeTruthy();
  expect(parseFloat(c.style.opacity)).toBeCloseTo(0.9);
});
