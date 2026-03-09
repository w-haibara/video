import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { mockAsset, mockClip, mockProject } from "../stories/fixtures";
import { InspectorPanel } from "./InspectorPanel";

const meta: Meta<typeof InspectorPanel> = {
  title: "Components/InspectorPanel",
  component: InspectorPanel,
  args: {
    onUpdateClip: fn(),
    onMoveClip: fn(),
  },
};
export default meta;

type Story = StoryObj<typeof InspectorPanel>;

export const NoSelection: Story = {
  args: {
    project: mockProject(),
    selectedClipId: null,
  },
};

export const VideoClip: Story = {
  args: {
    project: mockProject(),
    selectedClipId: "clip-1",
  },
};

const audioAsset = mockAsset({
  id: "asset-audio",
  kind: "audio",
  originalPath: "/audio/track.mp3",
  thumbnailPath: undefined,
  width: undefined,
  height: undefined,
  durationMs: 15000,
});

const audioClip = mockClip({
  id: "clip-audio",
  assetId: "asset-audio",
  durationMs: 8000,
  outMs: 8000,
  volume: 0.75,
});

export const AudioClip: Story = {
  args: {
    project: mockProject({
      assets: [mockAsset(), audioAsset],
      sequence: {
        tracks: [
          { id: "track-v", kind: "video", clips: [mockClip()] },
          { id: "track-a", kind: "audio", clips: [audioClip] },
        ],
      },
    }),
    selectedClipId: "clip-audio",
  },
};

const textClip = mockClip({
  id: "clip-text",
  assetId: "",
  durationMs: 3000,
  outMs: 3000,
  text: { value: "Hello World", fontSize: 48 },
});

export const TextClip: Story = {
  args: {
    project: mockProject({
      sequence: {
        tracks: [
          { id: "track-v", kind: "video", clips: [mockClip()] },
          { id: "track-a", kind: "audio", clips: [] },
          { id: "track-t", kind: "title", clips: [textClip] },
        ],
      },
    }),
    selectedClipId: "clip-text",
  },
};
