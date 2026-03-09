import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { MemoryRouter } from "react-router-dom";
import type { Asset, Clip, Project } from "@video/shared";
import { ProjectSettingsPanel } from "./ProjectSettingsPanel";

const mockAsset = (overrides?: Partial<Asset>): Asset => ({
  id: "asset-1",
  kind: "video",
  originalPath: "/videos/sample.mp4",
  proxyPath: "/proxy/sample.mp4",
  thumbnailPath: "/thumb/sample.jpg",
  width: 1920,
  height: 1080,
  durationMs: 10000,
  ...overrides,
});

const mockClip = (overrides?: Partial<Clip>): Clip => ({
  id: "clip-1",
  assetId: "asset-1",
  startMs: 0,
  durationMs: 5000,
  inMs: 0,
  outMs: 5000,
  ...overrides,
});

const mockProject = (overrides?: Partial<Project>): Project => ({
  id: "proj-1",
  name: "My Video Project",
  createdAt: "2025-01-01T00:00:00Z",
  updatedAt: "2025-01-01T00:00:00Z",
  assets: [mockAsset()],
  sequence: {
    tracks: [
      { id: "track-v", kind: "video", clips: [mockClip()] },
      { id: "track-a", kind: "audio", clips: [] },
    ],
  },
  settings: { durationMs: 30000 },
  ...overrides,
});

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
