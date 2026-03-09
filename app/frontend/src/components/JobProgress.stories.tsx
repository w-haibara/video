import type { Meta, StoryObj } from "@storybook/react";
import type { Job } from "@video/shared";
import { JobProgress } from "./JobProgress";

const baseJob: Job = {
  id: "job-1",
  projectId: "proj-1",
  assetId: "asset-1",
  status: "pending",
  progress: 0,
  createdAt: "2026-01-15T10:00:00Z",
  updatedAt: "2026-01-15T10:00:00Z",
};

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
    job: { ...baseJob, status: "pending", progress: 0 },
  },
};

export const Processing: Story = {
  args: {
    job: { ...baseJob, status: "processing", progress: 0.45 },
  },
};

export const Completed: Story = {
  args: {
    job: { ...baseJob, status: "completed", progress: 1.0 },
  },
};

export const Failed: Story = {
  args: {
    job: {
      ...baseJob,
      status: "failed",
      progress: 0.3,
      error: "Encoding failed: unsupported codec",
    },
  },
};
