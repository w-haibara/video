import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { QueryClientProvider } from "@tanstack/react-query";
import { createStoryQueryClient, mockAsset } from "../stories/fixtures";
import { AssetThumbnail } from "./AssetThumbnail";

const meta: Meta<typeof AssetThumbnail> = {
  title: "Components/AssetThumbnail",
  component: AssetThumbnail,
  decorators: [
    (Story) => (
      <QueryClientProvider client={createStoryQueryClient()}>
        <div style={{ width: 160 }}>
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
  args: {
    projectId: "proj-1",
    onAddToTimeline: fn(),
    onDelete: fn(),
    onJobComplete: fn(),
  },
};
export default meta;

type Story = StoryObj<typeof AssetThumbnail>;

export const Ready: Story = {
  args: {
    asset: mockAsset(),
    jobId: null,
    isInUse: false,
  },
};

export const Importing: Story = {
  args: {
    asset: mockAsset({
      proxyPath: undefined,
      thumbnailPath: undefined,
    }),
    jobId: "job-1",
    isInUse: false,
  },
};

export const InUse: Story = {
  args: {
    asset: mockAsset(),
    jobId: null,
    isInUse: true,
  },
};

export const AudioAsset: Story = {
  args: {
    asset: mockAsset({
      id: "asset-audio",
      kind: "audio",
      originalPath: "/audio/track.mp3",
      thumbnailPath: undefined,
      width: undefined,
      height: undefined,
      durationMs: 15000,
    }),
    jobId: null,
    isInUse: false,
  },
};
