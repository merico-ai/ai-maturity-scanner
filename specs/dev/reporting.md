<!-- SPDX-License-Identifier: Apache-2.0 -->
<!-- SPDX-FileCopyrightText: 2026 SubLang International <https://sublang.ai> -->

# REP: Reporting

## Intent

This spec defines report payload and renderer contracts for terminal, Markdown, and JSON output.
It does not cover command-line option parsing, repository scanning, or maturity score calculation.

## Report Contract

### REP-4

When a report is built, the report object shall contain `repo.root`, `repo.headSha`, `repo.scannedAt`, `level`, `levelTitle`, `ami`, `dimensions.configuration_depth`, `dimensions.context_richness`, `dimensions.integration_breadth`, `normalizedMetrics`, `rawMetrics`, additive `profile`, and `files`.
When the repository has an `origin` remote URL, the report object shall include it as `repo.remoteUrl`.

### REP-13

When a report is built, the report object shall contain `meta.algorithmVersion` set to the algorithm version constant declared in `src/metrics/types.ts` (currently `v1`), so that older reports remain interpretable after future scoring changes.
The additive profile release retains `meta.algorithmVersion = "v1"` and adds `meta.profileRuleVersion = "v1"`, independently versioning profile rules.

### REP-14

When a report is built, the report object shall contain `meta.lang` set to the language used for renderer text (`zh` or `en`, default `zh`).
Rule names, tag values, and metric identifiers shall remain in their canonical form regardless of `meta.lang`.

### REP-5

When rendering metric sections, the terminal and Markdown renderers shall expose all normalized metrics and raw metric values grouped as Skill, Agent, Command, MCP, Instruction, Specs, and Integration, and shall expose `agent_type_distinct` as a helper metric that is outside AMI.

### REP-6

When rendering file lists, the terminal and Markdown renderers shall group files by `file_type`, shall prefer the order `instruction`, `skill`, `skill_resource`, `command`, `agent`, `spec`, `hook`, `config`, `mcp`, `(none)`, and shall annotate file entries with `agent_type` and `skill_level` when present.

### REP-7

When a report has no collected files, the terminal and Markdown renderers shall emit a no-files empty-state message instead of an empty grouped list.

### REP-8

When the collected file list exceeds the renderer limit, the terminal renderer shall show at most 30 file entries and the Markdown renderer shall show at most 50 file entries, with each renderer indicating truncation.

### REP-17

When a report contains a repository profile, the report object shall include canonical primary and trait identifiers, localized titles, primary strength rounded to two decimal places, matched rule identifiers or metric facts, and every eligible primary candidate's identifier, strength rounded to two decimal places, headroom components, and selected status; terminal and Markdown renderers shall render one primary, at most one supporting trait, and every structural trait.
