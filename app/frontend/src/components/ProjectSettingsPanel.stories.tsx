import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { MemoryRouter } from "react-router-dom";
import { mockProject } from "../stories/fixtures";
import { ProjectSettingsPanel } from "./ProjectSettingsPanel";

const meta: Meta<typeof ProjectSettingsPanel> = {
  title: "Components/ProjectSettingsPanel",
  component: ProjectSettingsPanel,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
  args: {
    onUpdateSettings: fn(),
  },
};
export default meta;

type Story = StoryObj<typeof ProjectSettingsPanel>;

export const Default: Story = {
  args: {
    project: mockProject(),
    projectId: "proj-1",
  },
};
