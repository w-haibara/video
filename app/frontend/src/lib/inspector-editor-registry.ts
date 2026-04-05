import type { Clip, Asset, ClipTransition } from "@video/shared";

export type InspectorEditorContext = {
  clip: Clip;
  asset: Asset | undefined;
  clipKind: string;
  projectId: string;
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
    // Idempotent by id: if a plugin with the same id is already registered,
    // replace it (latest wins). This matches Map.set semantics used by other
    // registries and prevents duplicate entries when `loadPlugins` runs more
    // than once (e.g. module side effect + explicit call in a test setup).
    const existing = this.plugins.findIndex((p) => p.id === plugin.id);
    if (existing >= 0) {
      this.plugins[existing] = plugin;
      return;
    }
    this.plugins.push(plugin);
  }

  getEditorsFor(ctx: InspectorEditorContext): InspectorEditorPlugin[] {
    return this.plugins
      .filter((p) => p.canHandle(ctx))
      .sort((a, b) => a.order - b.order);
  }
}

export const inspectorEditorRegistry = new InspectorEditorRegistry();
