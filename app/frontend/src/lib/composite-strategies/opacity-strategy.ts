import type { PreviewCompositeStrategy } from "../composite-strategy-registry";

export const opacityPreviewStrategy: PreviewCompositeStrategy = {
  id: "opacity",
  label: "Opacity (半透明)",
  containerStyle() {
    return { opacity: 0.5 };
  },
};
