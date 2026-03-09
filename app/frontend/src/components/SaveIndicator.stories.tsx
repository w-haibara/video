import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { SaveIndicator } from "./SaveIndicator";

const meta: Meta<typeof SaveIndicator> = {
  title: "Components/SaveIndicator",
  component: SaveIndicator,
  args: {
    onUndo: fn(),
    onRedo: fn(),
  },
};
export default meta;
type Story = StoryObj<typeof SaveIndicator>;

export const Idle: Story = {
  args: {
    status: "idle",
    canUndo: false,
    canRedo: false,
  },
};

export const Saving: Story = {
  args: {
    status: "saving",
    canUndo: false,
    canRedo: false,
  },
};

export const Saved: Story = {
  args: {
    status: "saved",
    canUndo: false,
    canRedo: false,
  },
};

export const Error: Story = {
  args: {
    status: "error",
    canUndo: false,
    canRedo: false,
  },
};

export const WithUndoRedo: Story = {
  args: {
    status: "saved",
    canUndo: true,
    canRedo: true,
  },
};
