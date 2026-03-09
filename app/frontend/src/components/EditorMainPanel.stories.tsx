import preview from "../../.storybook/preview";
import { theme } from "../theme";
import { EditorMainPanel } from "./EditorMainPanel";

const PlaceholderContent = ({ label }: { label: string }) => (
  <div style={{ padding: 8, color: theme.textMuted, fontSize: 13 }}>
    {label} content goes here
  </div>
);

const meta = preview.meta({
  title: "Components/EditorMainPanel",
  component: EditorMainPanel,
  args: {
    inspectorContent: <PlaceholderContent label="Inspector" />,
    assetsContent: <PlaceholderContent label="Assets" />,
    exportContent: <PlaceholderContent label="Export" />,
    settingsContent: <PlaceholderContent label="Settings" />,
  },
});

export const Default = meta.story({
  args: {
    selectedClipId: null,
  },
});

export const WithSelectedClip = meta.story({
  args: {
    selectedClipId: "clip-1",
  },
});
