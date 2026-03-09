import type { Meta, StoryObj } from "@storybook/react";
import { TimelineRuler } from "./TimelineRuler";
import { theme } from "../theme";

const meta: Meta<typeof TimelineRuler> = {
  title: "Components/TimelineRuler",
  component: TimelineRuler,
  decorators: [
    (Story) => (
      <div style={{ overflowX: "auto", background: theme.timelineRuler, padding: "8px 0" }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof TimelineRuler>;

export const Default: Story = {
  args: {
    durationMs: 30000,
    msToPx: (ms: number) => ms / 100,
  },
};

export const Short: Story = {
  args: {
    durationMs: 5000,
    msToPx: (ms: number) => ms / 100,
  },
};

export const Long: Story = {
  args: {
    durationMs: 120000,
    msToPx: (ms: number) => ms / 100,
  },
};
