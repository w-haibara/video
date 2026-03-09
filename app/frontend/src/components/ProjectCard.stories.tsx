import type { Meta, StoryObj } from "@storybook/react";
import { MemoryRouter } from "react-router-dom";
import { mockAsset, mockProject } from "../stories/fixtures";
import { ProjectCard } from "./ProjectCard";

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
    project: mockProject({
      assets: [
        mockAsset({ id: "asset-1", kind: "video" }),
        mockAsset({ id: "asset-2", kind: "audio", originalPath: "/media/bgm.mp3" }),
      ],
    }),
  },
};

export const LongName: Story = {
  args: {
    project: mockProject({
      id: "proj-2",
      name: "This Is A Very Long Project Name That Should Test Text Overflow Behavior",
    }),
  },
};

export const NewProject: Story = {
  args: {
    project: mockProject({
      id: "proj-3",
      name: "Untitled Project",
      assets: [],
    }),
  },
};
