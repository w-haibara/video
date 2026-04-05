import { expect, fn } from "storybook/test";
import { http, HttpResponse } from "msw";
import { QueryClientProvider } from "@tanstack/react-query";
import preview from "../../../.storybook/preview";
import { createStoryQueryClient, mockAsset, mockClip } from "../../stories/fixtures";
import { P5jsEditor } from "./P5jsEditor";

const meta = preview.meta({
  title: "Components/editors/P5jsEditor",
  component: P5jsEditor,
  decorators: [
    (Story) => (
      <QueryClientProvider client={createStoryQueryClient()}>
        <div style={{ width: 320 }}>
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
  args: {
    projectId: "proj-1",
    clipKind: "p5js",
    onUpdate: fn(),
    onSetTransition: fn(),
    clip: mockClip(),
  },
});

export const Loaded = meta.story({
  args: {
    asset: mockAsset({ id: "p5-1", kind: "p5js" }),
  },
  parameters: {
    msw: {
      handlers: [
        http.get("/api/projects/proj-1/assets/p5-1/content", () =>
          HttpResponse.json({
            content:
              "function setup(){createCanvas(400,400);} function draw(){background(220); circle(200,200,50);}",
          }),
        ),
      ],
    },
  },
});

export const NoAsset = meta.story({
  args: {
    asset: undefined,
  },
});

export const Loading = meta.story({
  args: {
    asset: mockAsset({ id: "p5-load", kind: "p5js" }),
  },
  parameters: {
    msw: {
      handlers: [
        http.get("/api/projects/proj-1/assets/p5-load/content", async () => {
          await new Promise((r) => setTimeout(r, 60000));
          return HttpResponse.json({ content: "" });
        }),
      ],
    },
  },
});

Loaded.test("renders sketch label", async ({ canvas }) => {
  await canvas.findByText(/p5\.js Sketch/);
});

Loaded.test("renders code editor textarea", async ({ canvas }) => {
  await canvas.findByTestId("p5js-code-editor");
});

Loaded.test("shows loaded content", async ({ canvas }) => {
  const ta = (await canvas.findByTestId(
    "p5js-code-editor",
  )) as HTMLTextAreaElement;
  await new Promise((r) => setTimeout(r, 100));
  expect(ta.value).toContain("createCanvas");
});

Loaded.test("save button is disabled initially", async ({ canvas }) => {
  const btn = (await canvas.findByTestId(
    "p5js-save-render",
  )) as HTMLButtonElement;
  expect(btn.disabled).toBe(true);
});

NoAsset.test("shows empty hint", async ({ canvas }) => {
  await canvas.findByText(/Assign a p5\.js asset/);
});

Loading.test("shows loading text", async ({ canvas }) => {
  await canvas.findByText(/Loading sketch/);
});
