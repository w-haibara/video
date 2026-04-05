import { expect, fn } from "storybook/test";
import preview from "../../../.storybook/preview";
import { mockAsset, mockClip } from "../../stories/fixtures";
import { SpeedEditor } from "./SpeedEditor";

const meta = preview.meta({
  title: "Components/editors/SpeedEditor",
  component: SpeedEditor,
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

export const Normal = meta.story({
  args: {
    clip: mockClip(),
  },
});

export const SlowMotion = meta.story({
  args: {
    clip: mockClip({ speed: 0.5, durationMs: 10000 }),
  },
});

export const FastForward = meta.story({
  args: {
    clip: mockClip({ speed: 2, durationMs: 2500 }),
  },
});

Normal.test("shows speed label 1x", async ({ canvas }) => {
  await canvas.findByText(/Speed: 1x/);
});

Normal.test("renders 6 preset buttons plus Custom", async ({ canvas }) => {
  const buttons = await canvas.findAllByRole("button");
  expect(buttons.length).toBeGreaterThanOrEqual(7);
});

Normal.test("has Custom button", async ({ canvas }) => {
  await canvas.findByRole("button", { name: /Custom/ });
});

Normal.test("shows duration", async ({ canvas }) => {
  await canvas.findByText(/Duration:/);
});

Normal.test(
  "clicking 2x button calls onUpdate",
  async ({ canvas, userEvent, args }) => {
    const button = await canvas.findByRole("button", { name: /^2x$/ });
    await userEvent.click(button);
    expect(args.onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ speed: 2 }),
    );
  },
);

SlowMotion.test("shows 0.5x label", async ({ canvas }) => {
  await canvas.findByText(/Speed: 0\.5x/);
});

FastForward.test("shows 2x label", async ({ canvas }) => {
  await canvas.findByText(/Speed: 2x/);
});
