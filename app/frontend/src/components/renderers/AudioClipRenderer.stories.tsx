import { expect } from "storybook/test";
import preview from "../../../.storybook/preview";
import { mockAsset, mockClip, mockProject } from "../../stories/fixtures";
import type {
  ActiveClip,
  PreviewRenderContext,
} from "../../lib/preview-renderer-registry";
import { audioClipRenderer } from "./AudioClipRenderer";

function AudioClipStoryHost({
  content,
  ctx,
}: {
  content: ActiveClip[];
  ctx: PreviewRenderContext;
}) {
  const Component = audioClipRenderer.Component;
  // The renderer mounts hidden <audio> elements; we wrap them in a labelled
  // container so story tests can scope DOM queries to this specific story.
  return (
    <div data-testid="audio-clip-story-host">
      <Component content={content} ctx={ctx} />
    </div>
  );
}

function buildCtx(
  project: ReturnType<typeof mockProject>,
  currentTimeMs = 0,
  isPlaying = false,
): PreviewRenderContext {
  return {
    project,
    currentTimeMs,
    canvasW: project.settings.canvasWidth,
    canvasH: project.settings.canvasHeight,
    canvasScale: 1,
    isPlaying,
    videoRef: { current: null } as React.RefObject<HTMLVideoElement | null>,
  };
}

// ── Fixture: project with one audio clip ──
const audioAsset = mockAsset({
  id: "a1",
  kind: "audio",
  originalPath: "/audio/test.mp3",
  durationMs: 10000,
  thumbnailPath: undefined,
  width: undefined,
  height: undefined,
});

const audioClip = mockClip({
  id: "ac1",
  clipKind: "audio",
  assetId: "a1",
  startMs: 0,
  durationMs: 5000,
  inMs: 0,
  outMs: 5000,
  volume: 0.8,
});

const audioProject = mockProject({
  assets: [audioAsset],
  sequence: {
    tracks: [{ id: "ta", clips: [audioClip] }],
  },
});

const singleClipContent: ActiveClip[] = [
  { clip: audioClip, asset: audioAsset, clipTimeMs: 1000, trackIndex: 0 },
];

const meta = preview.meta({
  title: "Components/renderers/AudioClipRenderer",
  component: AudioClipStoryHost,
});

export const SingleAudioClip = meta.story({
  args: {
    content: singleClipContent,
    ctx: buildCtx(audioProject, 1000),
  },
});

export const NoActiveClips = meta.story({
  args: {
    content: [],
    ctx: buildCtx(mockProject()),
  },
});

SingleAudioClip.test(
  "mounts hidden audio element",
  async ({ canvasElement }) => {
    // Scope to this story's canvas root so other stories don't leak audio
    // elements into the assertion.
    const audios = canvasElement.querySelectorAll("audio");
    expect(audios.length).toBeGreaterThan(0);
  },
);

NoActiveClips.test("mounts no audio elements", async ({ canvasElement }) => {
  const audios = canvasElement.querySelectorAll("audio");
  expect(audios.length).toBe(0);
});
