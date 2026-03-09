import addonDocs from "@storybook/addon-docs";
import { definePreview } from "@storybook/react-vite";
import { sb } from "storybook/test";

import "../src/index.css";
import { theme } from "../src/theme";

// Mock API layer to prevent real HTTP requests in stories
sb.mock(import("../src/api/client.ts"));

export default definePreview({
  addons: [addonDocs()],
  decorators: [
    (Story) => {
      document.body.style.background = theme.bg;
      document.body.style.overflow = "auto";
      return Story();
    },
  ],
  tags: ["test", "autodocs"],
});
