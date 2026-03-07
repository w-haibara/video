import { useEffect, useRef } from "react";
import type { Sequence } from "@video/shared";
import { useUpdateProject } from "../api/projects";

const DEBOUNCE_MS = 1000;

export type SaveStatus = "idle" | "saving" | "saved" | "error";

export function useAutoSave(projectId: string, sequence: Sequence) {
  const updateProject = useUpdateProject(projectId);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef<string>(JSON.stringify(sequence));
  const statusRef = useRef<SaveStatus>("idle");

  // Update status based on mutation state
  if (updateProject.isPending) {
    statusRef.current = "saving";
  } else if (updateProject.isError) {
    statusRef.current = "error";
  } else if (updateProject.isSuccess) {
    statusRef.current = "saved";
  }

  useEffect(() => {
    const serialized = JSON.stringify(sequence);
    if (serialized === lastSavedRef.current) return;

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      lastSavedRef.current = serialized;
      updateProject.mutate({ sequence });
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [sequence]);

  return { saveStatus: statusRef.current };
}
