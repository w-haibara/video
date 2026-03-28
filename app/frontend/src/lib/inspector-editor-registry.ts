import type { Clip, Asset, ClipTransition } from "@video/shared";

export type InspectorEditorContext = {
  clip: Clip;
  asset: Asset | undefined;
  clipKind: string;
  onUpdate: (updates: Partial<Clip>) => void;
  onSetTransition?: (transition: ClipTransition | undefined) => void;
};

export type InspectorEditorPlugin = {
  id: string;
  label: string;
  order: number;
  canHandle: (ctx: InspectorEditorContext) => boolean;
  Component: React.ComponentType<InspectorEditorContext>;
};

export class InspectorEditorRegistry {
  private plugins: InspectorEditorPlugin[] = [];

  register(plugin: InspectorEditorPlugin): void {
    this.plugins.push(plugin);
  }

  getEditorsFor(ctx: InspectorEditorContext): InspectorEditorPlugin[] {
    return this.plugins
      .filter((p) => p.canHandle(ctx))
      .sort((a, b) => a.order - b.order);
  }
}

export const inspectorEditorRegistry = new InspectorEditorRegistry();
