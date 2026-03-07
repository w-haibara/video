import type { SaveStatus } from "../hooks/useAutoSave";

type Props = {
  status: SaveStatus;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
};

const STATUS_LABEL: Record<SaveStatus, string> = {
  idle: "",
  saving: "Saving...",
  saved: "Saved",
  error: "Save failed",
};

const STATUS_COLOR: Record<SaveStatus, string> = {
  idle: "#666",
  saving: "#fa0",
  saved: "#4a4",
  error: "#f44",
};

export function SaveIndicator({
  status,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}: Props) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        padding: "0 8px",
        fontSize: "12px",
      }}
    >
      <button
        onClick={onUndo}
        disabled={!canUndo}
        title="Undo (Ctrl+Z)"
        style={{
          background: "none",
          border: "none",
          color: canUndo ? "#ccc" : "#555",
          cursor: canUndo ? "pointer" : "default",
          fontSize: "14px",
          padding: "2px 4px",
        }}
      >
        ↩
      </button>
      <button
        onClick={onRedo}
        disabled={!canRedo}
        title="Redo (Ctrl+Shift+Z)"
        style={{
          background: "none",
          border: "none",
          color: canRedo ? "#ccc" : "#555",
          cursor: canRedo ? "pointer" : "default",
          fontSize: "14px",
          padding: "2px 4px",
        }}
      >
        ↪
      </button>
      {status !== "idle" && (
        <span style={{ color: STATUS_COLOR[status] }}>
          {STATUS_LABEL[status]}
        </span>
      )}
    </div>
  );
}
