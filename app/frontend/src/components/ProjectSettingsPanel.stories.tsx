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

export const SquareCanvas = meta.story({
  args: {
    project: mockProject({
      settings: { durationMs: 30000, canvasWidth: 1080, canvasHeight: 1080 },
    }),
    projectId: "proj-1",
  },
});

export const VerticalCanvas = meta.story({
  args: {
    project: mockProject({
      settings: { durationMs: 30000, canvasWidth: 1080, canvasHeight: 1920 },
    }),
    projectId: "proj-1",
  },
});

Default.test("renders heading", async ({ canvas }) => {
  await canvas.findByRole("heading", { name: "Project Settings" });
});

Default.test("renders duration input", async ({ canvas }) => {
  await canvas.findByText(/Duration/);
  await canvas.findByRole("spinbutton", { name: /Duration/ });
});

Default.test("renders canvas size inputs", async ({ canvas }) => {
  await canvas.findByText(/Canvas Size/);
  await canvas.findByRole("spinbutton", { name: /Canvas width/ });
  await canvas.findByRole("spinbutton", { name: /Canvas height/ });
});

Default.test("renders canvas presets", async ({ canvas }) => {
  await canvas.findByRole("button", { name: /1920×1080/ });
  await canvas.findByRole("button", { name: /1280×720/ });
  await canvas.findByRole("button", { name: /1080×1920/ });
  await canvas.findByRole("button", { name: /1080×1080/ });
});

Default.test("renders view jobs link", async ({ canvas }) => {
  await canvas.findByRole("link", { name: /View Jobs/ });
});
