<!-- SPDX-License-Identifier: Apache-2.0 -->
<!-- SPDX-FileCopyrightText: 2026 SubLang International <https://sublang.ai> -->

# IR-001: High-Priority Roadmap Batch

## Goal

Deliver the six active high-priority items from [`ROADMAP.md`](../../ROADMAP.md) (items 1 and 7 deferred) in four parallel tracks that touch disjoint code areas.

The four tracks are:

| Lane | Area | Items |
| --- | --- | --- |
| A | Report metadata (`src/metrics`, `src/report`) | Algorithm version, i18n |
| B | Packaging (`package.json`, release config) | npm rename, publish |
| C | Image rendering research (`specs/dev`) | Image-gen design doc |
| D | Web site (`web/`) | Next.js landing site |

Lanes share no source files, so tasks across lanes may run concurrently.

## Deliverables

- [x] `ALGORITHM_VERSION = "v1"` constant surfaced in terminal, markdown, and json reports
- [x] `--lang zh|en` flag (default `zh`) translating report user-facing text; CLI prompts and rules untouched
- [x] Package renamed to `@merico-ai/maturity-scanner`; CLI command name `ai-maturity-scanner` retained
- [x] `specs/dev/image-rendering.md` design doc selecting `sharp` + SVG, pinning `qrcode`, and limiting redaction to the repository address
- [x] `web/` Next.js 14 App Router project with landing, metrics, and docs pages plus vibeinsight CTA
- [ ] `web/` deployed (Vercel or equivalent)
- [ ] Package published to npm under the new scope (final task, after all features stabilize)

## Tasks

### Lane A — Report metadata

1. Add `ALGORITHM_VERSION = "v1"` constant in `src/metrics/types.ts`; inject it into the shared `MaturityReport.meta` shape returned by `buildReport`.

2. Surface `meta.algorithmVersion` in `src/report/{terminal,markdown,json}.ts`; add one regression test per renderer.

3. Add `src/i18n/{zh,en}.ts` dictionaries and a `--lang zh|en` CLI flag (default `zh`) wired through `buildReport`; CLI prompts and rule names stay untranslated.

4. Replace hard-coded renderer strings with i18n lookups; cover both languages in renderer tests.

### Lane B — Packaging

5. Rename `package.json` `name` to `@merico-ai/maturity-scanner`; keep `bin.ai-maturity-scanner`; update README install snippet; verify with `npm pack --dry-run`. — **done**; also switched `prepack`/`prepublishOnly` from `pnpm` to `npm` so the lifecycle hooks match the project's npm lockfile and toolchain.

6. Sync the new name into any release-please manifest or workflow config under `.github/`. — **done** (`release.yml` `package-name`).

7. Publish to npm via the release-please tag once Lanes A, C, and D land; smoke-test with `npx @merico-ai/maturity-scanner --help`. — **pending**; blocked on `web/` deployment verification and the `NPM_TOKEN` secret being configured for the `@merico-ai` scope.

### Lane C — Image rendering research

8. Author `specs/dev/image-rendering.md` covering: backend comparison (`sharp` + SVG vs `puppeteer` vs `@napi-rs/canvas`) with `sharp` + SVG selected for the first implementation, QR library selection (`qrcode`), redaction scope (repo URL/address only, per ROADMAP item 5 constraint), and a follow-up implementation outline for the next IR.

### Lane D — Web site

9. Scaffold a Next.js 14 App Router project under `web/` with its own `package.json`, Tailwind, and a placeholder landing page; isolate from CLI toolchain. — **done**; verified with `npm run lint` and `npm run build` in `web/`.

10. Build the landing page (feature overview + CTA), `/metrics` (metric explanations), and `/docs` (install + usage); include a vibeinsight referral entry point. — **done**; includes localized `zh` and `en` routes for landing, quick start, about, metrics, and docs.

11. Configure deployment (Vercel preferred for zero-config Next.js); set domain and routes. — **partial**; `web/vercel.json` is present, but production deployment and URL/domain verification are still pending.

## Acceptance criteria

- All three report formats print `algorithmVersion: v1` (or equivalent) and `npm test` passes (currently 119 tests plus new ones).
- Running with `--lang en` produces English report text; running with no flag (or `--lang zh`) produces Chinese; both languages covered by tests.
- `npm pack --dry-run` lists the package under `@merico-ai/maturity-scanner` and the CLI still launches as `ai-maturity-scanner`.
- `specs/dev/image-rendering.md` exists with `sharp` + SVG as the selected backend and a follow-up task outline.
- `web/` builds locally with `npm run build`; production deployment and deployed URL verification remain pending.
- The published npm package installs via `npx @merico-ai/maturity-scanner --help` from a clean environment.

## Parallelism

Phase 0 — Tasks 1, 5, 8, 9 run concurrently (no file overlap).
Phase 1 — Task 2 after 1; Task 10 after 9; Task 3 after 2; Task 4 after 3.
Phase 2 — Task 11 after 10.
Final — Task 6 anytime after 5; Task 7 last.
