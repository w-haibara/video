import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { ContextMenu } from "./ContextMenu";

const meta: Meta<typeof ContextMenu> = {
  title: "Components/ContextMenu",
  component: ContextMenu,
  args: {
    onClose: fn(),
  },
};
export default meta;
type Story = StoryObj<typeof ContextMenu>;

export const Default: Story = {
  args: {
    items: [
      { label: "Cut", onClick: fn() },
      { label: "Copy", onClick: fn() },
      { label: "Paste", onClick: fn() },
      { label: "Delete", onClick: fn() },
    ],
    position: { x: 100, y: 100 },
  },
};

export const WithDisabledItem: Story = {
  args: {
    items: [
      { label: "Cut", onClick: fn() },
      { label: "Copy", onClick: fn() },
      { label: "Paste", onClick: fn(), disabled: true },
      { label: "Delete", onClick: fn(), disabled: true },
    ],
    position: { x: 100, y: 100 },
  },
};
