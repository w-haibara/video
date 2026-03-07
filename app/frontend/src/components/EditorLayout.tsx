import type { ReactNode } from "react";

type Props = {
  left: ReactNode;
  center: ReactNode;
  right?: ReactNode;
  bottom: ReactNode;
};

export function EditorLayout({ left, center, right, bottom }: Props) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: right ? "240px 1fr 240px" : "240px 1fr",
        gridTemplateRows: "1fr 220px",
        height: "100vh",
        gap: "1px",
        background: "#222",
      }}
    >
      <div
        style={{
          overflow: "auto",
          background: "#1a1a1a",
          padding: "8px",
        }}
      >
        {left}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#111",
          overflow: "hidden",
        }}
      >
        {center}
      </div>
      {right && (
        <div
          style={{
            overflow: "auto",
            background: "#1a1a1a",
            borderLeft: "1px solid #333",
          }}
        >
          {right}
        </div>
      )}
      <div
        style={{
          background: "#1a1a1a",
          overflow: "hidden",
          gridColumn: "1 / -1",
        }}
      >
        {bottom}
      </div>
    </div>
  );
}
