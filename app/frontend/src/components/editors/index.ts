import { inspectorEditorRegistry } from "../../lib/inspector-editor-registry";
import { TrimEditor } from "./TrimEditor";
import { TextEditor } from "./TextEditor";
import { TransformEditor } from "./TransformEditor";
import { AudioVolumeEditor } from "./AudioVolumeEditor";

inspectorEditorRegistry.register({
  id: "trim",
  label: "Trim",
  order: 0,
  canHandle: () => true,
  Component: TrimEditor,
});

inspectorEditorRegistry.register({
  id: "text",
  label: "Text",
  order: 10,
  canHandle: (ctx) => ctx.clipKind === "title",
  Component: TextEditor,
});

inspectorEditorRegistry.register({
  id: "transform",
  label: "Transform",
  order: 20,
  canHandle: (ctx) => ctx.clipKind === "video",
  Component: TransformEditor,
});

inspectorEditorRegistry.register({
  id: "audio-volume",
  label: "Volume",
  order: 30,
  canHandle: (ctx) => ctx.clipKind === "audio",
  Component: AudioVolumeEditor,
});
