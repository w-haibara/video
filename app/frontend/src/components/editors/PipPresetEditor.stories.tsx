import { expect, fn } from "storybook/test";
import preview from "../../../.storybook/preview";
import { mockAsset, mockClip } from "../../stories/fixtures";
import { PipPresetEditor } from "./PipPresetEditor";

const meta = preview.meta({
  title: "Components/editors/PipPresetEditor",
  component: PipPresetEditor,
  args: {
    asset: mockAsset(),
    clipKind: "video",
    projectId: "proj-1",
    onUpdate: fn(),
    onSetTransition: fn(),
  },
  decorators: [
    (Story) => (
      <div style={{ padding: "12px", width: "280px", background: "#222" }}>
        <Story />
      </div>
    ),
  ],
});

export const Default = meta.story({
  args: {
    clip: mockClip(),
  },
});

export const CornerActive = meta.story({
  args: {
    clip: mockClip({
      transform: { x: 500, y: 250, scale: 0.3, rotation: 0 },
    }),
  },
});

export const SideBySideActive = meta.story({
  args: {
    clip: mockClip({
      transform: { x: -480, y: 0, scale: 0.5, rotation: 0 },
    }),
  },
});

Default.test("renders PiP label", async ({ canvas }) => {
  await canvas.findByText(/PiP Presets/);
});

Default.test("renders all 6 preset buttons", async ({ canvas }) => {
  await canvas.findByText(/PiP Presets/);
  expect(canvas.getAllByRole("button").length).toBe(6);
});

Default.test("buttons have preset titles", async ({ canvas }) => {
  await canvas.findByTitle("Top-Left");
  await canvas.findByTitle("Top-Right");
  await canvas.findByTitle("Bottom-Left");
  await canvas.findByTitle("Bottom-Right");
  await canvas.findByTitle("Side by Side");
  await canvas.findByTitle("Top / Bottom");
});

Default.test("clicking Top-Left calls onUpdate with transform", async ({ canvas, userEvent, args }) => {
  const button = canvas.getByTitle("Top-Left");
  await userEvent.click(button);
  expect(args.onUpdate).toHaveBeenCalledWith(
    expect.objectContaining({
      transform: expect.objectContaining({ scale: 0.3 }),
    }),
  );
});
