import addonDocs from "@storybook/addon-docs";
import { definePreview } from "@storybook/react-vite";
import { initialize, mswLoader } from "msw-storybook-addon";

import "../src/index.css";
import { builtinPlugin } from "../src/lib/builtin-plugin";
import { loadPlugins } from "../src/lib/plugin-loader";
import { handlers } from "../src/mocks/handlers";
import { theme } from "../src/theme";

loadPlugins([builtinPlugin]);

// Start MSW in Storybook to intercept fetch calls from data-fetching hooks.
// `onUnhandledRequest: "bypass"` lets Storybook's own asset requests pass through.
initialize({ onUnhandledRequest: "bypass" }, handlers);

export default definePreview({
  addons: [addonDocs()],
  loaders: [mswLoader],
  decorators: [
    (Story) => {
      document.body.style.background = theme.bg;
      document.body.style.overflow = "auto";
      return Story();
    },
  ],
  tags: ["test", "autodocs"],
});
