import type { ExportOverlayHandler, ExportBuildContext } from "../export-handler-registry";
import type { Clip } from "@video/shared";
import { sanitizeColor } from "../../services/export-service";

export const textOverlayHandler: ExportOverlayHandler = {
  trackKind: "title",
  buildOverlay(clips: Clip[], ctx: ExportBuildContext, videoOutLabel: string): string {
    const projectDurationMs = ctx.project.settings?.durationMs;

    const textClips = clips.filter(
      (tc) => projectDurationMs == null || tc.startMs < projectDurationMs,
    );

    let currentOut = videoOutLabel;

    textClips.forEach((textClip, i) => {
      if (!textClip.text) return;
      const enableStart = textClip.startMs / 1000;
      const rawEnd = textClip.startMs + textClip.durationMs;
      const clampedEnd = projectDurationMs != null ? Math.min(rawEnd, projectDurationMs) : rawEnd;
      const enableEnd = clampedEnd / 1000;
      const escapedText = textClip.text.value
        .replace(/'/g, "'\\''")
        .replace(/:/g, "\\:");
      const fontSize = Math.max(8, Math.min(500, Math.round(textClip.text.fontSize ?? 48)));
      const fontColor = sanitizeColor(textClip.text.color ?? "white");
      const bgColor = sanitizeColor(textClip.text.backgroundColor ?? "black@0.5");
      const prevOut = i === 0 ? videoOutLabel : `[txt${i - 1}]`;
      const curOut = `[txt${i}]`;

      ctx.filterParts.push(
        `${prevOut}drawtext=text='${escapedText}':fontsize=${fontSize}:` +
          `fontcolor=${fontColor}:box=1:boxcolor=${bgColor}:boxborderw=8:` +
          `x=(w-text_w)/2:y=h-th-40:enable='between(t,${enableStart},${enableEnd})'${curOut}`,
      );
      currentOut = curOut;
    });

    return currentOut;
  },
};
