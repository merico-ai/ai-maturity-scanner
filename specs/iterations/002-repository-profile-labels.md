<!-- SPDX-License-Identifier: Apache-2.0 -->
<!-- SPDX-FileCopyrightText: 2026 SubLang International <https://sublang.ai> -->

# IR-002: Repository Profile Labels

## Goal

Deliver the additive, explainable repository-profile surface defined by [DR-001](../decisions/001-repository-profile-labels.md).
Keep raw metrics, AMI, and the L0–L4 cascade unchanged while making the selected profile, traits, and alternatives available in all report formats.

## Status

Tasks 1–7 are complete: the evaluator, localized report contract, terminal, Markdown, JSON, and automated coverage are implemented.
The audit harness and a redacted synthetic calibration fixture are checked in under `tests/fixtures/profile-corpus/`, with calibration disposition recorded in [IR-002 profile calibration](002-profile-calibration.md), but Tasks 8–10 remain open until a representative pre-release corpus or immutable external-corpus fingerprint is supplied.

## Deliverables

- [x] A localized profile contract with canonical IDs, rule/fact evidence, rounded strengths and candidates, and `meta.profileRuleVersion = "v2"` while `meta.algorithmVersion` remains `v1`
- [x] Deterministic primary selection and trait selection using only existing report metrics
- [x] Terminal, Markdown, and JSON profile output
- [x] Unit and acceptance coverage for profile rules and rendering
- [ ] A reproducible representative-corpus audit, saved result, and documented calibration disposition — harness and synthetic calibration are checked in; a representative corpus remains required

## Tasks

1. Clarify DR-001's prior direct-score counterfactual before implementing the audit: define, for `tool-connected` and `cross-project`, the eligibility predicate, normalized direct-score input and transform, rounding, and candidate/tie semantics, or record an explicit decision that replaces this comparison.

2. Extend the REP development and acceptance contracts with the additive `profile` payload and `meta.profileRuleVersion`; pin its current value to `v2` and state that the additive profile release retains `meta.algorithmVersion = "v1"`.

3. Define profile domain types, canonical identifiers, and English and Chinese titles in `src/metrics`, `src/report`, and `src/i18n`; include selected-primary and trait evidence plus candidate headroom components and selection status.

4. Implement and unit-test a pure profile evaluator from `rawMetrics`, `normalizedMetrics`, and dimensions; calculate the four class scores, headroom values, rounded candidate strengths, deterministic winner, and trait suppression rules from [DR-001](../decisions/001-repository-profile-labels.md).

5. Integrate profile evaluation into `buildReport` without changing raw metric aggregation, normalization, AMI scoring, or level selection; return `unstarted` for reports without AI instruction files as required by [MAT-16](../dev/maturity.md#mat-16).

6. Render localized primary and trait labels beside the level and AMI in terminal and Markdown, with at most one supporting trait and every structural trait; preserve the full profile evidence in JSON per [REP-16](../user/reporting.md#rep-16).

7. Add evaluator, report, and CLI acceptance coverage for every primary label, `unstarted`, `early-collaboration`, rounding and tie-breaking, trait ordering and suppression, localized renderer output, and the JSON profile contract; prove the existing maturity values are preserved.

8. Add a reproducible corpus-audit command or checked-in harness that scans a supplied representative corpus and reports every primary's eligibility and winner rates, every trait's carrier rate, and the counterfactual defined in Task 1.

9. Run the audit on a representative pre-release corpus and check in a redacted result plus its corpus manifest and invocation, or an immutable input fingerprint and documented external corpus location; report the `tool-connected` and `cross-project` counterfactual winner count, trait-carrier count, and actual-primary distribution, plus the AI-operating-system eligibility rate, winner rate, `subproject_coverage` distribution, and integration-floor zero-strength count.

10. Review the checked-in audit result against DR-001 constraints and record the calibration disposition: retain the fixed rules or author a follow-up decision for any threshold or transform change.

11. Render the localized primary profile and eligible supporting and structural traits alongside the level and AMI in the PNG report; preserve fixed-layout readability in English and Chinese, retain redaction behavior, and add SVG/PNG renderer coverage.

12. Update the Chinese and English Web documentation pages with the repository-profile taxonomy, primary-versus-trait semantics, canonical identifiers, selection/evidence summary, and the relationship to AMI and L0–L4; retain the existing Web metrics explanations; add relevant Web-page coverage and verify the Web build.

## Acceptance criteria

- Reports with no AI instruction files use the neutral `unstarted` primary profile; every report returns exactly one primary, no more than one supporting trait, and no more than two structural traits.
- Eligible specialized primaries are compared on rounded two-decimal strengths, with DR-001 tie-breaking only for equal rounded values; MCP and cross-project never become primaries.
- Profile evaluation uses only existing report metrics and leaves raw metrics, normalized metrics, dimensions, AMI, and L0–L4 results unchanged for identical scans.
- The profile payload exposes language-independent canonical IDs, localized titles, matched rule IDs or metric facts, strengths rounded to two decimals, candidate headroom components, and candidate selection status; `meta.profileRuleVersion` is `v2` and the additive release retains `meta.algorithmVersion = "v1"`.
- Terminal and Markdown expose localized profile labels beside the existing level and AMI; JSON exposes the versioned profile result, localized titles, evidence, and all eligible candidates.
- PNG exposes localized profile labels beside the existing level and AMI without changing the report's redaction behavior.
- The Chinese and English Web documentation pages explain profile labels, traits, selection evidence, and their additive relationship to AMI and L0–L4; the Web metrics pages retain their existing metric explanations.
- `npm run lint`, `npm run build`, and `npm test` pass with the evaluator, renderer, and CLI coverage described by [MAT-18](../test/maturity.md#mat-18) and [REP-18](../test/reporting.md#rep-18).
- A checked-in or immutably referenced representative-corpus audit reports all rates, counterfactuals, and diagnostics mandated by DR-001 before the profile release is approved.
