import { useState, useCallback, useRef, useEffect } from "react";
import type { Marker } from "@video/shared";
import { theme } from "../theme";

const DEFAULT_MARKER_COLOR = "#F5A623";
const MARKER_SIZE = 8;

type Props = {
  markers: Marker[];
  msToPx: (ms: number) => number;
  selectedMarkerId: string | null;
  onSelectMarker: (markerId: string | null) => void;
  onDeleteMarker: (markerId: string) => void;
  onUpdateMarker: (markerId: string, updates: { label?: string }) => void;
};

export function TimelineMarkers({
  markers,
  msToPx,
  selectedMarkerId,
  onSelectMarker,
  onDeleteMarker,
  onUpdateMarker,
}: Props) {
  const [editingMarkerId, setEditingMarkerId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingMarkerId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingMarkerId]);

  const handleDoubleClick = useCallback(
    (marker: Marker) => {
      setEditingMarkerId(marker.id);
      setEditLabel(marker.label ?? "");
    },
    [],
  );

  const commitEdit = useCallback(() => {
    if (editingMarkerId) {
      onUpdateMarker(editingMarkerId, { label: editLabel || undefined });
      setEditingMarkerId(null);
    }
  }, [editingMarkerId, editLabel, onUpdateMarker]);

  const cancelEdit = useCallback(() => {
    setEditingMarkerId(null);
  }, []);

  return (
    <>
      {markers.map((marker) => {
        const x = msToPx(marker.timeMs);
        const color = marker.color ?? DEFAULT_MARKER_COLOR;
        const isSelected = marker.id === selectedMarkerId;
        const isEditing = marker.id === editingMarkerId;

        return (
          <div
            key={marker.id}
            style={{
              position: "absolute",
              left: `${x}px`,
              top: 0,
              transform: "translateX(-50%)",
              zIndex: 15,
              cursor: "pointer",
              userSelect: "none",
            }}
            onClick={(e) => {
              e.stopPropagation();
              onSelectMarker(isSelected ? null : marker.id);
            }}
            onDoubleClick={(e) => {
              e.stopPropagation();
              handleDoubleClick(marker);
            }}
            onKeyDown={(e) => {
              if (e.key === "Delete" || e.key === "Backspace") {
                if (isSelected && !isEditing) {
                  e.stopPropagation();
                  onDeleteMarker(marker.id);
                }
              }
            }}
          >
            {/* Diamond marker */}
            <div
              style={{
                width: `${MARKER_SIZE}px`,
                height: `${MARKER_SIZE}px`,
                background: color,
                transform: "rotate(45deg)",
                border: isSelected
                  ? `2px solid ${theme.white}`
                  : `1px solid ${color}`,
                margin: "0 auto",
                boxSizing: "border-box",
              }}
            />
            {/* Vertical line */}
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: `${MARKER_SIZE}px`,
                width: "1px",
                height: "16px",
                background: color,
                opacity: 0.6,
                transform: "translateX(-50%)",
                pointerEvents: "none",
              }}
            />
            {/* Label */}
            {isEditing ? (
              <input
                ref={inputRef}
                value={editLabel}
                onChange={(e) => setEditLabel(e.target.value)}
                onBlur={commitEdit}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitEdit();
                  if (e.key === "Escape") cancelEdit();
                  e.stopPropagation();
                }}
                onMouseDown={(e) => e.stopPropagation()}
                style={{
                  position: "absolute",
                  top: "-2px",
                  left: `${MARKER_SIZE + 4}px`,
                  width: "80px",
                  fontSize: "10px",
                  padding: "1px 3px",
                  background: theme.bgDark,
                  color: theme.text,
                  border: `1px solid ${theme.primary}`,
                  borderRadius: "2px",
                  outline: "none",
                }}
              />
            ) : marker.label ? (
              <div
                style={{
                  position: "absolute",
                  top: "-2px",
                  left: `${MARKER_SIZE + 2}px`,
                  fontSize: "9px",
                  color,
                  whiteSpace: "nowrap",
                  pointerEvents: "none",
                }}
              >
                {marker.label}
              </div>
            ) : null}
          </div>
        );
      })}
    </>
  );
}
