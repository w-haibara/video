import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { Asset, Clip, Project } from "@video/shared";
import { AssetPanel } from "./AssetPanel";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const mockAsset = (overrides?: Partial<Asset>): Asset => ({
  id: "asset-1",
  kind: "video",
  originalPath: "/videos/sample.mp4",
  proxyPath: "/proxy/sample.mp4",
  thumbnailPath: "/thumb/sample.jpg",
  width: 1920,
  height: 1080,
  durationMs: 10000,
  ...overrides,
});

const mockClip = (overrides?: Partial<Clip>): Clip => ({
  id: "clip-1",
  assetId: "asset-1",
  startMs: 0,
  durationMs: 5000,
  inMs: 0,
  outMs: 5000,
  ...overrides,
});

const mockProject = (overrides?: Partial<Project>): Project => ({
  id: "proj-1",
  name: "My Video Project",
  createdAt: "2025-01-01T00:00:00Z",
  updatedAt: "2025-01-01T00:00:00Z",
  assets: [mockAsset()],
  sequence: {
    tracks: [
      { id: "track-v", kind: "video", clips: [mockClip()] },
      { id: "track-a", kind: "audio", clips: [] },
    ],
  },
  settings: { durationMs: 30000 },
  ...overrides,
});

const meta: Meta<typeof AssetPanel> = {
  title: "Components/AssetPanel",
  component: AssetPanel,
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
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
