import path from "node:path";
import { Hono } from "hono";
import { mkdir, cp } from "node:fs/promises";
import { generateId } from "@video/shared";
import type { Project, Asset } from "@video/shared";
import {
  projectDir,
  proxyDir,
  thumbnailDir,
  assetsDir,
  renderCacheDir,
} from "../utils/paths";
import { saveProject, deleteProject } from "../services/project-service";

// Fixture factory imports
import {
  makeSingleVideoProject,
  makeTwoClipProject,
  makeImageClipProject,
  makeTextOverlayProject,
  makeMultiTrackProject,
  makeOpacityProject,
  makeFadeTransitionProject,
  makeSlideLeftTransitionProject,
  makeWipeLeftTransitionProject,
  makeZoomInTransitionProject,
  makePushLeftTransitionProject,
  makeP5jsProject,
  makeKeyframeTransformXProject,
  makeSpeed2xProject,
  makeColorCorrectionProject,
  makeVideoFilterBlurSepiaProject,
  makeChromaKeyProject,
  makePipCornerBrProject,
  makeFeatureShowcaseProject,
  makeOverlayTransformProject,
  makeCropTransformProject,
  makeFadeBlackTransitionProject,
  makeFadeWhiteTransitionProject,
  makeSlideRightTransitionProject,
  makeSlideUpTransitionProject,
  makeSlideDownTransitionProject,
  makeWipeUpTransitionProject,
  makeMultiplyProject,
  makeScreenProject,
  makeOverlayBlendProject,
  makeAddProject,
  makeDifferenceProject,
  makeTransitionWithTransformProject,
  makeSpeedHalfProject,
  makeVideoFilterGrayscaleProject,
  makeColorCorrectionHueProject,
  makeChromaKeyTransformProject,
  makePipSideBySideProject,
  makeBlendModeTransitionProject,
  makeCropBlendProject,
  makeTitleFontAlignProject,
  makeSpeedTransitionProject,
  makeColorCorrectionVideoFilterProject,
  makeKeyframeColorCorrectionProject,
  makeVideoFilterTransitionProject,
  makeChromaKeyBlendProject,
  makeTransitionMultiTrackProject,
  makeVideoFilterTransformProject,
  makeColorCorrectionTransformProject,
  makeSpeedMultiClipProject,
} from "../__fixtures__/export/make-fixture-project";

const FIXTURES_ASSETS_DIR = path.resolve(
  import.meta.dirname,
  "../__fixtures__/export/assets",
);

const fixtureFactories: Record<string, () => Project> = {
  "single-video": makeSingleVideoProject,
  "two-clips": makeTwoClipProject,
  "image-clip": makeImageClipProject,
  "text-overlay": makeTextOverlayProject,
  "multi-track": makeMultiTrackProject,
  "opacity": makeOpacityProject,
  "multiply": makeMultiplyProject,
  "screen": makeScreenProject,
  "overlay-blend": makeOverlayBlendProject,
  "add": makeAddProject,
  "difference": makeDifferenceProject,
  "transition-fade": makeFadeTransitionProject,
  "transition-fade-black": makeFadeBlackTransitionProject,
  "transition-fade-white": makeFadeWhiteTransitionProject,
  "transition-slide-left": makeSlideLeftTransitionProject,
  "transition-slide-right": makeSlideRightTransitionProject,
  "transition-slide-up": makeSlideUpTransitionProject,
  "transition-slide-down": makeSlideDownTransitionProject,
  "transition-wipe-left": makeWipeLeftTransitionProject,
  "transition-wipe-up": makeWipeUpTransitionProject,
  "transition-zoom-in": makeZoomInTransitionProject,
  "transition-push-left": makePushLeftTransitionProject,
  "p5js-clip": makeP5jsProject,
  "crop-transform": makeCropTransformProject,
  "overlay-transform": makeOverlayTransformProject,
  "keyframe-transform-x": makeKeyframeTransformXProject,
  "speed-2x": makeSpeed2xProject,
  "speed-half": makeSpeedHalfProject,
  "speed-multi-clip": makeSpeedMultiClipProject,
  "color-correction": makeColorCorrectionProject,
  "color-correction-hue": makeColorCorrectionHueProject,
  "color-correction-transform": makeColorCorrectionTransformProject,
  "video-filter-blur-sepia": makeVideoFilterBlurSepiaProject,
  "video-filter-grayscale": makeVideoFilterGrayscaleProject,
  "video-filter-transform": makeVideoFilterTransformProject,
  "chroma-key": makeChromaKeyProject,
  "chroma-key-transform": makeChromaKeyTransformProject,
  "chroma-key-blend": makeChromaKeyBlendProject,
  "pip-corner-br": makePipCornerBrProject,
  "pip-side-by-side": makePipSideBySideProject,
  "transition-with-transform": makeTransitionWithTransformProject,
  "transition-multi-track": makeTransitionMultiTrackProject,
  "blend-mode-transition": makeBlendModeTransitionProject,
  "crop-blend": makeCropBlendProject,
  "title-font-align": makeTitleFontAlignProject,
  "speed-transition": makeSpeedTransitionProject,
  "color-correction-video-filter": makeColorCorrectionVideoFilterProject,
  "keyframe-color-correction": makeKeyframeColorCorrectionProject,
  "video-filter-transition": makeVideoFilterTransitionProject,
  "feature-showcase": makeFeatureShowcaseProject,
};

