# CLAUDE.md

## Devcontainer (required)

All development commands run inside the devcontainer via `devcontainer exec`. **Do not run bun, node, or Chromium on the host.**

### Initial setup

```bash
export GITHUB_TOKEN="$(gh auth token)"
devcontainer up --workspace-folder .
# bun install runs automatically via postCreateCommand
```

Ports 5173 (Vite), 3000 (Backend), 6006 (Storybook) are forwarded to the host. Open `http://localhost:5173` in your host browser.

## Commands

All commands below are wrapped with `devcontainer exec --workspace-folder . bash -c "cd /workspace && <command>"`. For brevity, set an alias in your shell:

```bash
alias dex='devcontainer exec --workspace-folder . bash -c "cd /workspace && $*"'
```

Then invoke as `dex "bun run dev"`.

### Core

| Command | Purpose |
|---------|---------|
| `devcontainer exec --workspace-folder . bash -c "cd /workspace && bun run dev"` | Start dev server (backend + frontend) |
| `devcontainer exec --workspace-folder . bash -c "cd /workspace && bun run restart"` | Restart dev server (kills both on failure) |
| `devcontainer exec --workspace-folder . bash -c "cd /workspace && bun run test"` | Run all tests (includes snapshot & regression) |
| `devcontainer exec --workspace-folder . bash -c "cd /workspace && bun run catalog"` | Start feature catalog on port 3001 |

### Frontend-specific (from `app/frontend/`)

| Command | Purpose |
|---------|---------|
| `devcontainer exec --workspace-folder . bash -c "cd /workspace/app/frontend && bun run storybook"` | Start Storybook on port 6006 |
| `devcontainer exec --workspace-folder . bash -c "cd /workspace/app/frontend && bun run build-storybook"` | Build static Storybook |
| `devcontainer exec --workspace-folder . bash -c "cd /workspace/app/frontend && xvfb-run bun run test:browser"` | Run Vitest browser tests (needs `xvfb-run`) |

### Other

| Command | Purpose |
|---------|---------|
| `devcontainer exec --workspace-folder . claude --dangerously-skip-permissions` | Run Claude Code inside container |
| `docker stop $(docker ps -q --filter label=devcontainer.local_folder=$(pwd))` | Stop the devcontainer |

## Testing policy

- Aggressively add test cases. Test optimization can happen later — when working on a task, add every test case you can think of without worrying about redundancy.
- Always add regression tests (both export regression and snapshot) for any change that affects video output or sequence operations. Do not skip regression cases.
- For video output tests, cover not only individual features but also combinations of features (e.g., transition + transform, blend mode + crop, multi-track + transition). These cross-feature interactions are where regressions hide.
- When snapshots are added or changed, always visually verify the additions or changes. Use `bun run catalog` with Playwright, or use `claude -p` to take and inspect screenshots.

## Regression testing workflow

After modifying `sequence-ops` or export-related code, follow this workflow:

1. `devcontainer exec --workspace-folder . bash -c "cd /workspace && bun run test"` — detect regressions
2. If snapshot diff is intentional: `devcontainer exec --workspace-folder . bash -c "cd /workspace/app/frontend && bun test sequence-ops.regression --update-snapshots"`
3. If export frames changed: `devcontainer exec --workspace-folder . bash -c "cd /workspace && UPDATE_REFERENCES=1 bun test export-regression"`
4. Start `bun run catalog` and verify visually with playwright-cli
5. Run tests again to confirm all pass, then commit (include `.snap` and `references/`)

### Adding new snapshot test cases

- Add test to `sequence-ops.regression.test.ts` using `stabilize()` + `toMatchSnapshot()`
- First run auto-generates the snapshot — verify it visually in the feature catalog
- IMPORTANT: Do NOT use `--update-snapshots` while iterating on a new case. Delete the single new entry from `.snap` and re-run instead, to avoid overwriting existing correct snapshots.

### Preview regression testing

Preview regression tests capture browser-rendered preview frames via Playwright and compare against reference screenshots. Requires the dev server running.

- Run: `devcontainer exec --workspace-folder . bash -c "cd /workspace && bun test tools/preview-test/preview-regression.test.ts"`
- Update references: `devcontainer exec --workspace-folder . bash -c "cd /workspace && UPDATE_PREVIEW_REFERENCES=1 bun test tools/preview-test/preview-regression.test.ts"`
- Preview test page: `http://localhost:5173/preview-test?project=<id>&t=<ms>`
- Two comparison modes:
  - **Preview regression** (tight threshold) — catches rendering changes in the browser
  - **Preview vs export** (generous threshold) — catches divergence between preview and export
- Preview references are stored in `tools/preview-test/references/`

### Adding new export regression test cases

- Add factory function to `app/backend/src/__fixtures__/export/make-fixture-project.ts`
- Add test case to `export-regression.test.ts`
- First run auto-generates reference frames
- Add entry to `EXPORT_TESTS` in `tools/feature-catalog/index.ts`
- Verify frames visually in feature catalog before committing

## Storybook

Storybook acts as both the component catalog and an in-browser test runner (via `@storybook/addon-vitest`). It is also the primary place to exercise UI states that are hard to reach in the full app.

### Structure & stack

- Storybook 10.2.17 on `@storybook/react-vite`
- Config at `app/frontend/.storybook/` (`main.ts`, `preview.ts`, `manager.ts`, `vitest.setup.ts`)
- Story files are colocated with components as `app/frontend/src/**/*.stories.tsx`
- Currently 20+ story files, 200+ story entries

