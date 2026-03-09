import { expect } from "storybook/test";
import preview from "../../.storybook/preview";
import { mockJob } from "../stories/fixtures";
import { JobProgress } from "./JobProgress";

const meta = preview.meta({
  title: "Components/JobProgress",
  component: JobProgress,
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 300, padding: 16 }}>
        <Story />
      </div>
    ),
  ],
});

export const Pending = meta.story({
  args: {
    job: mockJob({ status: "pending", progress: 0 }),
  },
});

export const Processing = meta.story({
  args: {
    job: mockJob({ status: "processing", progress: 0.45 }),
  },
});

export const Completed = meta.story({
  args: {
    job: mockJob({ status: "completed", progress: 1.0 }),
  },
});

export const Failed = meta.story({
  args: {
    job: mockJob({
      status: "failed",
      progress: 0.3,
      error: "Encoding failed: unsupported codec",
    }),
  },
});

Pending.test("renders pending state", async ({ canvas }) => {
  await canvas.findByText(/pending/);
});

Processing.test("renders processing percentage", async ({ canvas }) => {
  await canvas.findByText(/45%/);
});

Completed.test("renders completed state", async ({ canvas }) => {
  await canvas.findByText(/completed/);
});

Failed.test("renders failed state", async ({ canvas }) => {
  await canvas.findByText(/failed/);
});
