import { fn } from "storybook/test";
import preview from "../../../.storybook/preview";
import { mockAsset, mockClip } from "../../stories/fixtures";
import { TransformEditor } from "./TransformEditor";

const meta = preview.meta({
  title: "Editors/TransformEditor",
  component: TransformEditor,
  args: {
    onUpdate: fn(),
  },
});

export const Default = meta.story({
  args: {
    clip: mockClip(),
    asset: mockAsset({ width: 1920, height: 1080 }),
    trackKind: "video",
  },
});

export const WithTransform = meta.story({
  args: {
    clip: mockClip({
      transform: { x: 50, y: -30, scale: 1.5, rotation: 90 },
    }),
    asset: mockAsset({ width: 1920, height: 1080 }),
    trackKind: "video",
  },
});

export const WithCrop = meta.story({
  args: {
    clip: mockClip({
      crop: { x: 100, y: 50, width: 800, height: 600 },
    }),
    asset: mockAsset({ width: 1920, height: 1080 }),
    trackKind: "video",
  },
});

export const WithTransformAndCrop = meta.story({
  args: {
    clip: mockClip({
      transform: { x: 10, y: 20, scale: 2, rotation: 180 },
      crop: { x: 200, y: 100, width: 640, height: 480 },
    }),
    asset: mockAsset({ width: 1920, height: 1080 }),
    trackKind: "video",
  },
});

Default.test("shows rotation buttons", async ({ canvas }) => {
  await canvas.findByRole("button", { name: "0°" });
  await canvas.findByRole("button", { name: "90°" });
  await canvas.findByRole("button", { name: "180°" });
  await canvas.findByRole("button", { name: "270°" });
});

WithCrop.test("shows crop active label", async ({ canvas }) => {
  await canvas.findByText(/Crop.*\(active\)/);
});

WithTransform.test("shows reset button when transform applied", async ({ canvas }) => {
  await canvas.findByRole("button", { name: /Reset Position/ });
});
