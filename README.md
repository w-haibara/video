# video

Browser-based video editor built with React, Hono, and Bun.

## Prerequisites

- [Bun](https://bun.sh/) v1.x

## Setup

```sh
bun install
```

## Usage

### Development

Start the backend (Hono) and frontend (Vite) servers concurrently:

```sh
bun run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3000

### Production Build

```sh
cd app/frontend && bun run build
```

## Testing

Run backend unit tests:

```sh
bun test
```

Run frontend component tests (Vitest + Storybook + Playwright):

```sh
cd app/frontend && npx vitest --project storybook
```

Component tests are written as `.test()` calls in `*.stories.tsx` files and run in a real browser via Playwright.

## Storybook

Storybook provides an interactive component catalog and test runner for all UI components.

### Start Storybook

```sh
cd app/frontend && bun run storybook
```

Opens at http://localhost:6006. Test results are visible in the Interactions panel for each story.

### Build Storybook (static export)

```sh
cd app/frontend && bun run build-storybook
```

Output is written to `app/frontend/storybook-static/`.

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
