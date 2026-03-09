import type { Meta, StoryObj } from "@storybook/react";
import { EditorMainPanel } from "./EditorMainPanel";

import { theme } from "../theme";

const PlaceholderContent = ({ label }: { label: string }) => (
  <div style={{ padding: 8, color: theme.textMuted, fontSize: 13 }}>
    {label} content goes here
  </div>
);

const meta: Meta<typeof EditorMainPanel> = {
  title: "Components/EditorMainPanel",
  component: EditorMainPanel,
  args: {
    inspectorContent: <PlaceholderContent label="Inspector" />,
    assetsContent: <PlaceholderContent label="Assets" />,
    exportContent: <PlaceholderContent label="Export" />,
    settingsContent: <PlaceholderContent label="Settings" />,
  },
};
export default meta;

type Story = StoryObj<typeof EditorMainPanel>;

export const Default: Story = {
  args: {
    selectedClipId: null,
  },
};

export const WithSelectedClip: Story = {
  args: {
    selectedClipId: "clip-1",
  },
};
