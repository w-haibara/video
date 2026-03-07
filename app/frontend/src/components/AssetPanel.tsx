import { useRef, useState } from "react";
import type { Project, Asset } from "@video/shared";
import { useImportAsset } from "../api/assets";
import { AssetThumbnail } from "./AssetThumbnail";

type Props = {
  project: Project;
  onAddToTimeline?: (asset: Asset) => void;
};

export function AssetPanel({ project, onAddToTimeline }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importAsset = useImportAsset(project.id);
  const [activeJobIds, setActiveJobIds] = useState<Map<string, string>>(
    new Map(),
  );

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
        <button onClick={() => fileInputRef.current?.click()}>
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
        {project.assets.map((asset) => (
          <AssetThumbnail
            key={asset.id}
            asset={asset}
            projectId={project.id}
            jobId={activeJobIds.get(asset.id) ?? null}
            onAddToTimeline={onAddToTimeline}
          />
        ))}
      </div>
    </div>
  );
}
