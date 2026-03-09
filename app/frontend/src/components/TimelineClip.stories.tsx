import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { mockAsset, mockClip } from "../stories/fixtures";
import { TimelineClip } from "./TimelineClip";

const msToPx = (ms: number) => ms * 0.05;
const pxToMs = (px: number) => px / 0.05;

const meta: Meta<typeof TimelineClip> = {
  title: "Components/TimelineClip",
  component: TimelineClip,
  decorators: [
    (Story) => (
      <div style={{ position: "relative", height: 40, width: "100%" }}>
        <Story />
      </div>
    ),
  ],
  args: {
    msToPx,
    pxToMs,
    maxDurationMs: 30000,
    onSelect: fn(),
    onMove: fn(),
    onTrim: fn(),
    onContextMenu: fn(),
  },
};
export default meta;

type Story = StoryObj<typeof TimelineClip>;

export const VideoClip: Story = {
  args: {
    clip: mockClip(),
    asset: mockAsset(),
    isSelected: false,
  },
};

export const AudioClip: Story = {
  args: {
    clip: mockClip({
      id: "clip-audio",
      assetId: "asset-audio",
      durationMs: 8000,
      outMs: 8000,
    }),
    asset: mockAsset({
      id: "asset-audio",
      kind: "audio",
      originalPath: "/audio/track.mp3",
      thumbnailPath: undefined,
      width: undefined,
      height: undefined,
      durationMs: 15000,
    }),
    isSelected: false,
  },
};

export const TextClip: Story = {
  args: {
    clip: mockClip({
      id: "clip-text",
      assetId: "",
      durationMs: 3000,
      outMs: 3000,
      text: { value: "Hello World", fontSize: 48 },
    }),
    asset: undefined,
    isSelected: false,
  },
};

export const Selected: Story = {
  args: {
    clip: mockClip(),
    asset: mockAsset(),
    isSelected: true,
  },
};
