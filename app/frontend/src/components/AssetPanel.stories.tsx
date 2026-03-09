import { expect, fn } from "storybook/test";
import { QueryClientProvider } from "@tanstack/react-query";
import preview from "../../.storybook/preview";
import {
  createStoryQueryClient,
  mockAsset,
  mockProject,
} from "../stories/fixtures";
import { AssetPanel } from "./AssetPanel";

const meta = preview.meta({
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
});

export const Empty = meta.story({
  args: {
    project: mockProject({ assets: [] }),
  },
});

export const WithAssets = meta.story({
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
});

Empty.test("renders heading", async ({ canvas }) => {
  await canvas.findByRole("heading", { name: "Assets" });
});

Empty.test("renders import button", async ({ canvas }) => {
  await canvas.findByRole("button", { name: /Import/ });
});

WithAssets.test("renders asset thumbnails when assets exist", async ({ canvas }) => {
  await canvas.findByRole("heading", { name: "Assets" });
  await canvas.findByRole("button", { name: /Import/ });
});
