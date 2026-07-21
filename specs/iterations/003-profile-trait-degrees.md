<!-- SPDX-License-Identifier: Apache-2.0 -->
<!-- SPDX-FileCopyrightText: 2026 SubLang International <https://sublang.ai> -->

# IR-003: Profile Trait Degrees and Tiers

## Goal

Replace the binary trait thresholds in [DR-001](../decisions/001-repository-profile-labels.md) with continuous per-trait degrees, three-tier bucketing, and top-three selection, so every repository surfaces three ranked trait labels instead of an often-empty trait set.
Keep raw metrics, AMI, and the L0–L4 cascade unchanged and move `meta.profileRuleVersion` from `v2` to `v3`.

## Status

In progress.
Specs (DR-001, IR-002 note, and the REP/MAT items below) are updated first; implementation follows.

## Deliverables

- [ ] DR-001 "Profile model", "Trait labels", and "Delivery and compatibility" sections rewritten for degrees, tiers, and top-three selection
- [ ] A `ProfileTier` type and a `ProfileTrait` carrying `degree` and `tier`, replacing `ProfileTraitKind`, `supportingTrait`, and `structuralTraits`
- [ ] A degree function per trait plus a uniform `40`/`70` tier transform, with deterministic top-three ranking and trait suppression preserved
- [ ] `meta.profileRuleVersion = "v3"` while `meta.algorithmVersion` remains `v1`
- [ ] Localized tier labels (`高`/`中`/`低`, `High`/`Medium`/`Low`) in terminal, Markdown, SVG/PNG, and JSON
- [ ] Regenerated profile-corpus audit fixture with trait tier distribution in place of carrier rate
- [ ] Web sample report, taxonomy, and tests migrated to the new contract

## Tasks

1. Update [DR-001](../decisions/001-repository-profile-labels.md) trait model, trait table, delivery wording, and version note; mark the v2 model superseded by this iteration.

2. Update [IR-002](002-repository-profile-labels.md) status and deliverables to record that the v2 binary trait contract is superseded by [DR-001](../decisions/001-repository-profile-labels.md) v3 traits.

3. Update the REP dev and user items to require a top-three ranked `traits` array with degree and tier, and pin `meta.profileRuleVersion` to `v3` in [REP-13](../dev/reporting.md#rep-13), [REP-16](../user/reporting.md#rep-16), and [REP-17](../dev/reporting.md#rep-17).

4. Update the MAT items to describe degree-based ranking and top-three traits: [MAT-15](../user/maturity.md#mat-15), [MAT-16](../dev/maturity.md#mat-16), and [MAT-17](../dev/maturity.md#mat-17).

5. Update [REP-18](../test/reporting.md#rep-18) and [MAT-18](../test/maturity.md#mat-18) acceptance items to assert top-three ranked traits with tiers and preserved maturity output.

6. Add the IR-003 row to [map.md](../map.md).

7. Define `ProfileTier`, rewrite `ProfileTrait` and `RepositoryProfileEvaluation`, and add `traitDegree` and `tierOf` helpers in `src/metrics/profile.ts`; bump `PROFILE_RULE_VERSION` to `v3`.

8. Update `src/report/profile.ts` to localize `traits[]` with degree and tier, dropping `supportingTrait` and `structuralTraits`.

9. Add `profileTiers` to `src/i18n/index.ts` for both locales.

10. Render tiered traits in `src/report/terminal.ts`, `src/report/markdown.ts`, and `src/report/image-svg.ts`; leave `src/report/json.ts` to serialize the contract unchanged.

11. Rewrite trait-shape assertions in `tests/profile.test.ts` and `tests/report.test.ts`, update `profileRuleVersion` literals in `tests/report.test.ts` and `tests/e2e.test.ts`, and regenerate `tests/fixtures/profile-corpus/repository-profile-corpus.result.json`.

12. Repurpose the audit harness `traitCarriers` block into a trait tier distribution and update `scripts/audit-profiles.ts` to read `profile.traits`.

13. Migrate `web/components/metrics-content.tsx`, `web/lib/profile-taxonomy.ts`, and `web/tests/metrics-profile.test.ts` to the new contract.

## Acceptance criteria

- Every report returns exactly one primary and exactly three ranked traits after suppression; every trait carries a `degree` in `0..100` rounded to two decimals and a `tier` of `high`, `medium`, or `low`.
- Degree functions and the uniform `40`/`70` tier bars match [DR-001](../decisions/001-repository-profile-labels.md); a repository with no relevant assets for a trait still receives `low`, and suppression removes at most one trait, leaving at least four candidates for top-three selection.
- `meta.profileRuleVersion` is `v3` and the release retains `meta.algorithmVersion = "v1"`; raw metrics, normalized metrics, dimensions, AMI, and L0–L4 results are unchanged for identical scans.
- Terminal, Markdown, and PNG render three tiered trait labels beside the primary; JSON exposes the ranked `traits` array with degree, tier, evidence, and all eligible primary candidates.
- The regenerated corpus audit reports per-trait tier distribution and the DR-001 counterfactuals, and matches `tests/fixtures/profile-corpus/repository-profile-corpus.result.json` byte-for-byte.
- `npm run lint`, `npm run build`, `npm test`, `npm run audit:profiles`, and the web `npm test` and `npm run build` all pass with the coverage described by [MAT-18](../test/maturity.md#mat-18) and [REP-18](../test/reporting.md#rep-18).
