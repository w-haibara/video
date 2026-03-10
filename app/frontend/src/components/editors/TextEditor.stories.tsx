import { fn } from "storybook/test";
import preview from "../../../.storybook/preview";
import { mockAsset, mockClip } from "../../stories/fixtures";
import { TextEditor } from "./TextEditor";

const meta = preview.meta({
  title: "Editors/TextEditor",
  component: TextEditor,
  args: {
    onUpdate: fn(),
  },
});

export const Default = meta.story({
  args: {
    clip: mockClip({
      id: "clip-text",
      assetId: "",
      text: {
        value: "Hello World",
        fontSize: 48,
        color: "#ffffff",
        backgroundColor: "#000000",
      },
    }),
    asset: undefined,
    trackKind: "title",
  },
});

export const EmptyText = meta.story({
  args: {
    clip: mockClip({
      id: "clip-text-empty",
      assetId: "",
      text: { value: "" },
    }),
    asset: undefined,
    trackKind: "title",
  },
});

export const CustomColors = meta.story({
  args: {
    clip: mockClip({
      id: "clip-text-colors",
      assetId: "",
      text: {
        value: "Colored Text",
        fontSize: 72,
        color: "#ff0000",
        backgroundColor: "#00ff00",
      },
    }),
    asset: undefined,
    trackKind: "title",
  },
});

Default.test("shows text textarea", async ({ canvas }) => {
  await canvas.findByRole("textbox");
});

Default.test("shows size input", async ({ canvas }) => {
  await canvas.findByText("Size");
});
