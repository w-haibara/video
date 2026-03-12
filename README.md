# video

Browser-based video editor built with React, Hono, and Bun.

## Getting Started

Development uses [Dev Containers](https://containers.dev/). No local setup is required.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [devcontainer CLI](https://github.com/devcontainers/cli)

### Launch

```sh
devcontainer up --workspace-folder .
devcontainer exec --workspace-folder . bash
```

On startup, firewall rules are automatically applied to restrict outbound traffic to an allowlist (GitHub, npm, Anthropic API, etc.).

### Install Dependencies

Inside the container:
```sh
bun install
```

## Development

| Command | Purpose |
|---------|---------|
| `bun run dev` | Start the dev server (backend + frontend) |
| `bun run restart` | Restart the dev server |
| `bun run test` | Run all tests |

| Port | Service |
|------|---------|
| 5173 | Frontend (Vite) |
| 3000 | Backend (Hono) |
| 6006 | Storybook |

Run from `app/frontend/`:

| Command | Purpose |
|---------|---------|
| `bun run storybook` | Start Storybook dev server |
| `bun run build-storybook` | Build static Storybook |
| `bun run test:browser` | Run browser tests (Vitest + Playwright) |

### Storybook

Interactive component catalog and test runner. Component tests are written as `.test()` calls in `*.stories.tsx` files and run in a real browser via Playwright.

## Production Build

Production builds run outside the devcontainer.

```sh
cd app/frontend && bun run build
```

## Project Structure

```
.devcontainer/       # Dev Container configuration
app/
  shared/            # Shared type definitions (Project, Asset, Job, Clip, etc.)
  backend/           # Hono API server
  frontend/          # React + Vite SPA
    .storybook/      # Storybook configuration
    src/
      components/    # UI components (+ *.stories.tsx)
      pages/         # Page components (+ *.stories.tsx)
      stories/       # Theme catalog
```
