import type { Meta, StoryObj } from "@storybook/react";
import { mockJob } from "../stories/fixtures";
import { JobProgress } from "./JobProgress";

const meta: Meta<typeof JobProgress> = {
  title: "Components/JobProgress",
  component: JobProgress,
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 300, padding: 16 }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof JobProgress>;

export const Pending: Story = {
  args: {
    job: mockJob({ status: "pending", progress: 0 }),
  },
};

export const Processing: Story = {
  args: {
    job: mockJob({ status: "processing", progress: 0.45 }),
  },
};

export const Completed: Story = {
  args: {
    job: mockJob({ status: "completed", progress: 1.0 }),
  },
};

export const Failed: Story = {
  args: {
    job: mockJob({
      status: "failed",
      progress: 0.3,
      error: "Encoding failed: unsupported codec",
    }),
  },
};
