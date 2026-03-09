import { expect, fn } from "storybook/test";
import { QueryClientProvider } from "@tanstack/react-query";
import preview from "../../.storybook/preview";
import { createStoryQueryClient } from "../stories/fixtures";
import { CreateProjectDialog } from "./CreateProjectDialog";

const meta = preview.meta({
  title: "Components/CreateProjectDialog",
  component: CreateProjectDialog,
  decorators: [
    (Story) => (
      <QueryClientProvider client={createStoryQueryClient()}>
        <Story />
      </QueryClientProvider>
    ),
  ],
  args: {
    onClose: fn(),
  },
});

export const Default = meta.story({});

Default.test("calls onClose when cancel is clicked", async ({ canvas, userEvent, args }) => {
  const cancelButton = await canvas.findByRole("button", { name: /cancel/i });
  await userEvent.click(cancelButton);
  await expect(args.onClose).toHaveBeenCalled();
});

Default.test("renders dialog heading", async ({ canvas }) => {
  await canvas.findByRole("heading", { name: "New Project" });
});

Default.test("renders project name input", async ({ canvas }) => {
  await canvas.findByPlaceholderText("Project name");
});

Default.test("renders cancel and create buttons", async ({ canvas }) => {
  await canvas.findByRole("button", { name: "Cancel" });
  await canvas.findByRole("button", { name: "Create" });
});
