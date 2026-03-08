import { useRef, useState, useMemo, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { Project, Asset } from "@video/shared";
import { useImportAsset, useDeleteAsset } from "../api/assets";
import { AssetThumbnail } from "./AssetThumbnail";

type Props = {
  project: Project;
  onAddToTimeline?: (asset: Asset) => void;
};

export function AssetPanel({ project, onAddToTimeline }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importAsset = useImportAsset(project.id);
  const deleteAsset = useDeleteAsset(project.id);
  const queryClient = useQueryClient();

  // Track which assets are in use on the timeline
  const inUseAssetIds = useMemo(() => {
    const ids = new Set<string>();
    for (const track of project.sequence.tracks) {
      for (const clip of track.clips) {
        if (clip.assetId) ids.add(clip.assetId);
      }
    }
    return ids;
  }, [project.sequence]);
  const [activeJobIds, setActiveJobIds] = useState<Map<string, string>>(
    new Map(),
  );

  const handleJobComplete = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["projects", project.id] });
  }, [queryClient, project.id]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    for (const file of files) {
      const result = await importAsset.mutateAsync(file);
      setActiveJobIds(
        (prev) => new Map(prev).set(result.asset.id, result.jobId),
      );
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "8px",
        }}
      >
        <h3 style={{ margin: 0, color: "#fff" }}>Assets</h3>
        <button
          onClick={() => fileInputRef.current?.click()}
          style={{
            padding: "4px 12px",
            background: "#3a6ad4",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "12px",
          }}
        >
          + Import
        </button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="video/*,image/*,audio/*,.heic"
        style={{ display: "none" }}
        onChange={handleFileSelect}
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
          gap: "4px",
        }}
      >
        {project.assets.map((asset: Asset) => (
          <AssetThumbnail
            key={asset.id}
            asset={asset}
            projectId={project.id}
            jobId={activeJobIds.get(asset.id) ?? null}
            onAddToTimeline={onAddToTimeline}
            onDelete={(assetId) => deleteAsset.mutate(assetId)}
            isInUse={inUseAssetIds.has(asset.id)}
            onJobComplete={handleJobComplete}
          />
        ))}
      </div>
    </div>
  );
}
