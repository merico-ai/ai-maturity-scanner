<!-- SPDX-License-Identifier: Apache-2.0 -->
<!-- SPDX-FileCopyrightText: 2026 SubLang International <https://sublang.ai> -->

# REP: Reporting

## Intent

This spec defines the user-visible report formats emitted by `ai-maturity-scanner`.
It does not cover how scan data is collected, tagged, or scored before rendering.

## Formats

### REP-1

When the selected format is `terminal`, the scanner shall render a human-readable report containing the report title, repository root, shortened HEAD SHA, level, AMI, dimension bars, scan timestamp, metric sections, and a file summary or an explicit empty-state message.

### REP-2

When the selected format is `md`, the scanner shall render a Markdown report containing repository metadata, overall level and AMI, a dimension table, metric tables, and a file section or an explicit empty-state message.

### REP-3

When the selected format is `json`, the scanner shall render pretty-printed JSON for the full report object followed by a trailing newline.

### REP-15

The report shall carry a human-readable `levelTitle` — a short, localized title mapped one-to-one from the level (`L0`–`L4`) via the active language — rendered alongside the level code in the `terminal` and `md` formats and emitted as the `levelTitle` field in the `json` payload.
