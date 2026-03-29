# CLAUDE.md

## Commands

| Command | Purpose |
|---------|---------|
| `bun run dev` | Start dev server (backend + frontend) |
| `bun run restart` | Restart dev server (kills both on failure) |
| `bun run test` | Run all tests (includes snapshot & regression) |
| `bun run view:regression` | Start regression test viewer on port 3001 |

Frontend-specific (run from `app/frontend/`):

| Command | Purpose |
|---------|---------|
| `bun run storybook` | Start Storybook on port 6006 |
| `bun run build-storybook` | Build static Storybook |
| `bun run test:browser` | Run Vitest browser tests (needs `xvfb-run` in devcontainer) |

## Regression testing workflow

After modifying `sequence-ops` or export-related code, follow this workflow:

1. Run `bun run test` — detect regressions
2. If snapshot diff is intentional: `cd app/frontend && bun test sequence-ops.regression --update-snapshots`
3. If export frames changed: `UPDATE_REFERENCES=1 bun test export-regression`
4. Start `bun run view:regression` and verify visually with playwright-cli
5. Run `bun run test` again to confirm all pass, then commit (include `.snap` and `references/`)

### Adding new snapshot test cases

- Add test to `sequence-ops.regression.test.ts` using `stabilize()` + `toMatchSnapshot()`
- First run auto-generates the snapshot — verify it visually in the viewer
- IMPORTANT: Do NOT use `--update-snapshots` while iterating on a new case. Delete the single new entry from `.snap` and re-run instead, to avoid overwriting existing correct snapshots.

### Adding new export regression test cases

- Add factory function to `app/backend/src/__fixtures__/export/make-fixture-project.ts`
- Add test case to `export-regression.test.ts`
- First run auto-generates reference frames
- Add entry to `EXPORT_TESTS` in `tools/regression-viewer/index.ts`
- Verify frames visually in viewer before committing

## PR merge checklist

Before merging any PR, always:

1. Run `bun run test` — all tests must pass
2. Verify with Playwright by accessing the dev server
3. If snapshots were added or changed, visually confirm via the regression viewer

## Agent workflow

Implementation and pre-merge review must each run in a separate subagent.

## Devcontainer

See @.devcontainer/README.md for setup instructions. Key points:
- Set `GITHUB_TOKEN` on host before `devcontainer up`
- Browser tests need `xvfb-run` prefix inside container
