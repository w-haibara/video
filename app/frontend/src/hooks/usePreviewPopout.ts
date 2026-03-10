import { useRef, useState, useEffect, useCallback } from "react";

export function usePreviewPopout() {
  const popoutRef = useRef<Window | null>(null);
  const [isPopout, setIsPopout] = useState(false);

  const openPopout = useCallback(() => {
    if (popoutRef.current && !popoutRef.current.closed) {
      popoutRef.current.focus();
      return;
    }
    const w = window.open("", "", "width=960,height=580");
    if (!w) return;
    popoutRef.current = w;
    w.document.title = "Preview";
    setIsPopout(true);

    w.addEventListener("beforeunload", () => {
      popoutRef.current = null;
      setIsPopout(false);
    });
  }, []);

  const closePopout = useCallback(() => {
    if (popoutRef.current && !popoutRef.current.closed) {
      popoutRef.current.close();
    }
    popoutRef.current = null;
    setIsPopout(false);
  }, []);

  // Close popout when parent unloads / navigates away
  useEffect(() => {
    const cleanup = () => {
      if (popoutRef.current && !popoutRef.current.closed) {
        popoutRef.current.close();
      }
    };
    window.addEventListener("beforeunload", cleanup);
    return () => {
      window.removeEventListener("beforeunload", cleanup);
      cleanup();
    };
  }, []);

  return { popoutWindow: popoutRef.current, isPopout, openPopout, closePopout };
}
