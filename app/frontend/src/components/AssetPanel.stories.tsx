import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { QueryClientProvider } from "@tanstack/react-query";
import {
  createStoryQueryClient,
  mockAsset,
  mockProject,
} from "../stories/fixtures";
import { AssetPanel } from "./AssetPanel";

const meta: Meta<typeof AssetPanel> = {
  title: "Components/AssetPanel",
  component: AssetPanel,
  decorators: [
    (Story) => (
      <QueryClientProvider client={createStoryQueryClient()}>
        <Story />
      </QueryClientProvider>
    ),
  ],
  args: {
    onAddToTimeline: fn(),
  },
};
export default meta;

type Story = StoryObj<typeof AssetPanel>;

export const Empty: Story = {
  args: {
    project: mockProject({ assets: [] }),
  },
};

export const WithAssets: Story = {
  args: {
    project: mockProject({
      assets: [
        mockAsset(),
        mockAsset({
          id: "asset-2",
          kind: "image",
          originalPath: "/images/photo.jpg",
          thumbnailPath: "/thumb/photo.jpg",
          durationMs: undefined,
        }),
        mockAsset({
          id: "asset-3",
          kind: "audio",
          originalPath: "/audio/music.mp3",
          thumbnailPath: undefined,
          width: undefined,
          height: undefined,
          durationMs: 120000,
        }),
      ],
    }),
  },
};
