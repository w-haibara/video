export type UndoRedoState<T> = {
  current: T;
  past: T[];
  future: T[];
};

const MAX_HISTORY = 50;

export function createInitial<T>(value: T): UndoRedoState<T> {
  return { current: value, past: [], future: [] };
}

export function push<T>(state: UndoRedoState<T>, value: T): UndoRedoState<T> {
  return {
    current: value,
    past: [...state.past.slice(-(MAX_HISTORY - 1)), state.current],
    future: [],
  };
}

export function undo<T>(state: UndoRedoState<T>): UndoRedoState<T> {
  if (state.past.length === 0) return state;
  const prev = state.past[state.past.length - 1];
  return {
    current: prev,
    past: state.past.slice(0, -1),
    future: [state.current, ...state.future],
  };
}

export function redo<T>(state: UndoRedoState<T>): UndoRedoState<T> {
  if (state.future.length === 0) return state;
  const next = state.future[0];
  return {
    current: next,
    past: [...state.past, state.current],
    future: state.future.slice(1),
  };
}

export function canUndo<T>(state: UndoRedoState<T>): boolean {
  return state.past.length > 0;
}

export function canRedo<T>(state: UndoRedoState<T>): boolean {
  return state.future.length > 0;
}
