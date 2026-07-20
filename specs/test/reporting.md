<!-- SPDX-License-Identifier: Apache-2.0 -->
<!-- SPDX-FileCopyrightText: 2026 SubLang International <https://sublang.ai> -->

# REP: Reporting

## Intent

This spec defines acceptance tests for terminal, Markdown, and JSON report rendering.

## Acceptance

### REP-9
Verifies: [REP-1](../user/reporting.md#rep-1), [REP-4](../dev/reporting.md#rep-4), [REP-5](../dev/reporting.md#rep-5)

When a representative report is rendered as `terminal`, the output shall include the title, repository root, shortened HEAD SHA, level, AMI, dimension bars, scan timestamp, metric sections, and the helper `agent_type_distinct` line.

### REP-10
Verifies: [REP-2](../user/reporting.md#rep-2), [REP-4](../dev/reporting.md#rep-4), [REP-5](../dev/reporting.md#rep-5)

When a representative report is rendered as `md`, the output shall include repository metadata, overall level and AMI, the dimension table, all metric rows, and the helper `agent_type_distinct` line.

### REP-11
Verifies: [REP-3](../user/reporting.md#rep-3), [REP-4](../dev/reporting.md#rep-4)

When a representative report is rendered as `json`, the output shall parse as JSON, preserve the full report object shape, and end with a trailing newline.

### REP-12
Verifies: [REP-6](../dev/reporting.md#rep-6), [REP-7](../dev/reporting.md#rep-7), [REP-8](../dev/reporting.md#rep-8)

When terminal and Markdown reports are rendered with empty file lists, grouped file lists, and over-limit file lists in separate runs, the renderers shall emit the empty-state message for empty input, shall group files in the declared order with agent and skill annotations, and shall indicate truncation at their respective limits.

### REP-18
Verifies: [REP-16](../user/reporting.md#rep-16), [REP-17](../dev/reporting.md#rep-17)

Where a report profile has one primary, multiple eligible supporting traits, and MCP and cross-project structural traits, when terminal, Markdown, and JSON reports are rendered, each renderer shall expose the primary and both structural traits, terminal and Markdown shall expose no more than one supporting trait, and JSON shall expose the selected profile strength and eligible primary candidates with their headroom components.