/**
 * Prepare a fixture asset for preview by copying media files and setting
 * proxyPath / thumbnailPath so the frontend media URL resolution works.
 */
async function prepareAsset(asset: Asset, projectId: string): Promise<void> {
  const filename = path.basename(asset.originalPath);
  const srcFile = path.join(FIXTURES_ASSETS_DIR, filename);

  switch (asset.kind) {
    case "video": {
      await cp(srcFile, path.join(proxyDir(projectId), filename));
      asset.proxyPath = `proxies/${filename}`;
      // Also copy as thumbnail for image-based displays
      await cp(srcFile, path.join(thumbnailDir(projectId), filename));
      asset.thumbnailPath = `thumbnails/${filename}`;
      break;
    }
    case "image": {
      await cp(srcFile, path.join(thumbnailDir(projectId), filename));
      asset.thumbnailPath = `thumbnails/${filename}`;
      break;
    }
    case "audio": {
      // Audio clips have no visual output; copy to assets dir for playback
      await cp(srcFile, path.join(assetsDir(projectId), filename));
      break;
    }
    case "p5js": {
      // Use the pre-rendered p5js video as proxy
      const cacheDir = path.join(renderCacheDir(projectId), asset.id);
      await mkdir(cacheDir, { recursive: true });
      const renderedSrc = path.join(FIXTURES_ASSETS_DIR, "test-p5js-rendered-1s.mp4");
      await cp(renderedSrc, path.join(cacheDir, "proxy.mp4"));
      asset.proxyPath = `render-cache/${asset.id}/proxy.mp4`;
      break;
    }
  }
}

const testFixtures = new Hono();

/** List available fixture names. */
testFixtures.get("/", (c) => {
  return c.json({ fixtures: Object.keys(fixtureFactories) });
});

/** Compute the end time of the last clip in the sequence. */
function getSequenceEndMs(project: Project): number {
  let endMs = 0;
  for (const track of project.sequence.tracks) {
    for (const clip of track.clips) {
      const clipEnd = clip.startMs + clip.durationMs;
      if (clipEnd > endMs) endMs = clipEnd;
    }
  }
  return endMs;
}

/** Create a project from a named fixture with media files ready for preview. */
testFixtures.post("/", async (c) => {
  const { fixture } = await c.req.json<{ fixture: string }>();
  const factory = fixtureFactories[fixture];
  if (!factory) {
    return c.json({ error: `Unknown fixture: ${fixture}` }, 400);
  }

  const fixtureProject = factory();
  const projectId = generateId();
  fixtureProject.id = projectId;
  fixtureProject.name = `preview-test-${fixture}`;

  // Create workspace directories
  await mkdir(projectDir(projectId), { recursive: true });
  await mkdir(assetsDir(projectId), { recursive: true });
  await mkdir(proxyDir(projectId), { recursive: true });
  await mkdir(thumbnailDir(projectId), { recursive: true });

  // Copy media files and set preview-compatible paths
  await Promise.all(fixtureProject.assets.map((a) => prepareAsset(a, projectId)));

  // Save the project
  await saveProject(fixtureProject);

  const sequenceEndMs = getSequenceEndMs(fixtureProject);

  return c.json({
    id: projectId,
    fixture,
    canvasWidth: fixtureProject.settings.canvasWidth,
    canvasHeight: fixtureProject.settings.canvasHeight,
    durationMs: fixtureProject.settings.durationMs,
    sequenceEndMs,
    fps: fixtureProject.exportPreset?.fps ?? 10,
  });
});

/** Delete a fixture project (cleanup). */
testFixtures.delete("/:id", async (c) => {
  const { id } = c.req.param();
  await deleteProject(id);
  return c.json({ ok: true });
});

export { testFixtures };
