import { describe, test, expect } from "bun:test";
import { createInitial, push, undo, redo, canUndo, canRedo } from "./undo-redo";

describe("undo-redo", () => {
  test("createInitial sets current and empty history", () => {
    const state = createInitial("a");
    expect(state.current).toBe("a");
    expect(state.past).toEqual([]);
    expect(state.future).toEqual([]);
  });

  test("push adds current to past and sets new value", () => {
    let state = createInitial("a");
    state = push(state, "b");
    expect(state.current).toBe("b");
    expect(state.past).toEqual(["a"]);
    expect(state.future).toEqual([]);
  });

  test("push clears future", () => {
    let state = createInitial("a");
    state = push(state, "b");
    state = undo(state); // current=a, future=[b]
    state = push(state, "c"); // should clear future
    expect(state.current).toBe("c");
    expect(state.future).toEqual([]);
  });

  test("undo restores previous state", () => {
    let state = createInitial("a");
    state = push(state, "b");
    state = push(state, "c");
    state = undo(state);
    expect(state.current).toBe("b");
    expect(state.past).toEqual(["a"]);
    expect(state.future).toEqual(["c"]);
  });

  test("undo does nothing when past is empty", () => {
    const state = createInitial("a");
    const result = undo(state);
    expect(result).toBe(state);
  });

  test("redo restores next state", () => {
    let state = createInitial("a");
    state = push(state, "b");
    state = push(state, "c");
    state = undo(state); // b
    state = undo(state); // a
    state = redo(state); // b
    expect(state.current).toBe("b");
    expect(state.past).toEqual(["a"]);
    expect(state.future).toEqual(["c"]);
  });

  test("redo does nothing when future is empty", () => {
    const state = createInitial("a");
    const result = redo(state);
    expect(result).toBe(state);
  });

  test("canUndo and canRedo", () => {
    let state = createInitial("a");
    expect(canUndo(state)).toBe(false);
    expect(canRedo(state)).toBe(false);

    state = push(state, "b");
    expect(canUndo(state)).toBe(true);
    expect(canRedo(state)).toBe(false);

    state = undo(state);
    expect(canUndo(state)).toBe(false);
    expect(canRedo(state)).toBe(true);
  });

  test("limits history to 50 entries", () => {
    let state = createInitial(0);
    for (let i = 1; i <= 60; i++) {
      state = push(state, i);
    }
    expect(state.past.length).toBe(50);
    expect(state.past[0]).toBe(10); // oldest kept (60 pushes, keep last 49 in past)
    expect(state.current).toBe(60);
  });
});
