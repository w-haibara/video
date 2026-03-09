import { expect, fn } from "storybook/test";
import { QueryClientProvider } from "@tanstack/react-query";
import preview from "../../.storybook/preview";
import { createStoryQueryClient, mockAsset, mockJob } from "../stories/fixtures";
import { AssetThumbnail } from "./AssetThumbnail";

const meta = preview.meta({
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
});

export const Ready = meta.story({
  args: {
    asset: mockAsset(),
    jobId: null,
    isInUse: false,
  },
});

export const Importing = meta.story({
  args: {
    asset: mockAsset({
      proxyPath: undefined,
      thumbnailPath: undefined,
    }),
    jobId: "job-1",
    isInUse: false,
  },
});

export const InUse = meta.story({
  args: {
    asset: mockAsset(),
    jobId: null,
    isInUse: true,
  },
});

export const AudioAsset = meta.story({
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
});

export const Failed = meta.story({
  decorators: [
    (Story) => {
      const client = createStoryQueryClient();
      client.setQueryData(["jobs", "job-fail"], mockJob({
        id: "job-fail",
        status: "failed",
        progress: 0.3,
        error: "Import failed: unsupported codec",
      }));
      return (
        <QueryClientProvider client={client}>
          <Story />
        </QueryClientProvider>
      );
    },
  ],
  args: {
    asset: mockAsset(),
    jobId: "job-fail",
    isInUse: false,
  },
});

Ready.test("renders add-to-timeline button", async ({ canvas }) => {
  await canvas.findByTitle("Add to timeline");
});

Ready.test("renders delete button for asset not in use", async ({ canvas }) => {
  await canvas.findByTitle("Delete asset");
});

Importing.test("renders importing asset fallback", async ({ canvas }) => {
  await canvas.findByText("video");
});

AudioAsset.test("renders audio asset label", async ({ canvas }) => {
  await canvas.findByText(/audio/i);
});
