import { useEffect, useRef } from "react";
import { SHORTCUT_DEFINITIONS } from "../hooks/useKeyboardShortcuts";
import { theme } from "../theme";

type Props = {
  onClose: () => void;
};

export function KeyboardShortcutsPanel({ onClose }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape or clicking outside
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClick);
    };
  }, [onClose]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.3)",
        zIndex: 10000,
      }}
    >
      <div
        ref={panelRef}
        style={{
          background: theme.bg,
          border: `1px solid ${theme.border}`,
          borderRadius: "8px",
          padding: "20px 28px",
          minWidth: "340px",
          maxWidth: "440px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "16px", color: theme.text }}>
            Keyboard Shortcuts
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: theme.textMuted,
              cursor: "pointer",
              fontSize: "18px",
              padding: "0 4px",
              lineHeight: 1,
            }}
          >
            x
          </button>
        </div>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "13px",
          }}
        >
          <tbody>
            {SHORTCUT_DEFINITIONS.map(({ key, description }) => (
              <tr key={key}>
                <td
                  style={{
                    padding: "4px 12px 4px 0",
                    color: theme.text,
                    whiteSpace: "nowrap",
                    fontWeight: 600,
                    fontFamily: "monospace",
                  }}
                >
                  <kbd
                    style={{
                      background: theme.bgHover,
                      border: `1px solid ${theme.border}`,
                      borderRadius: "3px",
                      padding: "1px 6px",
                      fontSize: "12px",
                    }}
                  >
                    {key}
                  </kbd>
                </td>
                <td
                  style={{
                    padding: "4px 0",
                    color: theme.textMuted,
                  }}
                >
                  {description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
