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

Storybook provides an interactive component catalog and test runner for all UI components. Opens at http://localhost:6006. Test results are visible in the Interactions panel for each story.

Component tests are written as `.test()` calls in `*.stories.tsx` files and run in a real browser via Playwright.

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
