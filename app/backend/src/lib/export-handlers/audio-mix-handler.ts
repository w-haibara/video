import type { ExportAudioHandler, ExportBuildContext } from "../export-handler-registry";
import type { Clip } from "@video/shared";

export const audioMixHandler: ExportAudioHandler = {
  clipKind: "audio",
  buildAudio(clips: Clip[], ctx: ExportBuildContext, videoClips: Clip[]): string {
    // Collect audio streams from video clips using clipInputIndices
    const audioStreams: { inputIdx: number; clip: Clip; asset: NonNullable<ReturnType<typeof ctx.project.assets.find>> }[] = [];

    for (const clip of videoClips) {
      const asset = ctx.project.assets.find((a) => a.id === clip.assetId);
      const inputIdx = ctx.clipInputIndices.get(clip.id);
      if (inputIdx == null || !asset) continue;
      if (asset.hasAudio) {
        audioStreams.push({ inputIdx, clip, asset });
      }
    }

    const hasBgm = clips.length > 0 && !!ctx.project.assets.find((a) => a.id === clips[0].assetId);
    const hasVideoAudio = audioStreams.length > 0;

    if (!hasVideoAudio && !hasBgm) return "";

    // Build video audio using adelay + amix for multi-track positioning
    if (hasVideoAudio) {
      const outLabel = hasBgm ? "[va]" : "[outa]";

      if (audioStreams.length === 1) {
        const { inputIdx, clip, asset } = audioStreams[0];
        const trimStart = clip.inMs / 1000;
        let dur = Math.min(clip.durationMs, clip.outMs - clip.inMs);
        if (asset.durationMs) dur = Math.min(dur, asset.durationMs - clip.inMs);

        let chain = `[${inputIdx}:a]atrim=start=${trimStart}:duration=${dur / 1000},asetpts=PTS-STARTPTS`;
        if (clip.startMs > 0) {
          const delayMs = Math.round(clip.startMs);
          chain += `,adelay=${delayMs}|${delayMs}`;
        }
        ctx.filterParts.push(`${chain}${outLabel}`);
      } else {
        const labels: string[] = [];
        audioStreams.forEach(({ inputIdx, clip, asset }, i) => {
          const trimStart = clip.inMs / 1000;
          let dur = Math.min(clip.durationMs, clip.outMs - clip.inMs);
          if (asset.durationMs) dur = Math.min(dur, asset.durationMs - clip.inMs);
          const label = `[atrk${i}]`;

          let chain = `[${inputIdx}:a]atrim=start=${trimStart}:duration=${dur / 1000},asetpts=PTS-STARTPTS`;
          if (clip.startMs > 0) {
            const delayMs = Math.round(clip.startMs);
            chain += `,adelay=${delayMs}|${delayMs}`;
          }
          ctx.filterParts.push(`${chain}${label}`);
          labels.push(label);
        });
        ctx.filterParts.push(
          `${labels.join("")}amix=inputs=${audioStreams.length}:duration=longest${outLabel}`,
        );
      }
    }

    // Handle BGM
    if (hasBgm) {
      const bgmClip = clips[0];
      const bgmAsset = ctx.project.assets.find((a) => a.id === bgmClip.assetId);
      if (bgmAsset) {
        const bgmPath = ctx.resolveAssetVideoPath(bgmAsset);
        const bgmInputIdx = ctx.inputIndex;
        ctx.inputArgs.push("-i", bgmPath);
        ctx.inputIndex++;
        const volume = bgmClip.volume ?? 1.0;
        const bgmStart = bgmClip.startMs / 1000;
        const bgmDuration = bgmClip.durationMs / 1000;

        if (hasVideoAudio) {
          ctx.filterParts.push(
            `[${bgmInputIdx}:a]atrim=start=0:duration=${bgmDuration},` +
              `adelay=${Math.round(bgmStart * 1000)}|${Math.round(bgmStart * 1000)},` +
              `volume=${volume}[bgm]`,
          );
          ctx.filterParts.push(`[va][bgm]amix=inputs=2:duration=longest[outa]`);
          return "[outa]";
        } else {
          ctx.filterParts.push(
            `[${bgmInputIdx}:a]atrim=start=0:duration=${bgmDuration},` +
              `adelay=${Math.round(bgmStart * 1000)}|${Math.round(bgmStart * 1000)},` +
              `volume=${volume}[outa]`,
          );
          return "[outa]";
        }
      }
    }

    return hasVideoAudio ? "[outa]" : "";
  },
};
