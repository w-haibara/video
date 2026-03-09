import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  framework: getAbsolutePath("@storybook/react-vite"),
  stories: ["../src/**/*.stories.@(ts|tsx)", "../src/**/*.mdx"],
  addons: [
    getAbsolutePath("@storybook/addon-vitest"),
    getAbsolutePath("@storybook/addon-docs"),
  ],
  features: {
    experimentalTestSyntax: true,
  },
  tags: {
    "design-system": { title: "Design System" },
    "page": { title: "Page" },
    "wip": { title: "WIP", excludeFromSidebar: true },
  },
};

export default config;

function getAbsolutePath(value: string): any {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}
