import preview from "../../.storybook/preview";
import { mockProject, projectWithClips } from "../stories/fixtures";
import { CanvasExportPanel } from "./CanvasExportPanel";

const meta = preview.meta({
  title: "Components/CanvasExportPanel",
  component: CanvasExportPanel,
});

export const Default = meta.story({
  args: {
    project: mockProject(),
  },
});

export const WithClips = meta.story({
  args: {
    project: projectWithClips,
  },
});

// Note: interaction tests intentionally do not click the export button —
// it invokes real WebCodecs encoding which would hang or fail in Storybook.
// The rendered state depends on whether the test browser supports WebCodecs:
//   - supported   → "Browser Export (MP4)" button + description
//   - unsupported → "Browser Export is not available..." fallback
// Both branches contain text matching /Browser Export/i, so a single
// findByText covers either path.

Default.test("renders browser export panel", async ({ canvas }) => {
  await canvas.findByText(/Browser Export/i);
});

WithClips.test("renders browser export panel with clips", async ({
  canvas,
}) => {
  await canvas.findByText(/Browser Export/i);
});
