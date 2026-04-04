import { useEffect, useRef } from "react";
import type { Sequence, Marker } from "@video/shared";
import { useUpdateProject } from "../api/projects";

const DEBOUNCE_MS = 1000;

export type SaveStatus = "idle" | "saving" | "saved" | "error";

export function useAutoSave(projectId: string, sequence: Sequence, markers?: Marker[]) {
  const updateProject = useUpdateProject(projectId);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef<string>(JSON.stringify({ sequence, markers }));
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
    const serialized = JSON.stringify({ sequence, markers });
    if (serialized === lastSavedRef.current) return;

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      lastSavedRef.current = serialized;
      updateProject.mutate({ sequence, markers });
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- updateProject reference changes every render; adding it would cause infinite loop
  }, [sequence, markers]);

  return { saveStatus: statusRef.current };
}
