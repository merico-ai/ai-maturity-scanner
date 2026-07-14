// Classifies a single file path into at most one tag per dimension.

import type { CollectedFile, Tag } from "../types.ts";
import { isSkillMd, parseAdvancedSkill } from "./advanced-skill.ts";
import {
  ALL_RULES,
  DIMENSIONS,
  classifyFileExtension,
  classifyProjectScope,
  normalizePath,
} from "./patterns.ts";

export function classifyFile(path: string): Tag[] {
  const normalized = normalizePath(path);
  const tags: Tag[] = [];
  for (const dimension of DIMENSIONS) {
    for (const rule of ALL_RULES) {
      if (rule.kind !== dimension) continue;
      if (rule.pattern.test(normalized)) {
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
): Tag[] {
  if (!file.path) return [];
  const tags = classifyFile(file.path);
  if (isSkillMd(file.path)) {
    tags.push(...parseAdvancedSkill(file, allFiles));
  }
  return tags;
}

export function classifyFiles(
  files: readonly CollectedFile[],
): Array<{ path: string; tags: Tag[] }> {
  return files
    .filter((f) => f.path)
    .map((f) => ({
      path: normalizePath(f.path),
      tags: classifyFileInContext(f, files),
    }));
}
