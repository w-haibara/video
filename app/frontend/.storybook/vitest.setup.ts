import { beforeAll } from "vitest";
import { setProjectAnnotations } from "@storybook/react-vite";
// Importing ./preview has a module side effect of calling `loadPlugins([builtinPlugin])`,
// so do NOT also call `loadPlugins` here — that would register every plugin twice.
// See issue #140.
import * as previewAnnotations from "./preview";

const annotations = setProjectAnnotations([previewAnnotations]);

beforeAll(annotations.beforeAll);
