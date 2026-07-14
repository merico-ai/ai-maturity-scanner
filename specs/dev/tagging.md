<!-- SPDX-License-Identifier: Apache-2.0 -->
<!-- SPDX-FileCopyrightText: 2026 SubLang International <https://sublang.ai> -->

# TAG: File Tagging

## Intent

This spec defines path-based tagging for file classification, agent attribution, project scope, file extension, and advanced skill detection.
It does not cover git file collection, metric aggregation, or user-facing report output.

## Classification

### TAG-1

When the scanner classifies a non-empty file path, the classifier shall emit at most one tag for `file_type` and at most one tag for `agent_type`, using first-match-wins rule ordering within each dimension, and shall always emit one `file_extension` tag and one `project_scope` tag.

### TAG-2

When a normalized path matches an AI fixture pattern, the classifier shall map it to the corresponding `file_type` among `instruction`, `skill`, `skill_resource`, `command`, `agent`, `spec`, `hook`, `config`, or `mcp`.

### TAG-3

When a normalized path matches an agent-specific directory or file pattern, the classifier shall map it to the corresponding `agent_type` among `claude`, `codex`, `opencode`, `continue`, `roocode`, `trae`, `gemini`, `cline`, `cursor`, `windsurf`, `qoder`, `codebuddy`, `copilot`, or `generic_agent`.

### TAG-4

When the classifier derives `file_extension` and `project_scope`, it shall normalize path separators, strip leading `./` segments, lowercase the last file extension, emit `none` for dotfiles or filenames without a usable extension, emit `other` for invalid or overlength extensions, emit `root` for top-level files, and emit `subproject` for nested files.

### TAG-5

Where a path is `SKILL.md` or ends with `/SKILL.md`, when the same skill directory contains a `scripts/` subtree or any sibling file ending in `.sh`, `.py`, `.js`, `.ts`, `.mjs`, or `.cjs`, the classifier shall add `skill_level=advanced_skill`.