### Plugin system inside Storybook

`.storybook/preview.ts` must call `loadPlugins([builtinPlugin])` at module top level (before `definePreview`). Without it, `previewRendererRegistry` and `inspectorEditorRegistry` are empty, so components that rely on dynamic renderer discovery — most importantly `PreviewPlayer` — render an empty state in stories.

The same `loadPlugins([builtinPlugin])` call also exists in:

- `app/frontend/src/main.tsx` (production entry)
- `app/frontend/.storybook/vitest.setup.ts` (addon-vitest test runner entry)

Registry `register` methods are idempotent and dedup by `id` with latest-wins semantics, so importing the builtin plugin from multiple entry points is safe.

### Mocking with MSW

All network mocking is done through [MSW](https://mswjs.io/) via `msw-storybook-addon`. **Do not use `sb.mock` or per-story `queryClient.setQueryData()` to fake API responses** — the latter conflicts with MSW because React Query will refetch and overwrite the seeded cache. (Providing a `QueryClientProvider` at the meta decorator level is still fine — components need a client in context.)

- Global handlers: `app/frontend/src/mocks/handlers.ts`. Defaults return empty lists / echo-id objects so any data-fetching story avoids `Query data cannot be undefined` errors.
- Per-story override: set `parameters.msw.handlers`. Canonical pattern:

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

- addon-vitest browser tests (`bun run test:browser`) automatically pick up the same MSW handlers — no extra setup required.
- Reference examples of per-story MSW overrides: `HomePage.stories.tsx`, `EditorPage.stories.tsx`, `JobLogPage.stories.tsx`, `AssetThumbnail.stories.tsx`.

### Writing a new story

1. Create `<Component>.stories.tsx` next to the component.
2. Use the Storybook 10.x `preview.meta(...).story(...)` pattern — import `preview` from `../../.storybook/preview` (adjust depth).
3. If the component fetches data, either rely on the default handlers in `src/mocks/handlers.ts` or add per-story overrides via `parameters.msw.handlers`.
4. For components that need a specific project/asset shape, pass fixtures from `app/frontend/src/stories/fixtures.ts` (`mockProject`, `mockClip`, `mockAsset`, `mockJob`, `projectWithClips`, `projectWithTextOverlay`, etc.) via `args`.
5. Add interaction tests as `StoryName.test("...", async ({ canvas }) => { ... })` blocks — they run in Playwright via addon-vitest.

### Verification tooling

`tools/storybook-verify/verify-all.ts` is a Playwright script that iterates every story via `index.json`, opens it in `iframe.html`, and collects:

- `pageerror` events
- `console.error` messages
- Storybook error-overlay text
- `#storybook-root` HTML size (to flag accidentally empty stories)
- Full-page PNG screenshot per story

Output goes to `tools/storybook-verify/report.json` and `tools/storybook-verify/screenshots/*.png` — both are gitignored.

**Limitation:** it only catches JS errors and empty roots, not visual regressions. For visual issues you must read the screenshots yourself. If a whole category of stories all show unexpected empty states, suspect a loader/registry issue (e.g. a missing `loadPlugins` call).

### Reference commands

| Command | Purpose |
|---------|---------|
| `devcontainer exec --workspace-folder . bash -c "cd /workspace/app/frontend && bun run storybook"` | Start Storybook on port 6006 |
| `devcontainer exec --workspace-folder . bash -c "cd /workspace && bun run tools/storybook-verify/verify-all.ts"` | Run bulk verify over all stories (requires Storybook running) |
| `devcontainer exec --workspace-folder . bash -c "cd /workspace && bun run tools/storybook-verify/verify-all.ts --limit 5"` | Smoke-run first 5 stories only |
| `devcontainer exec --workspace-folder . bash -c "cd /workspace/app/frontend && xvfb-run bun run test:browser"` | Run addon-vitest browser tests (interaction tests) |

### Related context

- #137 — MSW adoption as the Storybook mocking layer (replaces `sb.mock`)
- #139 — `loadPlugins([builtinPlugin])` in `.storybook/preview.ts` (fixed empty `PreviewPlayer` in stories)
- #140 — Registry `register` dedup (idempotent by id, latest-wins)

## PR merge checklist

Before merging any PR, always:

1. Run all tests — all must pass
2. Verify with Playwright by accessing the dev server
3. If snapshots were added or changed, visually confirm via the feature catalog

## Agent workflow

Implementation and pre-merge review must each run in a separate subagent.

### Issue tracking during development

- If a problem is discovered during a task but not fixed within that task, create a GitHub issue to record it.
- If the problem should be addressed alongside a later task, link the issue to that task (add a note in the task's issue body).
- If the problem is independent, decide which Phase it belongs to, set the appropriate milestone and priority, and update the GitHub Project.

### Pre-task issue check

- Before starting a task, review open issues to check whether any block or affect the current task.
- If a blocking issue is found, resolve it first before proceeding with the task.

## Key environment details

- `node_modules` is mounted as a Docker volume (bun hardlinks don't work on Windows bind mounts)
- `CHROMIUM_PATH=/opt/google/chrome/chrome` is set automatically for CDP tests
- Backend binds to `0.0.0.0:3000` so Docker port forwarding reaches it
- See @.devcontainer/README.md for more details
