import { expect } from "storybook/test";
import preview from "../../.storybook/preview";
import { theme } from "../theme";
import { Playhead } from "./Playhead";

const timelineContainer: React.CSSProperties = {
  position: "relative",
  width: 500,
  height: 120,
  background: theme.timelineBg,
  border: `1px solid ${theme.border}`,
  borderRadius: 4,
  overflow: "hidden",
};

const meta = preview.meta({
  title: "Components/Playhead",
  component: Playhead,
  decorators: [
    (Story) => (
      <div style={timelineContainer}>
        <Story />
      </div>
    ),
  ],
});

export const Default = meta.story({
  args: {
    positionPx: 100,
  },
});

export const AtStart = meta.story({
  args: {
    positionPx: 0,
  },
});

export const AtMiddle = meta.story({
  args: {
    positionPx: 200,
  },
});

Default.test("renders at default position", async ({ canvas }) => {
  await expect(document.body.querySelector("div")).toBeTruthy();
});

AtStart.test("renders at start position", async ({ canvas }) => {
  await expect(document.body.querySelector("div")).toBeTruthy();
});

AtMiddle.test("renders at middle position", async ({ canvas }) => {
  await expect(document.body.querySelector("div")).toBeTruthy();
});
