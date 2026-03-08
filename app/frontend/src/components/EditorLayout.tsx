import type { ReactNode } from "react";

type Props = {
  toolbar: ReactNode;
  preview: ReactNode;
  mainPanel: ReactNode;
  bottom: ReactNode;
};

export function EditorLayout({ toolbar, preview, mainPanel, bottom }: Props) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 2fr",
        gridTemplateRows: "auto 1fr 220px",
        height: "100vh",
        gap: "1px",
        background: "#222",
      }}
    >
      <div
        style={{
          gridColumn: "1 / -1",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          background: "#1a1a1a",
          height: 34,
          padding: "0 8px",
          borderBottom: "1px solid #333",
        }}
      >
        {toolbar}
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
        }}
      >
        {bottom}
      </div>
    </div>
  );
}
