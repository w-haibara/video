import type { ReactNode } from "react";

type Props = {
  left: ReactNode;
  center: ReactNode;
  bottom: ReactNode;
};

export function EditorLayout({ left, center, bottom }: Props) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "280px 1fr",
        gridTemplateRows: "1fr 200px",
        height: "100vh",
        gap: "1px",
        background: "#222",
      }}
    >
      <div
        style={{
          gridRow: "1 / 3",
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
        }}
      >
        {center}
      </div>
      <div
        style={{
          background: "#1a1a1a",
          padding: "8px",
          overflow: "auto",
        }}
      >
        {bottom}
      </div>
    </div>
  );
}
