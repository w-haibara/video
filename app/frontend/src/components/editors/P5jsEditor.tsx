import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../../api/client";
import { useJob } from "../../api/jobs";
import { theme, buttonStyle } from "../../theme";
import type { InspectorEditorContext } from "../../lib/inspector-editor-registry";

type ContentResponse = { content: string };
type ReprocessResponse = { jobId: string };

export function P5jsEditor({ asset, projectId }: InspectorEditorContext) {
  const queryClient = useQueryClient();
  const assetId = asset?.id ?? "";

  // Fetch existing code
  const { data, isLoading } = useQuery({
    queryKey: ["asset-content", projectId, assetId],
    queryFn: () =>
      apiFetch<ContentResponse>(
        `/api/projects/${projectId}/assets/${assetId}/content`,
      ),
    enabled: !!assetId,
  });

  const [code, setCode] = useState("");
  const [dirty, setDirty] = useState(false);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Sync fetched content into editor
  useEffect(() => {
    if (data?.content != null && !dirty) {
      setCode(data.content);
    }
  }, [data?.content, dirty]);

  // Reset dirty flag when asset changes
  useEffect(() => {
    setDirty(false);
    setActiveJobId(null);
    setError(null);
  }, [assetId]);

  // Poll job status
  const { data: job } = useJob(activeJobId);

  // When job completes, invalidate project to refresh proxy URLs
  useEffect(() => {
    if (job?.status === "completed") {
      queryClient.invalidateQueries({ queryKey: ["projects", projectId] });
      setActiveJobId(null);
    }
  }, [job?.status, projectId, queryClient]);

  const isSaving = activeJobId != null && job?.status !== "completed" && job?.status !== "failed";

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value);
    setDirty(true);
    setError(null);
  }, []);

  const savingRef = useRef(false);

  const handleSaveAndRender = useCallback(async () => {
    if (!assetId || savingRef.current) return;
    savingRef.current = true;
    setError(null);
    try {
      // Save content
      await apiFetch(`/api/projects/${projectId}/assets/${assetId}/content`, {
        method: "PUT",
        body: JSON.stringify({ content: code }),
      });
      setDirty(false);

      // Trigger reprocess
      const result = await apiFetch<ReprocessResponse>(
        `/api/projects/${projectId}/assets/${assetId}/reprocess`,
        { method: "POST" },
      );
      setActiveJobId(result.jobId);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      savingRef.current = false;
    }
  }, [assetId, projectId, code]);

  if (!assetId) {
    return (
      <div style={{ marginTop: "8px", color: theme.textMuted, fontSize: "11px" }}>
        Assign a p5.js asset to edit code.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div style={{ marginTop: "8px", color: theme.textMuted, fontSize: "11px" }}>
        Loading sketch...
      </div>
    );
  }

  return (
    <div style={{ marginTop: "8px" }}>
      <label style={{ color: theme.textMuted, display: "block", marginBottom: "4px" }}>
        p5.js Sketch
      </label>
      <textarea
        value={code}
        onChange={handleChange}
        spellCheck={false}
        data-testid="p5js-code-editor"
        style={{
          width: "100%",
          minHeight: "200px",
          fontFamily: "monospace",
          fontSize: "11px",
          color: theme.text,
          backgroundColor: theme.bgPanel,
          border: `1px solid ${theme.border}`,
          borderRadius: "4px",
          padding: "8px",
          resize: "vertical",
          boxSizing: "border-box",
          tabSize: 2,
          lineHeight: 1.4,
        }}
      />
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
        <button
          onClick={handleSaveAndRender}
          disabled={isSaving || !dirty}
          style={{
            ...buttonStyle.primary,
            padding: "4px 12px",
            fontSize: "11px",
            opacity: isSaving || !dirty ? 0.5 : 1,
            cursor: isSaving || !dirty ? "default" : "pointer",
          }}
          data-testid="p5js-save-render"
        >
          {isSaving ? "Rendering..." : "Save & Render"}
        </button>
        {dirty && !isSaving && (
          <span style={{ color: theme.textMuted, fontSize: "10px" }}>Unsaved changes</span>
        )}
        {job?.status === "completed" && !dirty && (
          <span style={{ color: theme.success, fontSize: "10px" }}>Render complete</span>
        )}
        {(job?.status === "failed" || error) && (
          <span style={{ color: theme.error, fontSize: "10px" }}>
            {error ?? job?.error ?? "Render failed"}
          </span>
        )}
      </div>
    </div>
  );
}
