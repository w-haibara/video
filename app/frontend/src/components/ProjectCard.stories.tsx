import { expect } from "storybook/test";
import { MemoryRouter } from "react-router-dom";
import preview from "../../.storybook/preview";
import { mockAsset, mockProject } from "../stories/fixtures";
import { ProjectCard } from "./ProjectCard";

const meta = preview.meta({
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
});

export const Default = meta.story({
  args: {
    project: mockProject({
      assets: [
        mockAsset({ id: "asset-1", kind: "video" }),
        mockAsset({ id: "asset-2", kind: "audio", originalPath: "/media/bgm.mp3" }),
      ],
    }),
  },
});

export const LongName = meta.story({
  args: {
    project: mockProject({
      id: "proj-2",
      name: "This Is A Very Long Project Name That Should Test Text Overflow Behavior",
    }),
  },
});

export const NewProject = meta.story({
  args: {
    project: mockProject({
      id: "proj-3",
      name: "Untitled Project",
      assets: [],
    }),
  },
});

Default.test("renders project name", async ({ canvas }) => {
  await canvas.findByText("My Video Project");
});

Default.test("renders link to project editor", async ({ canvas }) => {
  const link = await canvas.findByRole("link");
  await expect(link).toHaveAttribute("href", "/projects/proj-1");
});

Default.test("renders asset count", async ({ canvas }) => {
  await canvas.findByText(/2 assets/);
});

LongName.test("renders long project name", async ({ canvas }) => {
  await canvas.findByText(/This Is A Very Long Project Name/);
});

NewProject.test("renders new project with zero assets", async ({ canvas }) => {
  await canvas.findByText(/0 assets/);
});
