# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Standalone Node.js CLI distributed via npm. Scans a git repository and prints
an "AI coding maturity" report (level L0–L4 + AMI score 0–100). No database,
no server. The classification rules, scoring caps, and level thresholds are
maintained in this repository.

## Commands

```bash
npm test                    # vitest run (all 119 tests)
npm test -- rules           # run one test file by name
npm run test:watch          # vitest in watch mode
npm run build               # tsup → dist/cli.js
npm run lint                # biome check src tests
npx biome check --write src tests   # apply safe lint/format fixes
node dist/cli.js <repo>     # smoke-run the built CLI
```

When adding to `src/` or `tests/`, run `npx biome check --write src tests`
before claiming the work is done — biome enforces import ordering and the
lint step in CI fails on any diff.

## Architecture

The data flow is strictly one-directional. Each layer is a pure consumer of
the one above it; nothing reaches back upstream.

```
git workspace → scan/collect → rules/tagger → metrics/aggregate → metrics/score → report/*
```

### Layer responsibilities

- **`src/rules/`** — pure path → tags classifier. `patterns.ts` holds
  `ALL_RULES` (regex list, first-match-wins per dimension), plus
  `classifyFileExtension` / `classifyProjectScope` helpers. `advanced-skill.ts`
  inspects sibling files in a skill directory. `tagger.ts` orchestrates and
  exports `classifyFile` / `classifyFileInContext` / `classifyFiles`.
- **`src/metrics/`** — `aggregate.ts` turns `FileWithTags[]` into
  `MaturityRawMetrics` (15 raw counts); `normalize.ts` has `_sat` / `_lerp` /
  `scoreInstructionLines` piecewise; `score.ts` packs `scoreAmi` (60/30/10
  weighted) and `determineLevel` (L0–L4 cascade). Types in `types.ts`.
- **`src/git/workspace.ts`** — `execFile('git', ...)` wrappers. All read-only.
  Throws `GitError` on non-zero exit; NodeJS.ErrnoException with `code: "ENOENT"`
  when git is missing.
- **`src/scan/`** — `collect.ts` walks `git ls-files`, classifies, then
  **only stats/counts-lines for relevant files** (AI-tagged or Markdown).
  Line counting is skipped for non-Markdown files.
- **`src/report/`** — three renderers (`terminal`, `markdown`, `json`) plus
  `types.ts` holding the shared `MaturityReport` shape. All three emit the
  same data; only formatting differs.
- **`src/cli.ts`** — commander entry. Exports `buildReport` + `renderReport`
  for testability; the `program.parseAsync` call is guarded by an
  `import.meta.url === pathToFileURL(process.argv[1]).href` check so the
  module can be imported by tests without triggering argv parsing.

### The 5 tagging dimensions

Each file gets at most one tag per dimension. Order within `classifyFile`
output is: `file_type` → `agent_type` → `file_extension` → `project_scope`
→ `skill_level` (only on `SKILL.md` whose directory has scripts).

The `file_extension` and `project_scope` dimensions are emitted
unconditionally for every file with a non-empty path; the others are
optional.

### How line counts flow

`collect.ts` only computes line counts for Markdown files
(`md`/`mdx`/`mdc`). Non-Markdown files have `lines: 0`. This is intentional
and the aggregator relies on it for `skill_line_count`, `agent_line_count`,
etc. Don't change this without also updating the aggregator's expectations.

## Rule maintenance

When changing path rules, keep regex behavior explicit and covered by tests:

- case-insensitive matches use `new RegExp(pattern, "i")`
- substring matches use `RegExp.test`
- full-path matches use anchors such as `^...$`

The golden fixture at `tests/fixtures/rules.golden.json` is the regression
net for the path rules. If you change `ALL_RULES`, update the fixture in the
same change and verify each case by hand. `tests/rules.test.ts` will only
tell you that output matches expectations, not that expectations are correct.

## CLI exit codes

| Code | Meaning |
| --- | --- |
| `0` | Success |
| `1` | Bad CLI args or runtime error |
| `2` | Target is not a git repository |
| `3` | `git` binary not found on PATH |

## CI

`.github/workflows/ci.yml` runs lint + build + test on
ubuntu/macos/windows × Node 18/20/22. The e2e test (`tests/e2e.test.ts`)
creates a real fixture git repo in `os.tmpdir()` and skips itself if `git`
isn't on PATH.

`.github/workflows/release.yml` runs release-please on `main`; on tag, it
publishes to npm with `--provenance`. **`NPM_TOKEN` secret must be set** for
publishing to work. The repo is `merico-ai/ai-maturity-scanner`.

## Specs (Source of Truth)

- Canonical specs live in `specs/`. Start with `specs/map.md` for a quick-reference index of all spec files.
- Before making changes or suggestions in an area that has a spec, read the relevant spec file(s) first and follow them.
- If unsure which spec applies, search `specs/` and propose the most relevant file(s) before proceeding.
