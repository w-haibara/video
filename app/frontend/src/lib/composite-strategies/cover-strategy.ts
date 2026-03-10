import type { PreviewCompositeStrategy } from "../composite-strategy-registry";

export const coverPreviewStrategy: PreviewCompositeStrategy = {
  id: "cover",
  label: "Cover (覆い隠す)",
  containerStyle() {
    return { position: "relative" };
  },
};
