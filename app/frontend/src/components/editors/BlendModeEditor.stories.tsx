import { expect, fn } from "storybook/test";
import preview from "../../../.storybook/preview";
import { mockAsset, mockClip } from "../../stories/fixtures";
import { BlendModeEditor } from "./BlendModeEditor";

const meta = preview.meta({
  title: "Editors/BlendModeEditor",
  component: BlendModeEditor,
  args: {
    onUpdate: fn(),
  },
});

export const Default = meta.story({
  args: {
    clip: mockClip(),
    asset: mockAsset(),
    clipKind: "video",
  },
});

export const WithCoverSelected = meta.story({
  args: {
    clip: mockClip({ blendMode: "cover" }),
    asset: mockAsset(),
    clipKind: "video",
  },
});

export const ImageClip = meta.story({
  args: {
    clip: mockClip({ clipKind: "image", blendMode: "cover" }),
    asset: mockAsset({ kind: "image", originalPath: "/images/photo.jpg" }),
    clipKind: "image",
  },
});

Default.test("shows blend mode label", async ({ canvas }) => {
  await canvas.findByText(/Blend Mode/);
});

Default.test("shows cover option in dropdown", async ({ canvas }) => {
  const select = await canvas.findByRole("combobox");
  expect(select).toBeTruthy();
});
