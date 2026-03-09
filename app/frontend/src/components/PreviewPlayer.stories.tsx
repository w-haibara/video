import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { projectWithClips, projectWithTextOverlay } from "../stories/fixtures";
import { PreviewPlayer } from "./PreviewPlayer";

const meta: Meta<typeof PreviewPlayer> = {
  title: "Components/PreviewPlayer",
  component: PreviewPlayer,
  args: {
    onTimeUpdate: fn(),
    onPlayPause: fn(),
    onSelectClip: fn(),
  },
};
export default meta;

type Story = StoryObj<typeof PreviewPlayer>;

export const Stopped: Story = {
  args: {
    project: projectWithClips,
    currentTimeMs: 0,
    isPlaying: false,
    selectedClipId: null,
  },
};

export const Playing: Story = {
  args: {
    project: projectWithClips,
    currentTimeMs: 2500,
    isPlaying: true,
    selectedClipId: null,
  },
};

export const WithTextOverlay: Story = {
  args: {
    project: projectWithTextOverlay,
    currentTimeMs: 2500,
    isPlaying: false,
    selectedClipId: null,
  },
};

export const WithSelectedClip: Story = {
  args: {
    project: projectWithClips,
    currentTimeMs: 3000,
    isPlaying: false,
    selectedClipId: "clip-v1",
  },
};
