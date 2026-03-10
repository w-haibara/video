# CLAUDE.md

## Development Commands

Proactively use `bun run` scripts defined in the root `package.json` when performing development tasks. This includes starting, restarting, and managing the dev server.

| Command | Purpose |
|---------|---------|
| `bun run dev` | Start the development server (backend + frontend) |
| `bun run restart` | Restart the development server (kills both on failure) |
| `bun run test` | Run all tests |

Additional scripts are defined in `app/frontend/package.json` and must be run from that directory:

| Command | Purpose |
|---------|---------|
| `bun run storybook` | Start Storybook dev server on port 6006 |
| `bun run build-storybook` | Build static Storybook |
| `bun run test:browser` | Run Vitest browser tests |
