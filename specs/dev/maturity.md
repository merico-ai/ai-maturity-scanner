<!-- SPDX-License-Identifier: Apache-2.0 -->
<!-- SPDX-FileCopyrightText: 2026 SubLang International <https://sublang.ai> -->

# MAT: Maturity Scoring

## Intent

This spec defines the raw metrics, normalization rules, and score composition used to compute repository maturity.
It does not cover command-line invocation, path tagging rules, or renderer-specific output formatting.
Repository-profile derivation and taxonomy follow [DR-001](../decisions/001-repository-profile-labels.md).

## Raw Metrics

### MAT-4

When aggregating collected files, the scanner shall compute raw metrics for `skill_count`, `skill_line_count`, `advanced_skill_count`, `skill_resource_count`, `agent_count`, `agent_line_count`, `command_count`, `command_line_count`, `mcp_count`, `ai_instruction_files`, `instruction_max_line_count`, `specs_file_count`, `specs_line_count`, `subproject_coverage`, and helper metric `agent_type_distinct`.
For `mcp_count`, the scanner shall count unique trimmed MCP server names parsed from explicitly supported repository-level MCP config sources only: Claude Code `.mcp.json` and `mcp.json` top-level `mcpServers` object keys, and Codex `.codex/config.toml` top-level `mcp_servers` object or table keys. The scanner shall deduplicate the same server name across supported files, ignore empty trimmed names, treat names as case-sensitive, and return no names on parse failure without failing the scan.

### MAT-5

When aggregating specs metrics, the scanner shall count Markdown files with extension `md`, `mdx`, or `mdc` as specs unless the same file also carries `file_type` in `instruction`, `skill`, `skill_resource`, `agent`, `command`, or `mcp`.

### MAT-6

When aggregating instruction and coverage metrics, the scanner shall use the maximum instruction line count rather than the sum, shall count distinct `agent_type` values rather than paths, and shall count `subproject_coverage` as the number of distinct instruction prefixes matching `apps/<name>/` or `libs/<name>/`.

## Normalization and Scoring

### MAT-7

When normalizing raw metrics, the scanner shall linearly saturate the following metrics at 100 points using these caps: `skill_count` 30, `skill_line_count` 15000, `advanced_skill_count` 10, `skill_resource_count` 30, `agent_count` 10, `agent_line_count` 2000, `command_count` 10, `command_line_count` 2000, `mcp_count` 3, `ai_instruction_files` 1, `specs_file_count` 50, `specs_line_count` 5000, and `subproject_coverage` 5.

### MAT-8

When normalizing `instruction_max_line_count`, the scanner shall score `10` at `<=0`, interpolate from `10` to `30` across `0..20`, interpolate from `30` to `100` across `20..50`, score `100` across `50..400`, interpolate from `100` to `30` across `400..1000`, and score `10` above `1000`.

### MAT-9

When normalizing `skill_engineering_rate`, the scanner shall compute `advanced_skill_count / skill_count`, shall score `0` when `skill_count <= 0`, and shall linearly saturate the rate at 100 points when the rate reaches `0.50`.

### MAT-10

When scoring AMI, the scanner shall average normalized skill metrics into a skill subscore, average normalized agent metrics into an agent subscore, average normalized command metrics into a command subscore, average normalized MCP metrics into an MCP subscore, average those four subscores into `configuration depth`, average normalized instruction and specs metrics into `context richness`, use normalized `subproject_coverage` as `integration breadth`, and round the final weighted AMI to two decimal places.

### MAT-16

When deriving a repository profile from an existing maturity report, the scanner shall apply the primary eligibility rules and headroom transform, candidate-strength selection, trait degree functions, uniform tier bucketing, top-three trait ranking, and canonical identifiers defined by DR-001, shall not change any raw metric, normalized metric, AMI, or L0–L4 level, and shall return `unstarted` when `ai_instruction_files` is `0`.

### MAT-17

When more than one specialized primary profile is eligible, the scanner shall select the candidate with the highest strength rounded to two decimal places, shall use the DR-001 tie-break order only when those rounded strengths are equal, shall compute every trait's degree and tier, rank the non-suppressed traits by degree descending with canonical-order tie-breaking, and return the top three, and shall include the selected and non-selected eligible candidates with their strength components in the profile evaluation result.
