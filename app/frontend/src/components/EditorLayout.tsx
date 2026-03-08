import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { theme } from "../theme";

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
        background: theme.border,
      }}
    >
      <div
        style={{
          gridColumn: "1 / -1",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: theme.bgPanel,
          height: 34,
          padding: "0 8px",
          borderBottom: `1px solid ${theme.border}`,
        }}
      >
        <Link
          to="/"
          style={{
            color: theme.textMuted,
            textDecoration: "none",
            fontSize: "13px",
          }}
        >
          ← Home
        </Link>
        {toolbar}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: theme.bg,
          overflow: "hidden",
        }}
      >
        {preview}
      </div>
      <div
        style={{
          background: theme.bgPanel,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {mainPanel}
      </div>
      <div
        style={{
          background: theme.bgPanel,
          overflow: "hidden",
          gridColumn: "1 / -1",
        }}
      >
        {bottom}
      </div>
    </div>
  );
}
