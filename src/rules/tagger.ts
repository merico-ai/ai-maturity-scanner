// Classifies a single file path into at most one tag per dimension.

import type { CollectedFile, Tag } from "../types.ts";
import { isSkillMd, parseAdvancedSkill } from "./advanced-skill.ts";
import {
  DEFAULT_RULES,
  DIMENSIONS,
  classifyFileExtension,
  classifyProjectScope,
  normalizePath,
} from "./patterns.ts";
import type { Rule } from "./patterns.ts";

export function classifyFile(path: string, rules: readonly Rule[] = DEFAULT_RULES): Tag[] {
  const normalized = normalizePath(path);
  const tags: Tag[] = [];
  for (const dimension of DIMENSIONS) {
    for (const rule of rules) {
      if (rule.kind !== dimension) continue;
      if (rule.test(normalized)) {
        tags.push({ kind: rule.kind, value: rule.value });
        break;
      }
    }
  }
  tags.push({ kind: "file_extension", value: classifyFileExtension(normalized) });
  tags.push({ kind: "project_scope", value: classifyProjectScope(normalized) });
  return tags;
}

/**
 * Classify one file in the context of the whole collected tree.
 *
 * Equivalent to running PathRuleParser and AdvancedSkillParser in sequence
 * over the same file (rules.py:250-271 `classify_files`).
 */
export function classifyFileInContext(
  file: CollectedFile,
  allFiles: readonly CollectedFile[],
  rules: readonly Rule[] = DEFAULT_RULES,
): Tag[] {
  if (!file.path) return [];
  const tags = classifyFile(file.path, rules);
  if (isSkillMd(file.path)) {
    tags.push(...parseAdvancedSkill(file, allFiles));
  }
  return tags;
}

export function classifyFiles(
  files: readonly CollectedFile[],
  rules: readonly Rule[] = DEFAULT_RULES,
): Array<{ path: string; tags: Tag[] }> {
  return files
    .filter((f) => f.path)
    .map((f) => ({
      path: normalizePath(f.path),
      tags: classifyFileInContext(f, files, rules),
    }));
}
