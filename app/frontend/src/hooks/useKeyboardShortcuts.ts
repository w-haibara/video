import { useEffect, useCallback, useRef } from "react";

export type KeyboardShortcutActions = {
  onPlayPause: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onSetToolSelect: () => void;
  onSetToolRazor: () => void;
  onDeleteClip: () => void;
  onRippleDeleteClip: () => void;
  onJumpToStart: () => void;
  onJumpToEnd: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onSplitAtPlayhead: () => void;
  onToggleShortcutsHelp: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onDuplicate: () => void;
  onToggleSnap: () => void;
  onSelectAll: () => void;
  onGroup: () => void;
  onUngroup: () => void;
  onAddMarker: () => void;
  onNextMarker: () => void;
  onPrevMarker: () => void;
  onDeleteMarker: () => void;
  isPlaying: boolean;
};

/** Returns true if the event target is a text input or contenteditable element. */
function isEditableTarget(e: KeyboardEvent): boolean {
  const target = e.target as HTMLElement;
  if (!target) return false;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if (target.isContentEditable) return true;
  return false;
}

export function useKeyboardShortcuts(actions: KeyboardShortcutActions) {
  // Use refs so the effect closure always sees the latest actions
  const actionsRef = useRef(actions);
  actionsRef.current = actions;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const a = actionsRef.current;

      // Always allow undo/redo and clipboard shortcuts even in inputs
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
      if ((e.ctrlKey || e.metaKey) && (e.key === "c" || e.key === "C") && !e.shiftKey) {
        // Only handle copy when not in an editable target
        if (!isEditableTarget(e)) {
          e.preventDefault();
          a.onCopy();
          return;
        }
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === "v" || e.key === "V") && !e.shiftKey) {
        if (!isEditableTarget(e)) {
          e.preventDefault();
          a.onPaste();
          return;
        }
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === "d" || e.key === "D") && !e.shiftKey) {
        e.preventDefault();
        a.onDuplicate();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === "a" || e.key === "A") && !e.shiftKey) {
        if (!isEditableTarget(e)) {
          e.preventDefault();
          a.onSelectAll();
          return;
        }
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === "g" || e.key === "G")) {
        if (!isEditableTarget(e)) {
          e.preventDefault();
          if (e.shiftKey) {
            a.onUngroup();
          } else {
            a.onGroup();
          }
          return;
        }
      }

      // All other shortcuts are blocked when typing in inputs
      if (isEditableTarget(e)) return;

      switch (e.key) {
        case " ": // Space = play/pause
          e.preventDefault();
          a.onPlayPause();
          break;

        case "v":
        case "V":
          if (!e.ctrlKey && !e.metaKey) {
            a.onSetToolSelect();
          }
          break;

        case "c":
        case "C":
          if (!e.ctrlKey && !e.metaKey) {
            a.onSetToolRazor();
          }
          break;

        case "Delete":
        case "Backspace":
          e.preventDefault();
          if (e.shiftKey) {
            a.onRippleDeleteClip();
          } else {
            a.onDeleteClip();
          }
          break;

        case "Home":
          e.preventDefault();
          a.onJumpToStart();
          break;

        case "End":
          e.preventDefault();
          a.onJumpToEnd();
          break;

        case "ArrowLeft":
          e.preventDefault();
          if (e.shiftKey) {
            a.onPrevMarker();
          } else {
            a.onStepBackward();
          }
          break;

        case "ArrowRight":
          e.preventDefault();
          if (e.shiftKey) {
            a.onNextMarker();
          } else {
            a.onStepForward();
          }
          break;

        case "j":
        case "J":
          // J = play (alias; reverse not implemented)
          if (!a.isPlaying) a.onPlayPause();
          break;

        case "k":
        case "K":
          // K = pause
          if (a.isPlaying) a.onPlayPause();
          break;

        case "l":
        case "L":
          // L = play (alias; fast-forward not implemented)
          if (!e.ctrlKey && !e.metaKey) {
            if (!a.isPlaying) a.onPlayPause();
          }
          break;

        case "s":
        case "S":
          if (!e.ctrlKey && !e.metaKey) {
            a.onSplitAtPlayhead();
          }
          break;

        case "m":
        case "M":
          if (!e.ctrlKey && !e.metaKey) {
            a.onAddMarker();
          }
          break;

        case "n":
        case "N":
          if (!e.ctrlKey && !e.metaKey) {
            a.onToggleSnap();
          }
          break;

        case "?":
          a.onToggleShortcutsHelp();
          break;

        default:
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);
}

/** All shortcut definitions for display in the help panel. */
export const SHORTCUT_DEFINITIONS: { key: string; description: string }[] = [
  { key: "Space", description: "Play / Pause" },
  { key: "J", description: "Play" },
  { key: "K", description: "Pause" },
  { key: "L", description: "Play" },
  { key: "Home", description: "Jump to start" },
  { key: "End", description: "Jump to end" },
  { key: "\u2190 (Left)", description: "Step back one frame" },
  { key: "\u2192 (Right)", description: "Step forward one frame" },
  { key: "V", description: "Select tool" },
  { key: "C", description: "Razor tool" },
  { key: "S", description: "Split at playhead" },
  { key: "N", description: "Toggle snapping" },
  { key: "Delete", description: "Delete selected clip" },
  { key: "Shift+Delete", description: "Ripple delete selected clip" },
  { key: "Ctrl+C", description: "Copy selected clip" },
  { key: "Ctrl+V", description: "Paste clip at playhead" },
  { key: "Ctrl+D", description: "Duplicate selected clip" },
  { key: "Ctrl+A", description: "Select all clips" },
  { key: "Ctrl+G", description: "Group selected clips" },
  { key: "Ctrl+Shift+G", description: "Ungroup selected clips" },
  { key: "Ctrl+Z", description: "Undo" },
  { key: "Ctrl+Shift+Z", description: "Redo" },
  { key: "M", description: "Add marker at playhead" },
  { key: "Shift+\u2190", description: "Jump to previous marker" },
  { key: "Shift+\u2192", description: "Jump to next marker" },
  { key: "?", description: "Toggle shortcuts help" },
];
