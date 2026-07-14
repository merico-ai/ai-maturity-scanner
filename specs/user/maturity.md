<!-- SPDX-License-Identifier: Apache-2.0 -->
<!-- SPDX-FileCopyrightText: 2026 SubLang International <https://sublang.ai> -->

# MAT: Maturity Scoring

## Intent

This spec defines the user-visible maturity levels and AMI scoring model reported by `ai-maturity-scanner`.
It does not cover path classification rules, file collection mechanics, or report renderer formatting.

## Levels

### MAT-1

When the scanner reports repository maturity, the report shall include one level in `L0`, `L1`, `L2`, `L3`, or `L4` and one AMI score in the range `0` to `100`.

### MAT-2

When the scanner determines the maturity level, the scanner shall return `L0` when `ai_instruction_files < 1`, shall otherwise evaluate thresholds from `L4` down to `L2`, shall return `L4` when `ability_applied >= 25`, `skill_engineering_rate >= 0.40`, and `specs_files >= 20`, shall return `L3` when `ability_applied >= 15`, `advanced_skill >= 2`, `skill_engineering_rate >= 0.15`, and `specs_files >= 10`, shall return `L2` when `ability_applied >= 8` and `advanced_skill >= 1`, and shall otherwise return `L1`.

### MAT-3

When the scanner reports AMI, the score shall be a weighted average of `configuration depth` at `0.6`, `context richness` at `0.3`, and `integration breadth` at `0.1`.
