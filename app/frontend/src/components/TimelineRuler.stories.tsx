import { expect } from "storybook/test";
import preview from "../../.storybook/preview";
import { storyMsToPx } from "../stories/fixtures";
import { theme } from "../theme";
import { TimelineRuler } from "./TimelineRuler";

const meta = preview.meta({
  title: "Components/TimelineRuler",
  component: TimelineRuler,
  decorators: [
    (Story) => (
      <div style={{ overflowX: "auto", background: theme.timelineRuler, padding: "8px 0" }}>
        <Story />
      </div>
    ),
  ],
  args: {
    msToPx: storyMsToPx,
  },
});

export const Default = meta.story({
  args: {
    durationMs: 30000,
  },
});

export const Short = meta.story({
  args: {
    durationMs: 5000,
  },
});

export const Long = meta.story({
  args: {
    durationMs: 120000,
  },
});

Default.test("renders time markers for default duration", async ({ canvas }) => {
  await canvas.findByText(/0:00/);
});

Short.test("renders time markers for short duration", async ({ canvas }) => {
  await canvas.findByText(/0:00/);
});

Long.test("renders time markers for long duration", async ({ canvas }) => {
  await canvas.findByText(/0:00/);
});
