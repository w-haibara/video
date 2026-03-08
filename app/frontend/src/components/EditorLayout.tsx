import type { ReactNode } from "react";

type Props = {
  preview: ReactNode;
  mainPanel: ReactNode;
  bottom: ReactNode;
};

export function EditorLayout({ preview, mainPanel, bottom }: Props) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 2fr",
        gridTemplateRows: "1fr 220px",
        height: "100vh",
        gap: "1px",
        background: "#222",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#111",
          overflow: "hidden",
        }}
      >
        {preview}
      </div>
      <div
        style={{
          background: "#1a1a1a",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {mainPanel}
      </div>
      <div
        style={{
          background: "#1a1a1a",
          overflow: "hidden",
          gridColumn: "1 / -1",
          gridRow: 2,
        }}
      >
        {bottom}
      </div>
    </div>
  );
}
