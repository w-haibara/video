import type { Meta, StoryObj } from "@storybook/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { createStoryQueryClient } from "../stories/fixtures";
import { HomePage } from "./HomePage";

const meta: Meta<typeof HomePage> = {
  title: "Pages/HomePage",
  component: HomePage,
  decorators: [
    (Story) => (
      <QueryClientProvider client={createStoryQueryClient()}>
        <MemoryRouter>
          <Story />
        </MemoryRouter>
      </QueryClientProvider>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof HomePage>;

export const Default: Story = {};
