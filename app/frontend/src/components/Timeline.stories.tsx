import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import type { Project } from "@video/shared";
import { Timeline } from "./Timeline";

const baseProject: Project = {
  id: "proj-1",
  name: "Test Project",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
  assets: [],
  sequence: { tracks: [] },
  settings: { durationMs: 30000 },
};

const projectWithClips: Project = {
  ...baseProject,
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
    {
      id: "asset-a1",
      kind: "audio",
      originalPath: "/media/audio1.mp3",
      durationMs: 15000,
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
      {
        id: "track-a",
        kind: "audio",
        clips: [
          {
            id: "clip-a1",
            assetId: "asset-a1",
            startMs: 2000,
            durationMs: 8000,
            inMs: 0,
            outMs: 8000,
            volume: 0.8,
          },
        ],
      },
    ],
  },
};

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
    project: {
      ...baseProject,
      sequence: {
        tracks: [
          { id: "track-v", kind: "video", clips: [] },
          { id: "track-a", kind: "audio", clips: [] },
        ],
      },
    },
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
