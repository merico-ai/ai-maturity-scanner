# Repository Guidelines

## Project Structure & Module Organization

This is a single ESM TypeScript CLI package for scanning AI coding maturity. Source code lives in `src/`:

- `src/cli.ts` contains the command-line entry point.
- `src/rules/` classifies repository paths and AI tooling files.
- `src/metrics/` aggregates raw counts and computes AMI scores and levels.
- `src/git/` and `src/scan/` handle tracked-file collection and line counting.
- `src/report/` renders terminal, Markdown, and JSON output.

Tests live in `tests/`, with fixtures under `tests/fixtures/`. Build output is generated in `dist/` and should not be edited directly.

## Build, Test, and Development Commands

- `npm install` installs dependencies from `package-lock.json`.
- `npm run dev` runs `tsup --watch`.
- `npm run build` builds `dist/cli.js` with the Node 22 ESM target.
- `npm test` runs the Vitest suite once.
- `npm run test:watch` runs Vitest in watch mode.
- `npm run lint` runs Biome checks on `src` and `tests`.
- `npm run format` applies Biome formatting to `src` and `tests`.

CI runs lint, build, tests, and a `node dist/cli.js --help` smoke check on Node 22 across Linux, macOS, and Windows.

## Coding Style & Naming Conventions

Use TypeScript with explicit module imports and ESM syntax. Biome enforces 2-space indentation, 100-character lines, double quotes, semicolons, and trailing commas. Prefer focused modules matching current directory responsibilities. Use descriptive kebab-case filenames such as `line-count.ts` and `stage-runtime.test.ts`; exported types and functions should use clear PascalCase or camelCase names.

## Testing Guidelines

Vitest is the test framework. Name tests `*.test.ts` and place them under `tests/`. Keep unit tests near behavioral boundaries such as scoring, rules, reports, and CLI behavior. Update golden fixtures in `tests/fixtures/` only when expected output intentionally changes. Coverage is configured with the V8 provider for `src/**/*.ts`.

## Commit & Pull Request Guidelines

The visible history currently contains a single initial commit, so no strict commit convention is established. Use concise, imperative commit subjects, for example `Add JSON report coverage`. Before opening a PR, run `npm run lint`, `npm run build`, and `npm test`. PR descriptions should explain the behavior change, mention related issues, and include sample CLI output when report formatting or user-facing output changes.

## Security & Configuration Tips

The CLI scans git-tracked files and shells out to `git`; do not introduce network calls or persistent services without a clear need. Keep generated artifacts, coverage output, and `node_modules/` out of commits.

## Specs (Source of Truth)

- Canonical specs live in `specs/`. Start with `specs/map.md` for a quick-reference index of all spec files.
- Before making changes or suggestions in an area that has a spec, read the relevant spec file(s) first and follow them.
- If unsure which spec applies, search `specs/` and propose the most relevant file(s) before proceeding.
