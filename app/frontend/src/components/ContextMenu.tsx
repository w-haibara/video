import { useEffect, useRef } from "react";
import { theme } from "../theme";

type MenuItem = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
};

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
        minWidth: "120px",
        boxShadow: `0 4px 12px ${theme.shadow}`,
      }}
    >
      {items.map((item, i) => (
        <button
          key={i}
          onClick={() => {
            if (!item.disabled) {
              item.onClick();
              onClose();
            }
          }}
          disabled={item.disabled}
          style={{
            display: "block",
            width: "100%",
            padding: "6px 16px",
            background: "none",
            border: "none",
            color: item.disabled ? theme.textDisabled : theme.text,
            fontSize: "12px",
            textAlign: "left",
            cursor: item.disabled ? "default" : "pointer",
          }}
          onMouseEnter={(e) => {
            if (!item.disabled) {
              (e.target as HTMLElement).style.background = theme.bgHover;
            }
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLElement).style.background = "none";
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
