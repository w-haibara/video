import { useState, useCallback, useRef } from "react";
import type { Sequence } from "@video/shared";
import * as UndoRedo from "../lib/undo-redo";

export function useUndoRedo(initialSequence: Sequence) {
  const [state, setState] = useState(() =>
    UndoRedo.createInitial(initialSequence),
  );

  const pushState = useCallback((newSequence: Sequence) => {
    setState((s) => UndoRedo.push(s, newSequence));
  }, []);

  const undo = useCallback(() => {
    setState((s) => UndoRedo.undo(s));
  }, []);

  const redo = useCallback(() => {
    setState((s) => UndoRedo.redo(s));
  }, []);

  return {
    sequence: state.current,
    pushState,
    undo,
    redo,
    canUndo: UndoRedo.canUndo(state),
    canRedo: UndoRedo.canRedo(state),
  };
}
