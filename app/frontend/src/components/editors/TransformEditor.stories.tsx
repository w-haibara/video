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
    clipKind: "video",
  },
});

export const WithTransform = meta.story({
  args: {
    clip: mockClip({
      transform: { x: 50, y: -30, scale: 1.5, rotation: 90 },
    }),
    asset: mockAsset({ width: 1920, height: 1080 }),
    clipKind: "video",
  },
});

export const WithCrop = meta.story({
  args: {
    clip: mockClip({
      crop: { x: 100, y: 50, width: 800, height: 600 },
    }),
    asset: mockAsset({ width: 1920, height: 1080 }),
    clipKind: "video",
  },
});

export const WithTransformAndCrop = meta.story({
  args: {
    clip: mockClip({
      transform: { x: 10, y: 20, scale: 2, rotation: 180 },
      crop: { x: 200, y: 100, width: 640, height: 480 },
    }),
    asset: mockAsset({ width: 1920, height: 1080 }),
    clipKind: "video",
  },
});

export const WithFreeRotation = meta.story({
  args: {
    clip: mockClip({
      transform: { rotation: 45 },
    }),
    asset: mockAsset({ width: 1920, height: 1080 }),
    clipKind: "video",
  },
});

export const WithNegativeRotation = meta.story({
  args: {
    clip: mockClip({
      transform: { rotation: -90 },
    }),
    asset: mockAsset({ width: 1920, height: 1080 }),
    clipKind: "video",
  },
});

Default.test("shows rotation controls", async ({ canvas }) => {
  // Reset button (text "0°")
  await canvas.findByTitle("Reset rotation to 0°");
  // Left rotate button (text "↶")
  await canvas.findByTitle("Rotate left -90°");
  // Right rotate button (text "↷")
  await canvas.findByTitle("Rotate right +90°");
  // Rotation label
  await canvas.findByText(/Rotation \(0°\)/);
});

WithCrop.test("shows crop active label", async ({ canvas }) => {
  await canvas.findByText(/Crop.*\(active\)/);
});

WithTransform.test("shows reset button when transform applied", async ({ canvas }) => {
  await canvas.findByRole("button", { name: /Reset Position/ });
});

WithFreeRotation.test("shows rotation value in label", async ({ canvas }) => {
  await canvas.findByText(/Rotation \(45°\)/);
});

WithNegativeRotation.test("shows negative rotation in label", async ({ canvas }) => {
  await canvas.findByText(/Rotation \(-90°\)/);
});
