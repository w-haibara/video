import { expect } from "storybook/test";
import preview from "../../../.storybook/preview";
import { mockClip, mockProject } from "../../stories/fixtures";
import type {
  ActiveTextClip,
  PreviewRenderContext,
} from "../../lib/preview-renderer-registry";
import { textOverlayRenderer } from "./TextOverlayRenderer";

const Component = textOverlayRenderer.Component;

function TextOverlayHost({
  content,
  ctx,
}: {
  content: ActiveTextClip[];
  ctx: PreviewRenderContext;
}) {
  return (
    <div
      style={{
        position: "relative",
        width: "320px",
        height: "180px",
        background: "#111",
      }}
    >
      <Component content={content} ctx={ctx} />
    </div>
  );
}

function buildCtx(
  project: ReturnType<typeof mockProject>,
): PreviewRenderContext {
  return {
    project,
    currentTimeMs: 0,
    canvasW: 1920,
    canvasH: 1080,
    canvasScale: 0.2,
    isPlaying: false,
    videoRef: { current: null } as React.RefObject<HTMLVideoElement | null>,
  };
}

const baseProject = mockProject();

const singleContent: ActiveTextClip[] = [
  {
    clip: mockClip({ id: "t1", clipKind: "title" }),
    text: {
      value: "Hello World",
      fontSize: 48,
      color: "#ffffff",
      backgroundColor: "rgba(0,0,0,0.5)",
    },
  },
];

const customStyleContent: ActiveTextClip[] = [
  {
    clip: mockClip({ id: "t1", clipKind: "title" }),
    text: {
      value: "Custom",
      fontSize: 60,
      color: "#ff0000",
      backgroundColor: "#000000",
      fontFamily: "serif",
      align: "left",
    },
  },
];

const multipleContent: ActiveTextClip[] = [
  {
    clip: mockClip({ id: "t1", clipKind: "title" }),
    text: {
      value: "Line 1",
      fontSize: 48,
      color: "#ffffff",
      backgroundColor: "rgba(0,0,0,0.5)",
    },
  },
  {
    clip: mockClip({ id: "t2", clipKind: "title" }),
    text: {
      value: "Line 2",
      fontSize: 48,
      color: "#ffff00",
      backgroundColor: "rgba(0,0,0,0.5)",
    },
  },
];

const meta = preview.meta({
  title: "Components/renderers/TextOverlayRenderer",
  component: TextOverlayHost,
});

export const SingleText = meta.story({
  args: {
    content: singleContent,
    ctx: buildCtx(baseProject),
  },
});

export const CustomStyle = meta.story({
  args: {
    content: customStyleContent,
    ctx: buildCtx(baseProject),
  },
});

export const MultipleTexts = meta.story({
  args: {
    content: multipleContent,
    ctx: buildCtx(baseProject),
  },
});

export const NoText = meta.story({
  args: {
    content: [],
    ctx: buildCtx(baseProject),
  },
});

SingleText.test("renders text value", async ({ canvas }) => {
  await canvas.findByText("Hello World");
});

MultipleTexts.test("renders both values", async ({ canvas }) => {
  await canvas.findByText("Line 1");
  await canvas.findByText("Line 2");
});

CustomStyle.test("applies fontFamily", async ({ canvas }) => {
  const el = await canvas.findByText("Custom");
  expect((el as HTMLElement).style.fontFamily).toBe("serif");
});

NoText.test("renders nothing", async ({ canvas }) => {
  expect(canvas.queryAllByText(/Hello World/).length).toBe(0);
});
