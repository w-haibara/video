import { useState, useEffect, useRef, type ReactNode } from "react";

type TabId = "inspector" | "assets" | "export";

type Props = {
  inspectorContent: ReactNode;
  assetsContent: ReactNode;
  exportContent: ReactNode;
  selectedClipId: string | null;
};

const tabs: { id: TabId; label: string }[] = [
  { id: "inspector", label: "Inspector" },
  { id: "assets", label: "Assets" },
  { id: "export", label: "Export" },
];

export function EditorMainPanel({
  inspectorContent,
  assetsContent,
  exportContent,
  selectedClipId,
}: Props) {
  const [activeTab, setActiveTab] = useState<TabId>("inspector");
  const mountedRef = useRef(false);
  const prevClipIdRef = useRef<string | null>(selectedClipId);

  // Auto-switch to inspector when a clip is newly selected (task 41)
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    if (prevClipIdRef.current === null && selectedClipId !== null) {
      setActiveTab("inspector");
    }
    prevClipIdRef.current = selectedClipId;
  }, [selectedClipId]);

  const contentMap: Record<TabId, ReactNode> = {
    inspector: inspectorContent,
    assets: assetsContent,
    export: exportContent,
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          height: 36,
          borderBottom: "1px solid #333",
          background: "#1a1a1a",
          flexShrink: 0,
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const isInspector = tab.id === "inspector";
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "8px 16px",
                background: isActive ? "#2a2a2a" : "transparent",
                color: isActive ? "#eee" : "#888",
                border: "none",
                borderBottom: isActive ? "2px solid #5b8def" : "2px solid transparent",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: isInspector ? 600 : 400,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {tab.label}
              {isInspector && selectedClipId && (
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#5b8def",
                    display: "inline-block",
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
      <div style={{ flex: 1, overflow: "auto", position: "relative" }}>
        {tabs.map((tab) => (
          <div
            key={tab.id}
            style={{
              display: activeTab === tab.id ? "block" : "none",
              height: "100%",
              overflow: "auto",
              padding: 8,
            }}
          >
            {contentMap[tab.id]}
          </div>
        ))}
      </div>
    </>
  );
}
