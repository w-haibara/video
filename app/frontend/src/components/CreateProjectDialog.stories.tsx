import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { QueryClientProvider } from "@tanstack/react-query";
import { createStoryQueryClient } from "../stories/fixtures";
import { CreateProjectDialog } from "./CreateProjectDialog";

const meta: Meta<typeof CreateProjectDialog> = {
  title: "Components/CreateProjectDialog",
  component: CreateProjectDialog,
  decorators: [
    (Story) => (
      <QueryClientProvider client={createStoryQueryClient()}>
        <Story />
      </QueryClientProvider>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof CreateProjectDialog>;

export const Default: Story = {
  args: {
    onClose: fn(),
  },
};
