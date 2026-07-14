// Tags SKILL.md entries whose skill directory bundles executable scripts.
// Emits `skill_level=advanced_skill` when the skill's own directory contains
// a `scripts/` subdirectory or any file with a script-like extension.

import type { CollectedFile, Tag } from "../types.ts";
import { normalizePath } from "./patterns.ts";

export const SCRIPT_EXTENSIONS = [".sh", ".py", ".js", ".ts", ".mjs", ".cjs"] as const;
export const ADVANCED_SKILL_RULE_VERSION = "1";

export function isSkillMd(path: string): boolean {
  const normalized = normalizePath(path);
  return normalized === "SKILL.md" || normalized.endsWith("/SKILL.md");
}

export function skillDirHasScripts(files: readonly CollectedFile[], skillDir: string): boolean {
  const prefix = skillDir ? `${skillDir}/` : "";
  for (const entry of files) {
    const rawPath = entry.path;
    if (!rawPath) continue;
    const path = normalizePath(rawPath);
    if (prefix && !path.startsWith(prefix)) continue;
    const lower = path.toLowerCase();
    if (SCRIPT_EXTENSIONS.some((ext) => lower.endsWith(ext))) {
      return true;
    }
    const rest = prefix ? path.slice(prefix.length) : path;
    if (rest === "scripts" || rest.startsWith("scripts/") || rest.includes("/scripts/")) {
      return true;
    }
  }
  return false;
}

/**
 * Returns the advanced_skill tag if the given SKILL.md entry's sibling
 * directory contains scripts; returns an empty array otherwise.
 *
 * Caller is responsible for only invoking this on entries that satisfy
 * {@link isSkillMd}.
 */
export function parseAdvancedSkill(file: CollectedFile, allFiles: readonly CollectedFile[]): Tag[] {
  const path = normalizePath(file.path);
  const lastSlash = path.lastIndexOf("/");
  const skillDir = lastSlash >= 0 ? path.slice(0, lastSlash) : "";
  if (skillDirHasScripts(allFiles, skillDir)) {
    return [{ kind: "skill_level", value: "advanced_skill" }];
  }
  return [];
}
