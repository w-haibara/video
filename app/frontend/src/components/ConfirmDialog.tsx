import { useEffect, useRef } from "react";
import { theme, buttonStyle, radius, fontSize, spacing } from "../theme";

type Props = {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({ message, onConfirm, onCancel }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onCancel]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: theme.overlay,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
      }}
      onMouseDown={(e) => {
        if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
          onCancel();
        }
      }}
    >
      <div
        ref={dialogRef}
        style={{
          background: theme.bg,
          border: `1px solid ${theme.border}`,
          borderRadius: radius.xl,
          padding: spacing.lg,
          minWidth: "280px",
          maxWidth: "400px",
          boxShadow: `0 8px 24px ${theme.shadow}`,
        }}
      >
        <p style={{ color: theme.text, fontSize: fontSize.md, margin: `0 0 ${spacing.lg}px` }}>
          {message}
        </p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: spacing.sm }}>
          <button
            onClick={onCancel}
            style={buttonStyle.secondary}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={buttonStyle.danger}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
