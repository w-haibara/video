import type { Preview } from "@storybook/react";
import "../src/index.css";
import { theme } from "../src/theme";

const preview: Preview = {
  decorators: [
    (Story) => {
      document.body.style.background = theme.bg;
      return Story();
    },
  ],
};

export default preview;
