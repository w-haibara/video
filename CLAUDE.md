# CLAUDE.md

## Commands

| Command | Purpose |
|---------|---------|
| `bun run dev` | Start dev server (backend + frontend) |
| `bun run restart` | Restart dev server (kills both on failure) |
| `bun run test` | Run all tests (includes snapshot & regression) |
| `bun run catalog` | Start feature catalog on port 3001 |

Frontend-specific (run from `app/frontend/`):

| Command | Purpose |
|---------|---------|
| `bun run storybook` | Start Storybook on port 6006 |
| `bun run build-storybook` | Build static Storybook |
| `bun run test:browser` | Run Vitest browser tests (needs `xvfb-run` in devcontainer) |

## Testing policy

- Aggressively add test cases. Test optimization can happen later — when working on a task, add every test case you can think of without worrying about redundancy.
- Always add regression tests (both export regression and snapshot) for any change that affects video output or sequence operations. Do not skip regression cases.
- For video output tests, cover not only individual features but also combinations of features (e.g., transition + transform, blend mode + crop, multi-track + transition). These cross-feature interactions are where regressions hide.
- When snapshots are added or changed, always visually verify the additions or changes. Use `bun run catalog` with Playwright, or use `claude -p` to take and inspect screenshots.

## Regression testing workflow

After modifying `sequence-ops` or export-related code, follow this workflow:

1. Run `bun run test` — detect regressions
2. If snapshot diff is intentional: `cd app/frontend && bun test sequence-ops.regression --update-snapshots`
3. If export frames changed: `UPDATE_REFERENCES=1 bun test export-regression`
4. Start `bun run catalog` and verify visually with playwright-cli
5. Run `bun run test` again to confirm all pass, then commit (include `.snap` and `references/`)

### Adding new snapshot test cases

- Add test to `sequence-ops.regression.test.ts` using `stabilize()` + `toMatchSnapshot()`
- First run auto-generates the snapshot — verify it visually in the feature catalog
- IMPORTANT: Do NOT use `--update-snapshots` while iterating on a new case. Delete the single new entry from `.snap` and re-run instead, to avoid overwriting existing correct snapshots.

### Preview regression testing

Preview regression tests capture browser-rendered preview frames via Playwright
and compare against reference screenshots. Requires `bun run dev` running.

- Run: `bun test tools/preview-test/preview-regression.test.ts`
- Update references: `UPDATE_PREVIEW_REFERENCES=1 bun test tools/preview-test/preview-regression.test.ts`
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

1. Run `bun run test` — all tests must pass
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

## Devcontainer

See @.devcontainer/README.md for setup instructions. Key points:
- Set `GITHUB_TOKEN` on host before `devcontainer up`
- Browser tests need `xvfb-run` prefix inside container
