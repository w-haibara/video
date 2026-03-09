import { MemoryRouter } from "react-router-dom";
import preview from "../../.storybook/preview";
import { EditorLayout } from "./EditorLayout";

const Placeholder = ({ label, color }: { label: string; color: string }) => (
  <div
    style={{
      background: color,
      color: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      height: "100%",
      minHeight: 60,
      fontSize: 14,
      fontWeight: "bold",
    }}
  >
    {label}
  </div>
);

const meta = preview.meta({
  title: "Components/EditorLayout",
  component: EditorLayout,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
});

export const Default = meta.story({
  args: {
    toolbar: <Placeholder label="Toolbar" color="#4a6fa5" />,
    preview: <Placeholder label="Preview" color="#2d5016" />,
    mainPanel: <Placeholder label="Main Panel" color="#6b3a7d" />,
    bottom: <Placeholder label="Bottom (Timeline)" color="#8b4513" />,
  },
});
