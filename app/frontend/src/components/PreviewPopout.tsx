import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

type Props = {
  popoutWindow: Window;
  children: ReactNode;
};

export function PreviewPopout({ popoutWindow, children }: Props) {
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const doc = popoutWindow.document;
    doc.body.innerHTML = "";
    doc.body.style.margin = "0";
    doc.body.style.overflow = "hidden";
    doc.body.style.background = "#000";

    // Copy stylesheets from parent
    for (const sheet of Array.from(document.styleSheets)) {
      try {
        if (sheet.href) {
          const link = doc.createElement("link");
          link.rel = "stylesheet";
          link.href = sheet.href;
          doc.head.appendChild(link);
        } else if (sheet.cssRules) {
          const style = doc.createElement("style");
          for (const rule of Array.from(sheet.cssRules)) {
            style.appendChild(doc.createTextNode(rule.cssText));
          }
          doc.head.appendChild(style);
        }
      } catch {
        // Cross-origin stylesheet, skip
      }
    }

    const root = doc.createElement("div");
    root.id = "popout-root";
    root.style.width = "100vw";
    root.style.height = "100vh";
    doc.body.appendChild(root);
    setContainer(root);

    return () => {
      setContainer(null);
    };
  }, [popoutWindow]);

  if (!container) return null;
  return createPortal(children, container);
}
