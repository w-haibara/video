import { useEffect, useRef, useState } from "react";
import { clipKindRegistry } from "../lib/clip-kind-registry";
import { theme } from "../theme";

type Props = {
  position: { x: number; y: number };
  onSelect: (clipKind: string) => void;
  onClose: () => void;
};

export function ClipKindPopup({ position, onSelect, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [adjustedPos, setAdjustedPos] = useState(position);

  // Clamp to viewport after mount
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = position.x + rect.width > window.innerWidth
      ? Math.max(0, window.innerWidth - rect.width - 8)
      : position.x;
    const y = position.y + rect.height > window.innerHeight
      ? Math.max(0, window.innerHeight - rect.height - 8)
      : position.y;
    if (x !== position.x || y !== position.y) {
      setAdjustedPos({ x, y });
    }
  }, [position]);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const kinds = clipKindRegistry.all();

  return (
    <div
      ref={ref}
      style={{
        position: "fixed",
        left: adjustedPos.x,
        top: adjustedPos.y,
        background: theme.bgPanel,
        border: `1px solid ${theme.border}`,
        borderRadius: "6px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        padding: "4px 0",
        zIndex: 1000,
        minWidth: "120px",
      }}
    >
      <div
        style={{
          padding: "4px 10px",
          fontSize: "10px",
          color: theme.textMuted,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        Add clip
      </div>
      {kinds.map((desc) => (
        <button
          key={desc.kind}
          onClick={() => onSelect(desc.kind)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            width: "100%",
            padding: "6px 10px",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "12px",
            color: theme.text,
            textAlign: "left",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = theme.bgHover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "none";
          }}
        >
          <span
            style={{
              display: "inline-block",
              width: "14px",
              height: "14px",
              borderRadius: "3px",
              background: desc.clipColor,
              flexShrink: 0,
            }}
          />
          <span>{desc.kind}</span>
        </button>
      ))}
    </div>
  );
}
