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
