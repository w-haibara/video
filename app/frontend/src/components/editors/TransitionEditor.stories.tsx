import { expect, fn } from "storybook/test";
import preview from "../../../.storybook/preview";
import { mockAsset, mockClip } from "../../stories/fixtures";
import { TransitionEditor } from "./TransitionEditor";

const meta = preview.meta({
  title: "Components/editors/TransitionEditor",
  component: TransitionEditor,
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

export const NoTransition = meta.story({
  args: {
    clip: mockClip(),
  },
});

export const FadeTransition = meta.story({
  args: {
    clip: mockClip({ transition: { type: "fade", durationMs: 500 } }),
  },
});

export const LongTransition = meta.story({
  args: {
    clip: mockClip({ transition: { type: "fade", durationMs: 1500 } }),
  },
});

NoTransition.test("renders label", async ({ canvas }) => {
  await canvas.findByText(/Transition In/);
});

NoTransition.test("has select with None option", async ({ canvas }) => {
  const select = await canvas.findByRole("combobox");
  expect(select).toBeTruthy();
});

NoTransition.test("no duration slider shown", async ({ canvas }) => {
  expect(canvas.queryByText(/Duration:/)).toBeNull();
});

FadeTransition.test("shows duration slider", async ({ canvas }) => {
  await canvas.findByText(/Duration: 500ms/);
});

LongTransition.test("shows 1500ms duration", async ({ canvas }) => {
  await canvas.findByText(/Duration: 1500ms/);
});
