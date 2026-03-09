import type { Meta, StoryObj } from "@storybook/react";
import { Playhead } from "./Playhead";
import { theme } from "../theme";

const timelineContainer: React.CSSProperties = {
  position: "relative",
  width: 500,
  height: 120,
  background: theme.timelineBg,
  border: `1px solid ${theme.border}`,
  borderRadius: 4,
  overflow: "hidden",
};

const meta: Meta<typeof Playhead> = {
  title: "Components/Playhead",
  component: Playhead,
  decorators: [
    (Story) => (
      <div style={timelineContainer}>
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof Playhead>;

export const Default: Story = {
  args: {
    positionPx: 100,
  },
};

export const AtStart: Story = {
  args: {
    positionPx: 0,
  },
};

export const AtMiddle: Story = {
  args: {
    positionPx: 200,
  },
};
