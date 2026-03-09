import { expect, fn } from "storybook/test";
import { MemoryRouter } from "react-router-dom";
import preview from "../../.storybook/preview";
import { mockProject } from "../stories/fixtures";
import { ProjectSettingsPanel } from "./ProjectSettingsPanel";

const meta = preview.meta({
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
});

export const Default = meta.story({
  args: {
    project: mockProject(),
    projectId: "proj-1",
  },
});

Default.test("renders heading", async ({ canvas }) => {
  await canvas.findByRole("heading", { name: "Project Settings" });
});

Default.test("renders duration input", async ({ canvas }) => {
  await canvas.findByText(/Duration/);
  await canvas.findByRole("spinbutton");
});

Default.test("renders view jobs link", async ({ canvas }) => {
  await canvas.findByRole("link", { name: /View Jobs/ });
});
