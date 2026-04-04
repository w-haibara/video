import { useEffect, useRef } from "react";
import { theme } from "../theme";

type MenuAction = {
  type?: "item";
  label: string;
  shortcut?: string;
  onClick: () => void;
  disabled?: boolean;
};

type MenuSeparator = {
  type: "separator";
  id: string;
};

export type MenuItem = MenuAction | MenuSeparator;

type Props = {
  items: MenuItem[];
  position: { x: number; y: number };
  onClose: () => void;
};

export function ContextMenu({ items, position, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      style={{
        position: "fixed",
        left: position.x,
        top: position.y,
        background: theme.bg,
        border: `1px solid ${theme.border}`,
        borderRadius: "4px",
        padding: "4px 0",
        zIndex: 1000,
        minWidth: "180px",
        boxShadow: `0 4px 12px ${theme.shadow}`,
      }}
    >
      {items.map((item, i) => {
        if (item.type === "separator") {
          return (
            <div
              key={item.id}
              style={{
                height: "1px",
                background: theme.border,
                margin: "4px 0",
              }}
            />
          );
        }

        const action = item as MenuAction;
        return (
          <button
            key={action.label}
            onClick={() => {
              if (!action.disabled) {
                action.onClick();
                onClose();
              }
            }}
            disabled={action.disabled}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              padding: "6px 16px",
              background: "none",
              border: "none",
              color: action.disabled ? theme.textDisabled : theme.text,
              fontSize: "12px",
              textAlign: "left",
              cursor: action.disabled ? "default" : "pointer",
            }}
            onMouseEnter={(e) => {
              if (!action.disabled) {
                (e.currentTarget as HTMLElement).style.background = theme.bgHover;
              }
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "none";
            }}
          >
            <span>{action.label}</span>
            {action.shortcut && (
              <span
                style={{
                  color: theme.textDisabled,
                  fontSize: "11px",
                  marginLeft: "24px",
                }}
              >
                {action.shortcut}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
