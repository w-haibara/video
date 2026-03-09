import type { Meta, StoryObj } from "@storybook/react";
import { MemoryRouter } from "react-router-dom";
import type { Project } from "@video/shared";
import { ProjectCard } from "./ProjectCard";

const baseProject: Project = {
  id: "proj-1",
  name: "My Video Project",
  createdAt: "2026-01-10T08:00:00Z",
  updatedAt: "2026-03-01T14:30:00Z",
  assets: [
    {
      id: "asset-1",
      kind: "video",
      originalPath: "/media/clip1.mp4",
      width: 1920,
      height: 1080,
      durationMs: 60000,
    },
    {
      id: "asset-2",
      kind: "audio",
      originalPath: "/media/bgm.mp3",
      durationMs: 180000,
    },
  ],
  sequence: { tracks: [] },
  settings: { durationMs: 60000 },
};

const meta: Meta<typeof ProjectCard> = {
  title: "Components/ProjectCard",
  component: ProjectCard,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div style={{ maxWidth: 320, padding: 16 }}>
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof ProjectCard>;

export const Default: Story = {
  args: {
    project: baseProject,
  },
};

export const LongName: Story = {
  args: {
    project: {
      ...baseProject,
      id: "proj-2",
      name: "This Is A Very Long Project Name That Should Test Text Overflow Behavior",
    },
  },
};

export const NewProject: Story = {
  args: {
    project: {
      ...baseProject,
      id: "proj-3",
      name: "Untitled Project",
      assets: [],
    },
  },
};
