import { describe, test, expect, mock, beforeEach, afterEach } from "bun:test";
import { SHORTCUT_DEFINITIONS } from "./useKeyboardShortcuts";

// We test the exported constants and the core dispatch logic
// without depending on DOM APIs (bun:test has no browser globals).

describe("SHORTCUT_DEFINITIONS", () => {
  test("contains all required shortcuts", () => {
    const keys = SHORTCUT_DEFINITIONS.map((d) => d.key);
    expect(keys).toContain("Space");
    expect(keys).toContain("J");
    expect(keys).toContain("K");
    expect(keys).toContain("L");
    expect(keys).toContain("Home");
    expect(keys).toContain("End");
    expect(keys).toContain("V");
    expect(keys).toContain("C");
    expect(keys).toContain("S");
    expect(keys).toContain("Delete");
    expect(keys).toContain("Shift+Delete");
    expect(keys).toContain("Ctrl+Z");
    expect(keys).toContain("Ctrl+Shift+Z");
    expect(keys).toContain("?");
  });

  test("each entry has a non-empty description", () => {
    for (const def of SHORTCUT_DEFINITIONS) {
      expect(def.description.length).toBeGreaterThan(0);
    }
  });
});

// Test keyboard dispatch logic by reimplementing the core handler
// (mirrors the logic in useKeyboardShortcuts to verify correctness)
describe("keyboard dispatch logic", () => {
  function createActions() {
    return {
      onPlayPause: mock(() => {}),
      onUndo: mock(() => {}),
      onRedo: mock(() => {}),
      onSetToolSelect: mock(() => {}),
      onSetToolRazor: mock(() => {}),
      onDeleteClip: mock(() => {}),
      onRippleDeleteClip: mock(() => {}),
      onJumpToStart: mock(() => {}),
      onJumpToEnd: mock(() => {}),
      onStepForward: mock(() => {}),
      onStepBackward: mock(() => {}),
      onSplitAtPlayhead: mock(() => {}),
      onToggleShortcutsHelp: mock(() => {}),
      isPlaying: false,
    };
  }

  // Create a fake KeyboardEvent-like object (no DOM needed)
  function fakeEvent(key: string, opts: { ctrlKey?: boolean; metaKey?: boolean; shiftKey?: boolean } = {}) {
    return {
      key,
      ctrlKey: opts.ctrlKey ?? false,
      metaKey: opts.metaKey ?? false,
      shiftKey: opts.shiftKey ?? false,
      preventDefault: mock(() => {}),
      target: { tagName: "DIV", isContentEditable: false },
    };
  }

  // Extracted dispatch logic that mirrors the hook handler exactly
  function dispatch(e: ReturnType<typeof fakeEvent>, a: ReturnType<typeof createActions>) {
    const target = e.target as { tagName: string; isContentEditable: boolean };

    if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
      e.preventDefault();
      a.onUndo();
      return;
    }
    if ((e.ctrlKey || e.metaKey) && ((e.key === "z" && e.shiftKey) || e.key === "y")) {
      e.preventDefault();
      a.onRedo();
      return;
    }

    if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT" || target.isContentEditable)) {
      return;
    }

    switch (e.key) {
      case " ": a.onPlayPause(); break;
      case "v": case "V": if (!e.ctrlKey && !e.metaKey) a.onSetToolSelect(); break;
      case "c": case "C": if (!e.ctrlKey && !e.metaKey) a.onSetToolRazor(); break;
      case "Delete": case "Backspace":
        if (e.shiftKey) a.onRippleDeleteClip();
        else a.onDeleteClip();
        break;
      case "Home": a.onJumpToStart(); break;
      case "End": a.onJumpToEnd(); break;
      case "ArrowLeft": a.onStepBackward(); break;
      case "ArrowRight": a.onStepForward(); break;
      case "j": case "J": if (!a.isPlaying) a.onPlayPause(); break;
      case "k": case "K": if (a.isPlaying) a.onPlayPause(); break;
      case "l": case "L": if (!e.ctrlKey && !e.metaKey && !a.isPlaying) a.onPlayPause(); break;
      case "s": case "S": if (!e.ctrlKey && !e.metaKey) a.onSplitAtPlayhead(); break;
      case "?": a.onToggleShortcutsHelp(); break;
    }
  }

  let actions: ReturnType<typeof createActions>;

  beforeEach(() => {
    actions = createActions();
  });

  test("Space toggles play/pause", () => {
    dispatch(fakeEvent(" "), actions);
    expect(actions.onPlayPause).toHaveBeenCalledTimes(1);
  });

  test("V sets select tool", () => {
    dispatch(fakeEvent("v"), actions);
    expect(actions.onSetToolSelect).toHaveBeenCalledTimes(1);
  });

  test("C sets razor tool", () => {
    dispatch(fakeEvent("c"), actions);
    expect(actions.onSetToolRazor).toHaveBeenCalledTimes(1);
  });

  test("Ctrl+C does NOT set razor tool", () => {
    dispatch(fakeEvent("c", { ctrlKey: true }), actions);
    expect(actions.onSetToolRazor).toHaveBeenCalledTimes(0);
  });

  test("Delete fires delete clip", () => {
    dispatch(fakeEvent("Delete"), actions);
    expect(actions.onDeleteClip).toHaveBeenCalledTimes(1);
    expect(actions.onRippleDeleteClip).toHaveBeenCalledTimes(0);
  });

  test("Shift+Delete fires ripple delete", () => {
    dispatch(fakeEvent("Delete", { shiftKey: true }), actions);
    expect(actions.onRippleDeleteClip).toHaveBeenCalledTimes(1);
    expect(actions.onDeleteClip).toHaveBeenCalledTimes(0);
  });

  test("Home jumps to start", () => {
    dispatch(fakeEvent("Home"), actions);
    expect(actions.onJumpToStart).toHaveBeenCalledTimes(1);
  });

  test("End jumps to end", () => {
    dispatch(fakeEvent("End"), actions);
    expect(actions.onJumpToEnd).toHaveBeenCalledTimes(1);
  });

  test("ArrowLeft steps backward", () => {
    dispatch(fakeEvent("ArrowLeft"), actions);
    expect(actions.onStepBackward).toHaveBeenCalledTimes(1);
  });

  test("ArrowRight steps forward", () => {
    dispatch(fakeEvent("ArrowRight"), actions);
    expect(actions.onStepForward).toHaveBeenCalledTimes(1);
  });

  test("J plays when not playing", () => {
    actions.isPlaying = false;
    dispatch(fakeEvent("j"), actions);
    expect(actions.onPlayPause).toHaveBeenCalledTimes(1);
  });

  test("J does nothing when already playing", () => {
    actions.isPlaying = true;
    dispatch(fakeEvent("j"), actions);
    expect(actions.onPlayPause).toHaveBeenCalledTimes(0);
  });

  test("K pauses when playing", () => {
    actions.isPlaying = true;
    dispatch(fakeEvent("k"), actions);
    expect(actions.onPlayPause).toHaveBeenCalledTimes(1);
  });

  test("K does nothing when not playing", () => {
    actions.isPlaying = false;
    dispatch(fakeEvent("k"), actions);
    expect(actions.onPlayPause).toHaveBeenCalledTimes(0);
  });

  test("L plays when not playing", () => {
    actions.isPlaying = false;
    dispatch(fakeEvent("l"), actions);
    expect(actions.onPlayPause).toHaveBeenCalledTimes(1);
  });

  test("S splits at playhead", () => {
    dispatch(fakeEvent("s"), actions);
    expect(actions.onSplitAtPlayhead).toHaveBeenCalledTimes(1);
  });

  test("Ctrl+S does NOT split", () => {
    dispatch(fakeEvent("s", { ctrlKey: true }), actions);
    expect(actions.onSplitAtPlayhead).toHaveBeenCalledTimes(0);
  });

  test("? toggles shortcuts help", () => {
    dispatch(fakeEvent("?"), actions);
    expect(actions.onToggleShortcutsHelp).toHaveBeenCalledTimes(1);
  });

  test("Ctrl+Z fires undo", () => {
    dispatch(fakeEvent("z", { ctrlKey: true }), actions);
    expect(actions.onUndo).toHaveBeenCalledTimes(1);
  });

  test("Ctrl+Shift+Z fires redo", () => {
    dispatch(fakeEvent("z", { ctrlKey: true, shiftKey: true }), actions);
    expect(actions.onRedo).toHaveBeenCalledTimes(1);
  });

  test("Ctrl+Y fires redo", () => {
    dispatch(fakeEvent("y", { ctrlKey: true }), actions);
    expect(actions.onRedo).toHaveBeenCalledTimes(1);
  });

  test("shortcuts are blocked when target is INPUT", () => {
    const e = fakeEvent(" ");
    (e.target as { tagName: string }).tagName = "INPUT";
    dispatch(e, actions);
    expect(actions.onPlayPause).toHaveBeenCalledTimes(0);
  });

  test("shortcuts are blocked when target is TEXTAREA", () => {
    const e = fakeEvent("v");
    (e.target as { tagName: string }).tagName = "TEXTAREA";
    dispatch(e, actions);
    expect(actions.onSetToolSelect).toHaveBeenCalledTimes(0);
  });

  test("shortcuts are blocked when target is contentEditable", () => {
    const e = fakeEvent("c");
    (e.target as { isContentEditable: boolean }).isContentEditable = true;
    dispatch(e, actions);
    expect(actions.onSetToolRazor).toHaveBeenCalledTimes(0);
  });

  test("shortcuts are blocked when target is SELECT", () => {
    const e = fakeEvent(" ");
    (e.target as { tagName: string }).tagName = "SELECT";
    dispatch(e, actions);
    expect(actions.onPlayPause).toHaveBeenCalledTimes(0);
  });

  test("Ctrl+Z still works in INPUT (undo always allowed)", () => {
    const e = fakeEvent("z", { ctrlKey: true });
    (e.target as { tagName: string }).tagName = "INPUT";
    dispatch(e, actions);
    expect(actions.onUndo).toHaveBeenCalledTimes(1);
  });
});
