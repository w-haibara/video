import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { mockProject, projectWithClips } from "../stories/fixtures";
import { Timeline } from "./Timeline";

const meta: Meta<typeof Timeline> = {
  title: "Components/Timeline",
  component: Timeline,
  args: {
    onSeek: fn(),
    onSelectClip: fn(),
    onDeleteClip: fn(),
    onMoveClip: fn(),
    onTrimClip: fn(),
  },
};
export default meta;

type Story = StoryObj<typeof Timeline>;

export const Empty: Story = {
  args: {
    project: mockProject({
      name: "Test Project",
      assets: [],
      sequence: {
        tracks: [
          { id: "track-v", kind: "video", clips: [] },
          { id: "track-a", kind: "audio", clips: [] },
        ],
      },
    }),
    currentTimeMs: 0,
    selectedClipId: null,
  },
};

export const WithClips: Story = {
  args: {
    project: projectWithClips,
    currentTimeMs: 5000,
    selectedClipId: null,
  },
};

export const WithSelectedClip: Story = {
  args: {
    project: projectWithClips,
    currentTimeMs: 5000,
    selectedClipId: "clip-v1",
  },
};
