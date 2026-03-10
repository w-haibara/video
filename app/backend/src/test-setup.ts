import { loadPlugins } from "./lib/plugin-loader";
import { builtinPlugin } from "./lib/builtin-plugin";

loadPlugins([builtinPlugin]);
