import { useEffect, useRef, useState, type ReactNode } from "react";
import { expect } from "storybook/test";
import preview from "../../.storybook/preview";
import { PreviewPopout } from "./PreviewPopout";

function IframePopoutHost({ children }: { children: ReactNode }) {
  const [win, setWin] = useState<Window | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  useEffect(() => {
    const cw = iframeRef.current?.contentWindow;
    if (cw) setWin(cw);
  }, []);
  return (
    <div>
      <iframe
        ref={iframeRef}
        title="popout"
        style={{ width: 640, height: 360, border: "1px solid #666" }}
      />
      {win && <PreviewPopout popoutWindow={win}>{children}</PreviewPopout>}
    </div>
  );
}

const meta = preview.meta({
  title: "Components/PreviewPopout",
  component: IframePopoutHost,
});

export const Default = meta.story({
  args: {
    children: (
      <div
        style={{
          padding: 20,
          color: "#fff",
          background: "#222",
          width: "100%",
          height: "100%",
        }}
      >
        Popout content
      </div>
    ),
  },
});

export const WithHeading = meta.story({
  args: {
    children: (
      <div
        style={{
          padding: 20,
          color: "#fff",
          background: "#222",
          width: "100%",
          height: "100%",
        }}
      >
        <h2>Popout Heading</h2>
        <p>Additional popout body text.</p>
      </div>
    ),
  },
});

Default.test("content renders in popout", async ({ canvas }) => {
  const iframe = (await canvas.findByTitle("popout")) as HTMLIFrameElement;
  await new Promise((r) => setTimeout(r, 150));
  const innerDoc = iframe.contentDocument!;
  expect(innerDoc.body.textContent).toContain("Popout content");
});

WithHeading.test("heading renders in popout", async ({ canvas }) => {
  const iframe = (await canvas.findByTitle("popout")) as HTMLIFrameElement;
  await new Promise((r) => setTimeout(r, 150));
  const innerDoc = iframe.contentDocument!;
  expect(innerDoc.body.textContent).toContain("Popout Heading");
});
