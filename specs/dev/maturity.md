<!-- SPDX-License-Identifier: Apache-2.0 -->
<!-- SPDX-FileCopyrightText: 2026 SubLang International <https://sublang.ai> -->

# MAT: Maturity Scoring

## Intent

This spec defines the raw metrics, normalization rules, and score composition used to compute repository maturity.
It does not cover command-line invocation, path tagging rules, or renderer-specific output formatting.

## Raw Metrics

### MAT-4

When aggregating collected files, the scanner shall compute raw metrics for `skill_count`, `skill_line_count`, `advanced_skill_count`, `skill_resource_count`, `agent_count`, `agent_line_count`, `command_count`, `command_line_count`, `mcp_count`, `ai_instruction_files`, `instruction_max_line_count`, `specs_file_count`, `specs_line_count`, `subproject_coverage`, and helper metric `agent_type_distinct`.

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
