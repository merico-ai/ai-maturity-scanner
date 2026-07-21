<!-- SPDX-License-Identifier: Apache-2.0 -->
<!-- SPDX-FileCopyrightText: 2026 SubLang International <https://sublang.ai> -->

# DR-001: Repository Profile Labels

## Status

Accepted

## Context

The scanner already reports a stable maturity ladder: `L0` through `L4`, with the Chinese stage titles `不得其门`, `初出茅庐`, `渐入佳境`, `驾轻就熟`, and `炉火纯青`.
That ladder and the AMI score answer how much AI collaboration infrastructure a repository has accumulated.

They do not explain the repository's dominant collaboration shape.
For example, two `L3` repositories can reach the same level through skill engineering, multi-agent delegation, documentation, MCP integration, or cross-project coverage.

The existing v1 report already contains the raw and normalized signals needed to describe those shapes.
Adding a repository profile must not alter the collected-file set, raw metrics, AMI calculation, or L0–L4 cascade defined by [MAT-1](../user/maturity.md#mat-1), [MAT-2](../user/maturity.md#mat-2), and [MAT-3](../user/maturity.md#mat-3).

## Decision

### Profile model

Each report receives exactly one localized primary profile label and up to three localized trait labels.
The primary label is a descriptive repository archetype, rather than another maturity grade.
Traits communicate additional notable signals, each labeled by a high, medium, or low degree tier, without competing with the primary label.

The report shall continue to display the existing level title and AMI beside the profile.
For example: `L3 驾轻就熟 / 技能工坊 / 多代理协作·高 / 工具深连·中 / 跨项目覆盖·低`.

Profile labels shall describe repository-visible AI collaboration assets only.
They shall not claim code quality, developer proficiency, adoption frequency, model quality, or business impact.

### Derived signals

The profile evaluator uses only v1 `rawMetrics`, `normalizedMetrics`, and `dimensions` already present in the report contract.
It derives the following four class scores as the arithmetic mean of their existing normalized metrics:

| Signal | Inputs |
| --- | --- |
| `skill_score` | `skill_count`, `skill_line_count`, `advanced_skill_count`, `skill_engineering_rate`, `skill_resource_count` |
| `agent_score` | `agent_count`, `agent_line_count` |
| `command_score` | `command_count`, `command_line_count` |
| `mcp_score` | `mcp_count` |

These are profile-only signals.
They do not change the existing configuration-depth calculation, which gives the four classes equal weight.

### Primary labels

`unstarted` is the primary label when `ai_instruction_files = 0`.
`静待启程` is intentionally neutral: L0 is a scanner observation, not a judgment on a team or codebase.
Otherwise, the evaluator considers every specialized primary label whose eligibility rule is satisfied.
It assigns each candidate a calibrated 0–100 profile strength, rounds every candidate strength to two decimal places, and selects the candidate with the highest rounded strength.

The tie-break order below applies only when rounded strengths are equal.
This lets the profile describe the repository's strongest visible collaboration pattern rather than the first pattern in a fixed precedence list.

The evaluator shall not compare a raw normalized metric directly with a composite class or dimension score.
For a component score `s` and its eligibility floor `f`, it uses `headroom(s, f) = clamp((s - f) / (100 - f) * 100, 0, 100)`.
This expresses progress beyond the point at which that evidence first became sufficient for the label.
Every headroom floor shall be in the inclusive range `0..60`.

Primary labels require at least two independent evidence components.
Single-signal observations such as MCP service count and subproject instruction coverage remain traits, so a rapidly saturated count cannot displace a richer collaboration pattern as the primary label.
The number of strength components shall reflect the label's independent evidence dimensions: an already aggregated class may use one component, while a label that requires both scale and diversity or depth shall use each as a component.

| Tie-break order | ID | Chinese label | Eligibility rule | Profile strength | Meaning |
| ---: | --- | --- | --- | --- | --- |
| 1 | `ai-operating-system` | AI 协作中枢 | `configuration_depth >= 60`, `context_richness >= 60`, `integration_breadth >= 60`, and at least three of Skill, Agent, Command, and MCP have a non-zero raw count | minimum of `headroom(configuration_depth, 60)`, `headroom(context_richness, 60)`, and `headroom(integration_breadth, 60)` | The collaboration system is broad and balanced. |
| 2 | `skill-workshop` | 技能工坊 | `skill_score >= 50` and `skill_engineering_rate >= 0.15` | `headroom(skill_score, 50)` | Reusable and engineered skills are the dominant visible asset. |
| 3 | `agent-troupe` | 多代理剧团 | `agent_count >= 3` and `agent_type_distinct >= 3` | mean of `headroom(agent_score, 15)` and `headroom(agent_role_score, 60)` | Distinct agent roles are a defining collaboration pattern. |
| 4 | `command-center` | 命令指挥台 | `command_score >= 40` and `command_count >= 3` | `headroom(command_score, 40)` | Reusable commands are a defining interaction surface. |
| 5 | `knowledge-library` | 上下文图书馆 | `specs_file_count >= 20`, `context_richness >= 65`, `instruction_max_line_count >= 50`, and `spec_library_score >= 50` | mean of `headroom(context_richness, 60)`, `headroom(instruction_max_line_score, 60)`, and `headroom(spec_library_score, 50)` | Specifications and substantive written AI context are a defining asset. |

`agent_role_score` is `min(100, agent_type_distinct / 5 * 100)`.
`instruction_max_line_score` is the normalized `instruction_max_line_count`.
`spec_library_score` is the mean of normalized `specs_file_count` and `specs_line_count`.
The floors `15`, `50`, and `60` keep candidate strengths comparable while preserving the rule that headroom floors do not exceed `60`.

When no specialized label is eligible, the evaluator returns `early-collaboration` (`协作萌芽`).

### Trait labels

After selecting a primary label, the evaluator computes a 0–100 degree for every trait below from existing normalized metrics, maps each degree to one of three tiers, and returns the three highest-degree traits not already expressed by the primary label.
A trait is always assigned a tier; a repository with no relevant assets for a trait receives the `low` tier, so every report surfaces three trait labels rather than an empty trait set.
The uniform tier bars apply the same thresholds to every trait so that tiers stay comparable across traits: `low` for degree below `40`, `medium` for degree in the inclusive range `40..69`, and `high` for degree `70` or above.

| ID | Chinese label | Degree | Suppress when primary label is |
| --- | --- | --- | --- |
| `engineered-skills` | 能力工程化 | mean of `advanced_skill_count` and `skill_engineering_rate` | `skill-workshop` |
| `multi-agent` | 多代理协作 | mean of `agent_count` and `agent_role_score` | `agent-troupe` |
| `tool-connected` | 工具深连 | `mcp_count` | — |
| `structured-context` | 上下文成册 | mean of `instruction_max_line_count` and `specs_file_count` | `knowledge-library` |
| `cross-project` | 跨项目覆盖 | `subproject_coverage` | — |

`agent_role_score` is defined under Primary labels; every other degree input is an existing normalized metric.
The evaluator ranks the non-suppressed traits by degree descending, breaks ties by the canonical trait order in the table above, and returns the top three.
This guarantees that the MCP and cross-project signals remain visible after their promotion to trait-only status whenever their degree places them in the top three.

The primary and trait identifiers are canonical, stable, and language-independent.
Localized display labels may change independently of their identifiers.

### Delivery and compatibility

A future implementation should expose a `profile` report field containing the primary identifier, localized title, strength rounded to two decimal places, the ranked trait identifiers with each trait's degree rounded to two decimal places and tier, trait titles, and the matched rule IDs or metric facts needed to explain the result.
It should also expose every eligible primary candidate with its strength rounded to two decimal places, headroom components, and selection result, so users can compare the winner with close alternatives.
The profile field is additive to the existing report contract in [REP-4](../dev/reporting.md#rep-4).

Profile rules shall be versioned separately from AMI scoring rules.
An additive profile implementation may retain the AMI algorithm version, while introducing a dedicated profile-rule version in report metadata.
Replacing binary trait eligibility with continuous trait degrees, tier bucketing, and top-three ranking changes the profile contract and moves `meta.profileRuleVersion` from `v2` to `v3`.

The primary labels shall use the fixed thresholds and headroom transform above; traits shall use the degree functions and uniform tier bars above.
Before release, a representative corpus of scans shall be used to audit eligibility, winner, and trait tier distributions for every profile.
That audit shall explicitly report, for `tool-connected` and `cross-project`, the number of repositories that would have selected the corresponding single-signal primary label under the prior direct-score approach, the tier distribution of that trait, and the primary labels those repositories actually receive.
This "swallow rate" identifies whether a single-signal label would otherwise systematically hide stronger multi-evidence profiles.
For `ai-operating-system`, the audit shall report eligibility rate, winner rate, the distribution of `subproject_coverage`, and the count of eligible candidates whose zero strength is caused by `integration_breadth` at its eligibility floor.
Threshold or calibration changes may be made from those observations, but must preserve deterministic rules, comparable candidate scales, and explainability.

## Consequences

- Users get a memorable, explainable description without losing the stable L0–L4 maturity comparison.
- Repositories with the same maturity level can be differentiated by their visible AI collaboration emphasis.
- The taxonomy is constrained by currently collected data and therefore avoids unsupported claims about actual agent use or code outcomes.
- Future report renderers and JSON consumers need an additive profile surface and localized strings.
- Implementing this decision requires coordinated MAT/REP user, dev, and test items before behavior is released.
