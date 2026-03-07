import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ImportAssetResponse } from "@video/shared";

export function useImportAsset(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File): Promise<ImportAssetResponse> => {
      const res = await fetch(
        `/api/assets/import?projectId=${projectId}&filename=${encodeURIComponent(file.name)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/octet-stream" },
          body: file,
        },
      );
      if (!res.ok) throw new Error(`Import failed: ${res.status}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", projectId] });
    },
  });
}

export function useDeleteAsset(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (assetId: string) => {
      const res = await fetch(
        `/api/assets/${assetId}?projectId=${projectId}`,
        { method: "DELETE" },
      );
      if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", projectId] });
    },
  });
}
