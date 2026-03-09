import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import type { Asset, Clip } from "@video/shared";
import { TimelineTrack } from "./TimelineTrack";

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

const msToPx = (ms: number) => ms * 0.05;
const pxToMs = (px: number) => px / 0.05;

const meta: Meta<typeof TimelineTrack> = {
  title: "Components/TimelineTrack",
  component: TimelineTrack,
  args: {
    msToPx,
    pxToMs,
    totalWidth: 1500,
    maxDurationMs: 30000,
    selectedClipId: null,
    onSelectClip: fn(),
    onMoveClip: fn(),
    onTrimClip: fn(),
    onContextMenu: fn(),
  },
};
export default meta;

type Story = StoryObj<typeof TimelineTrack>;

const videoAsset = mockAsset();
const secondClip = mockClip({
  id: "clip-2",
  startMs: 6000,
  durationMs: 4000,
  inMs: 0,
  outMs: 4000,
});

export const VideoTrack: Story = {
  args: {
    track: {
      id: "track-v",
      kind: "video",
      clips: [mockClip(), secondClip],
    },
    assets: [videoAsset],
  },
};

export const EmptyTrack: Story = {
  args: {
    track: {
      id: "track-v",
      kind: "video",
      clips: [],
    },
    assets: [],
  },
};

const audioAsset = mockAsset({
  id: "asset-audio",
  kind: "audio",
  originalPath: "/audio/music.mp3",
  thumbnailPath: undefined,
  width: undefined,
  height: undefined,
  durationMs: 15000,
});

const audioClip = mockClip({
  id: "clip-audio",
  assetId: "asset-audio",
  startMs: 1000,
  durationMs: 8000,
  inMs: 0,
  outMs: 8000,
});

export const AudioTrack: Story = {
  args: {
    track: {
      id: "track-a",
      kind: "audio",
      clips: [audioClip],
    },
    assets: [audioAsset],
  },
};
