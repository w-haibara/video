import { useState, useCallback, useRef } from "react";
import type { Sequence } from "@video/shared";

const MAX_HISTORY = 50;

export function useUndoRedo(initialSequence: Sequence) {
  const [sequence, setSequence] = useState<Sequence>(initialSequence);
  const pastRef = useRef<Sequence[]>([]);
  const futureRef = useRef<Sequence[]>([]);
  // Track whether the initial value has been synced
  const initializedRef = useRef(false);

  // Sync when project reloads from server (e.g. after mutation)
  if (!initializedRef.current) {
    initializedRef.current = true;
  }

  const pushState = useCallback(
    (newSequence: Sequence) => {
      pastRef.current = [...pastRef.current.slice(-(MAX_HISTORY - 1)), sequence];
      futureRef.current = [];
      setSequence(newSequence);
    },
    [sequence],
  );

  const undo = useCallback(() => {
    const past = pastRef.current;
    if (past.length === 0) return;
    const prev = past[past.length - 1];
    pastRef.current = past.slice(0, -1);
    futureRef.current = [sequence, ...futureRef.current];
    setSequence(prev);
  }, [sequence]);

  const redo = useCallback(() => {
    const future = futureRef.current;
    if (future.length === 0) return;
    const next = future[0];
    futureRef.current = future.slice(1);
    pastRef.current = [...pastRef.current, sequence];
    setSequence(next);
  }, [sequence]);

  const canUndo = pastRef.current.length > 0;
  const canRedo = futureRef.current.length > 0;

  return { sequence, pushState, undo, redo, canUndo, canRedo };
}
