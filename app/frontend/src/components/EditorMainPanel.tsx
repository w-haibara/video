import { useState, useEffect, useRef, type ReactNode } from "react";
import { theme } from "../theme";

type TabId = "inspector" | "assets" | "export" | "settings";

type Props = {
  inspectorContent: ReactNode;
  assetsContent: ReactNode;
  exportContent: ReactNode;
  settingsContent: ReactNode;
  selectedClipId: string | null;
};

const tabs: { id: TabId; label: string }[] = [
  { id: "inspector", label: "Inspector" },
  { id: "assets", label: "Assets" },
  { id: "export", label: "Export" },
  { id: "settings", label: "Settings" },
];

export function EditorMainPanel({
  inspectorContent,
  assetsContent,
  exportContent,
  settingsContent,
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
    settings: settingsContent,
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          height: 36,
          borderBottom: `1px solid ${theme.border}`,
          background: theme.bgPanel,
          flexShrink: 0,
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "8px 16px",
                background: isActive ? theme.tabActive : "transparent",
                color: isActive ? theme.tabText : theme.tabTextInactive,
                border: "none",
                borderBottom: isActive ? `2px solid ${theme.tabIndicator}` : "2px solid transparent",
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              {tab.label}
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
