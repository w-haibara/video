import type { Meta, StoryObj } from "@storybook/react";
import { theme, spacing, fontSize, radius, buttonStyle, inputStyle, sectionHeadingStyle } from "../theme";

const ThemeDisplay = () => {
  // Helper for color swatches
  const Swatch = ({ name, color }: { name: string; color: string }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
      <div style={{ width: 32, height: 32, background: color, border: `1px solid ${theme.border}`, borderRadius: radius.sm }} />
      <span style={{ fontSize: fontSize.md, color: theme.text }}>{name}</span>
      <span style={{ fontSize: fontSize.xs, color: theme.textMuted }}>{color}</span>
    </div>
  );

  return (
    <div style={{ padding: 24, background: theme.bg, fontFamily: "-apple-system, sans-serif" }}>
      {/* Colors section */}
      <h2 style={{ ...sectionHeadingStyle, marginBottom: 16 }}>Colors</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, marginBottom: 32 }}>
        <div>
          <h3 style={{ fontSize: fontSize.lg, marginBottom: 8 }}>Base</h3>
          <Swatch name="bg" color={theme.bg} />
          <Swatch name="bgPanel" color={theme.bgPanel} />
          <Swatch name="bgHover" color={theme.bgHover} />
          <Swatch name="bgDark" color={theme.bgDark} />
        </div>
        <div>
          <h3 style={{ fontSize: fontSize.lg, marginBottom: 8 }}>Text</h3>
          <Swatch name="text" color={theme.text} />
          <Swatch name="textMuted" color={theme.textMuted} />
          <Swatch name="textDisabled" color={theme.textDisabled} />
        </div>
        <div>
          <h3 style={{ fontSize: fontSize.lg, marginBottom: 8 }}>Semantic</h3>
          <Swatch name="primary" color={theme.primary} />
          <Swatch name="accent" color={theme.accent} />
          <Swatch name="error" color={theme.error} />
          <Swatch name="warning" color={theme.warning} />
          <Swatch name="success" color={theme.success} />
          <Swatch name="info" color={theme.info} />
        </div>
        <div>
          <h3 style={{ fontSize: fontSize.lg, marginBottom: 8 }}>Clip Types</h3>
          <Swatch name="clipVideo" color={theme.clipVideo} />
          <Swatch name="clipVideoSelect" color={theme.clipVideoSelect} />
          <Swatch name="clipAudio" color={theme.clipAudio} />
          <Swatch name="clipAudioSelect" color={theme.clipAudioSelect} />
          <Swatch name="clipText" color={theme.clipText} />
          <Swatch name="clipTextSelect" color={theme.clipTextSelect} />
        </div>
        <div>
          <h3 style={{ fontSize: fontSize.lg, marginBottom: 8 }}>Tab</h3>
          <Swatch name="tabActive" color={theme.tabActive} />
          <Swatch name="tabInactive" color={theme.tabInactive} />
          <Swatch name="tabIndicator" color={theme.tabIndicator} />
          <Swatch name="tabText" color={theme.tabText} />
          <Swatch name="tabTextInactive" color={theme.tabTextInactive} />
        </div>
        <div>
          <h3 style={{ fontSize: fontSize.lg, marginBottom: 8 }}>Button &amp; Timeline</h3>
          <Swatch name="button" color={theme.button} />
          <Swatch name="buttonHover" color={theme.buttonHover} />
          <Swatch name="buttonDanger" color={theme.buttonDanger} />
          <Swatch name="playhead" color={theme.playhead} />
          <Swatch name="seekBar" color={theme.seekBar} />
        </div>
      </div>

      {/* Typography section */}
      <h2 style={{ ...sectionHeadingStyle, marginBottom: 16 }}>Typography</h2>
      <div style={{ marginBottom: 32 }}>
        {Object.entries(fontSize).map(([name, size]) => (
          <div key={name} style={{ fontSize: size, color: theme.text, marginBottom: 4 }}>
            {name} — {size} — The quick brown fox
          </div>
        ))}
      </div>

      {/* Spacing section */}
      <h2 style={{ ...sectionHeadingStyle, marginBottom: 16 }}>Spacing</h2>
      <div style={{ display: "flex", gap: 16, alignItems: "end", marginBottom: 32 }}>
        {Object.entries(spacing).map(([name, px]) => (
          <div key={name} style={{ textAlign: "center" }}>
            <div style={{ width: px, height: px, background: theme.primary, borderRadius: radius.xs }} />
            <div style={{ fontSize: fontSize.xs, color: theme.textMuted, marginTop: 4 }}>{name} ({px}px)</div>
          </div>
        ))}
      </div>

      {/* Border Radius section */}
      <h2 style={{ ...sectionHeadingStyle, marginBottom: 16 }}>Border Radius</h2>
      <div style={{ display: "flex", gap: 16, marginBottom: 32 }}>
        {Object.entries(radius).map(([name, r]) => (
          <div key={name} style={{ textAlign: "center" }}>
            <div style={{ width: 48, height: 48, background: theme.bgPanel, border: `1px solid ${theme.border}`, borderRadius: r }} />
            <div style={{ fontSize: fontSize.xs, color: theme.textMuted, marginTop: 4 }}>{name} ({r})</div>
          </div>
        ))}
      </div>

      {/* Buttons section */}
      <h2 style={{ ...sectionHeadingStyle, marginBottom: 16 }}>Buttons</h2>
      <div style={{ display: "flex", gap: 12, marginBottom: 32 }}>
        <button style={buttonStyle.primary}>Primary</button>
        <button style={buttonStyle.secondary}>Secondary</button>
        <button style={buttonStyle.danger}>Danger</button>
        <button style={{ ...buttonStyle.primary, ...buttonStyle.small }}>Small</button>
      </div>

      {/* Inputs section */}
      <h2 style={{ ...sectionHeadingStyle, marginBottom: 16 }}>Inputs</h2>
      <div style={{ maxWidth: 300, marginBottom: 32 }}>
        <input style={inputStyle} placeholder="Normal input" />
        <div style={{ height: 8 }} />
        <input style={{ ...inputStyle, opacity: 0.5 }} placeholder="Disabled input" disabled />
      </div>

      {/* Shadows & Overlays section */}
      <h2 style={{ ...sectionHeadingStyle, marginBottom: 16 }}>Shadows &amp; Overlays</h2>
      <div style={{ display: "flex", gap: 16 }}>
        <div style={{ width: 100, height: 60, background: theme.bg, boxShadow: `0 2px 8px ${theme.shadow}`, borderRadius: radius.md, display: "flex", alignItems: "center", justifyContent: "center", fontSize: fontSize.xs }}>shadow</div>
        <div style={{ width: 100, height: 60, background: theme.overlay, borderRadius: radius.md, display: "flex", alignItems: "center", justifyContent: "center", fontSize: fontSize.xs, color: theme.white }}>overlay</div>
        <div style={{ width: 100, height: 60, background: theme.overlayLight, border: `1px solid ${theme.border}`, borderRadius: radius.md, display: "flex", alignItems: "center", justifyContent: "center", fontSize: fontSize.xs }}>overlayLight</div>
        <div style={{ width: 100, height: 60, background: theme.overlayDark, borderRadius: radius.md, display: "flex", alignItems: "center", justifyContent: "center", fontSize: fontSize.xs, color: theme.white }}>overlayDark</div>
      </div>
    </div>
  );
};

const meta: Meta<typeof ThemeDisplay> = {
  title: "Theme",
  component: ThemeDisplay,
};
export default meta;
type Story = StoryObj<typeof ThemeDisplay>;
export const Overview: Story = {};
