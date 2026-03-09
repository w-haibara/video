import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import type { Project } from "@video/shared";
import { PreviewPlayer } from "./PreviewPlayer";

const baseProject: Project = {
  id: "proj-1",
  name: "Test Project",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
  assets: [
    {
      id: "asset-v1",
      kind: "video",
      originalPath: "/media/video1.mp4",
      width: 1920,
      height: 1080,
      durationMs: 10000,
      hasAudio: true,
    },
  ],
  sequence: {
    tracks: [
      {
        id: "track-v",
        kind: "video",
        clips: [
          {
            id: "clip-v1",
            assetId: "asset-v1",
            startMs: 0,
            durationMs: 10000,
            inMs: 0,
            outMs: 10000,
          },
        ],
      },
    ],
  },
  settings: { durationMs: 10000 },
};

const projectWithTextOverlay: Project = {
  ...baseProject,
  sequence: {
    tracks: [
      ...baseProject.sequence.tracks,
      {
        id: "track-t",
        kind: "title" as const,
        clips: [
          {
            id: "clip-t",
            assetId: "",
            startMs: 0,
            durationMs: 5000,
            inMs: 0,
            outMs: 5000,
            text: {
              value: "Sample Title",
              fontSize: 48,
              color: "#FFFFFF",
              backgroundColor: "rgba(0,0,0,0.5)",
            },
          },
        ],
      },
    ],
  },
};

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
    project: baseProject,
    currentTimeMs: 0,
    isPlaying: false,
    selectedClipId: null,
  },
};

export const Playing: Story = {
  args: {
    project: baseProject,
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
