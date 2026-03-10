import type { ExportAudioHandler, ExportBuildContext } from "../export-handler-registry";
import type { Clip } from "@video/shared";
import path from "node:path";

function buildVideoAudioConcat(videoClips: Clip[], ctx: ExportBuildContext): string {
  const audioParts: string[] = [];
  videoClips.forEach((clip, i) => {
    const a = ctx.project.assets.find((a) => a.id === clip.assetId);
    if (a?.kind === "video" && a.hasAudio) {
      const trimStart = clip.inMs / 1000;
      let dur = Math.min(clip.durationMs, clip.outMs - clip.inMs);
      if (a.durationMs) dur = Math.min(dur, a.durationMs - clip.inMs);
      ctx.filterParts.push(
        `[${i}:a]atrim=start=${trimStart}:duration=${dur / 1000},asetpts=PTS-STARTPTS[at${i}]`,
      );
      audioParts.push(`[at${i}]`);
    } else {
      const dur = clip.durationMs / 1000;
      ctx.filterParts.push(`anullsrc=r=48000:cl=stereo[sil${i}]`);
      ctx.filterParts.push(`[sil${i}]atrim=duration=${dur}[sa${i}]`);
      audioParts.push(`[sa${i}]`);
    }
  });
  const audioConcat = audioParts.join("");
  ctx.filterParts.push(
    `${audioConcat}concat=n=${videoClips.length}:v=0:a=1[va]`,
  );
  return "[va]";
}

export const audioMixHandler: ExportAudioHandler = {
  trackKind: "audio",
  buildAudio(clips: Clip[], ctx: ExportBuildContext, videoClips: Clip[]): string {
    const hasVideoAudio = videoClips.some((clip) => {
      const asset = ctx.project.assets.find((a) => a.id === clip.assetId);
      return asset?.kind === "video" && asset.hasAudio;
    });

    if (clips.length > 0) {
      const bgmClip = clips[0];
      const bgmAsset = ctx.project.assets.find((a) => a.id === bgmClip.assetId);
      if (bgmAsset) {
        const bgmPath = path.join(ctx.assetsBase, path.basename(bgmAsset.originalPath));
        const bgmInputIdx = ctx.inputIndex;
        ctx.inputArgs.push("-i", bgmPath);
        ctx.inputIndex++;
        const volume = bgmClip.volume ?? 1.0;
        const bgmStart = bgmClip.startMs / 1000;
        const bgmDuration = bgmClip.durationMs / 1000;

        if (hasVideoAudio) {
          buildVideoAudioConcat(videoClips, ctx);
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
    } else if (hasVideoAudio) {
      const audioParts: string[] = [];
      videoClips.forEach((clip, i) => {
        const a = ctx.project.assets.find((a) => a.id === clip.assetId);
        if (a?.kind === "video" && a.hasAudio) {
          const trimStart = clip.inMs / 1000;
          let dur = Math.min(clip.durationMs, clip.outMs - clip.inMs);
          if (a.durationMs) dur = Math.min(dur, a.durationMs - clip.inMs);
          ctx.filterParts.push(
            `[${i}:a]atrim=start=${trimStart}:duration=${dur / 1000},asetpts=PTS-STARTPTS[at${i}]`,
          );
          audioParts.push(`[at${i}]`);
        } else {
          const dur = clip.durationMs / 1000;
          ctx.filterParts.push(`anullsrc=r=48000:cl=stereo[sil${i}]`);
          ctx.filterParts.push(`[sil${i}]atrim=duration=${dur}[sa${i}]`);
          audioParts.push(`[sa${i}]`);
        }
      });
      const audioConcat = audioParts.join("");
      ctx.filterParts.push(
        `${audioConcat}concat=n=${videoClips.length}:v=0:a=1[outa]`,
      );
      return "[outa]";
    }

    return "";
  },
};
