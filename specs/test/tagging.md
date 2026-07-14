<!-- SPDX-License-Identifier: Apache-2.0 -->
<!-- SPDX-FileCopyrightText: 2026 SubLang International <https://sublang.ai> -->

# TAG: File Tagging

## Intent

This spec defines acceptance tests for path normalization and tagging across all classification dimensions.

## Acceptance

### TAG-6
Verifies: [TAG-1](../dev/tagging.md#tag-1), [TAG-2](../dev/tagging.md#tag-2), [TAG-3](../dev/tagging.md#tag-3)

Where the repository fixture contains representative instruction, skill, command, agent, spec, config, hook, and MCP paths, when the classifier tags the fixture set, each path shall receive the expected first-match `file_type` and `agent_type` tags and no path shall receive more than one tag per such dimension.

### TAG-7
Verifies: [TAG-4](../dev/tagging.md#tag-4)

When the classifier tags paths that vary by slash style, leading `./`, trailing slash, case, invalid extensions, and directory depth, the emitted normalized extension and project-scope tags shall match the path-normalization rules.

### TAG-8
Verifies: [TAG-5](../dev/tagging.md#tag-5)

Where one skill directory contains script resources and another does not, when the classifier tags both `SKILL.md` files in repository context, only the scripted skill shall receive `skill_level=advanced_skill`.
