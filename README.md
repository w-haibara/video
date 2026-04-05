# video

Browser-based video editor built with React, Hono, and Bun.

## Prerequisites

- [Bun](https://bun.sh/) v1.x

## Setup

```sh
bun install
```

## Development Commands

Scripts defined in the root `package.json`:

| Command | Purpose |
|---------|---------|
| `bun run dev` | Start the development server (backend + frontend) |
| `bun run restart` | Restart the development server (kills both on failure) |
| `bun run test` | Run all tests |

- Frontend: http://localhost:5173
- Backend: http://localhost:3000

Additional scripts defined in `app/frontend/package.json` (must be run from `app/frontend/`):

| Command | Purpose |
|---------|---------|
| `bun run storybook` | Start Storybook dev server on port 6006 |
| `bun run build-storybook` | Build static Storybook |
| `bun run test:browser` | Run Vitest browser tests |

### Production Build

```sh
cd app/frontend && bun run build
```

### Storybook

Storybook is used as both an interactive component catalog and an in-browser test runner for all UI components. Interaction tests are written as `.test()` calls on stories and run in a real Chromium via `@storybook/addon-vitest` + Playwright — results show up in the Interactions panel of each story.

Start it from `app/frontend/`:

```sh
cd app/frontend && bun run storybook
```

Opens at http://localhost:6006.

#### Story structure

Story files live next to the component they document as `*.stories.tsx`. They use the Storybook 10.x `meta.story(...)` pattern:

```tsx
import preview from "../../.storybook/preview";
import { MyComponent } from "./MyComponent";

const meta = preview.meta({
  title: "Components/MyComponent",
  component: MyComponent,
});

export const Default = meta.story({});

Default.test("renders label", async ({ canvas }) => {
  await canvas.findByText("hello");
});
```

#### Mocking API calls (MSW)

All network mocking goes through [MSW](https://mswjs.io/) via `msw-storybook-addon`. Default handlers live in `app/frontend/src/mocks/handlers.ts` and return empty lists / echo-id responses — enough that any data-fetching story renders its loaded state instead of an error from React Query.

To override for a specific story, set `parameters.msw.handlers`:

```tsx
import { http, HttpResponse } from "msw";
import { mockProject } from "../stories/fixtures";

export const WithProjects = meta.story({
  parameters: {
    msw: {
      handlers: [
        http.get("/api/projects", () =>
          HttpResponse.json({ projects: [mockProject()] }),
        ),
      ],
    },
  },
});
```

The same MSW handlers are automatically picked up by addon-vitest browser tests — no extra setup needed.

#### Bulk verification

`tools/storybook-verify/verify-all.ts` is a Playwright-based script that walks every story in a running Storybook, captures page errors / console errors / error-overlay text, and writes full-page screenshots plus a `report.json` under `tools/storybook-verify/` (screenshots and report are gitignored). Run it after any change that could touch many stories at once.

See [CLAUDE.md](./CLAUDE.md#storybook) for the detailed workflow, fixtures, and devcontainer-wrapped command invocations.

## Project Structure

```
app/
  shared/    # Shared types (Project, Asset, Job, Clip, etc.)
  backend/   # Hono API server
  frontend/  # React + Vite SPA
    .storybook/   # Storybook configuration
    src/
      components/  # UI components (+ *.stories.tsx)
      pages/       # Page components (+ *.stories.tsx)
      stories/     # Theme catalog story
```

## Devcontainer

A devcontainer is provided for running [Claude Code](https://claude.com/claude-code) in `--dangerously-skip-permissions` mode with a restrictive firewall.

To enable `git push` from inside the container, set the `GITHUB_TOKEN` environment variable on the host before starting:

```sh
export GITHUB_TOKEN="$(gh auth token)"

# Build & start
devcontainer up --workspace-folder .

# Run commands inside the container
devcontainer exec --workspace-folder . claude --dangerously-skip-permissions

# Stop
docker stop $(docker ps -q --filter label=devcontainer.local_folder=$(pwd))
```

Browser tests inside the container require `xvfb-run`:

```sh
cd app/frontend && xvfb-run bun run test:browser
```
