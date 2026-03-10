import { beforeAll } from "vitest";
import { setProjectAnnotations } from "@storybook/react-vite";
import * as previewAnnotations from "./preview";
import { loadPlugins } from "../src/lib/plugin-loader";
import { builtinPlugin } from "../src/lib/builtin-plugin";

loadPlugins([builtinPlugin]);

const annotations = setProjectAnnotations([previewAnnotations]);

beforeAll(annotations.beforeAll);
