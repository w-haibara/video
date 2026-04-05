import { expect } from "storybook/test";
import preview from "../../../.storybook/preview";
import { mockClip, mockProject } from "../../stories/fixtures";
import type {
  ActiveEmptyClip,
  PreviewRenderContext,
} from "../../lib/preview-renderer-registry";
import { emptyAssetRenderer } from "./EmptyAssetRenderer";

const Component = emptyAssetRenderer.Component;

function EmptyAssetHost({
  content,
  ctx,
}: {
  content: ActiveEmptyClip[];
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
    canvasScale: 1,
    isPlaying: false,
    videoRef: { current: null } as React.RefObject<HTMLVideoElement | null>,
  };
}

const baseProject = mockProject();

const singleContent: ActiveEmptyClip[] = [
  {
    clip: mockClip({ id: "e1", assetId: "", durationMs: 5000, outMs: 5000 }),
    trackIndex: 0,
  },
];

const multipleContent: ActiveEmptyClip[] = [
  {
    clip: mockClip({ id: "e1", assetId: "", durationMs: 5000, outMs: 5000 }),
    trackIndex: 0,
  },
  {
    clip: mockClip({ id: "e2", assetId: "", durationMs: 3000, outMs: 3000 }),
    trackIndex: 1,
  },
];

const meta = preview.meta({
  title: "Components/renderers/EmptyAssetRenderer",
  component: EmptyAssetHost,
});

export const SingleEmpty = meta.story({
  args: {
    content: singleContent,
    ctx: buildCtx(baseProject),
  },
});

export const MultipleEmpty = meta.story({
  args: {
    content: multipleContent,
    ctx: buildCtx(baseProject),
  },
});

export const NoEmpty = meta.story({
  args: {
    content: [],
    ctx: buildCtx(baseProject),
  },
});

SingleEmpty.test("renders No Asset text", async ({ canvas }) => {
  await canvas.findByText("No Asset");
});

MultipleEmpty.test(
  "renders 2 No Asset placeholders",
  async ({ canvas }) => {
    const nodes = await canvas.findAllByText("No Asset");
    expect(nodes.length).toBe(2);
  },
);

NoEmpty.test("renders nothing", async ({ canvas }) => {
  expect(canvas.queryAllByText("No Asset").length).toBe(0);
});
