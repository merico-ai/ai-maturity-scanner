// Aggregates tagged files into raw maturity metrics.

import type { FileWithTags, Tag } from "../types.ts";
import { type MaturityRawMetrics, emptyRawMetrics } from "./types.ts";

const FILE_TYPE_AGENT = "agent";
const FILE_TYPE_SKILL = "skill";
const FILE_TYPE_SKILL_RESOURCE = "skill_resource";
const FILE_TYPE_INSTRUCTION = "instruction";
const FILE_TYPE_COMMAND = "command";
const FILE_TYPE_MCP = "mcp";
const SKILL_LEVEL_ADVANCED = "advanced_skill";
const PROJECT_SCOPE_SUBPROJECT = "subproject";

const MARKDOWN_EXTENSIONS = new Set(["md", "mdx", "mdc"]);

// file_types that disqualify a Markdown file from specs aggregation
// (design §4.3 v1.6).
const SPECS_EXCLUDED_FILE_TYPES = new Set([
  FILE_TYPE_INSTRUCTION,
  FILE_TYPE_SKILL,
  FILE_TYPE_SKILL_RESOURCE,
  FILE_TYPE_AGENT,
  FILE_TYPE_COMMAND,
  FILE_TYPE_MCP,
]);

// Path prefix for "subproject" classification: apps/<name>/ or libs/<name>/
const SUBPROJECT_PREFIX_PATTERN = /^(?:apps|libs)\/[^/]+\//;

function findTagValue(tags: readonly Tag[], kind: string): string | undefined {
  for (const t of tags) {
    if (t.kind === kind) return t.value;
  }
  return undefined;
}

function countSubprojectPrefixes(paths: readonly string[]): number {
  const prefixes = new Set<string>();
  for (const p of paths) {
    const match = SUBPROJECT_PREFIX_PATTERN.exec(p);
    if (match) prefixes.add(match[0]);
  }
  return prefixes.size;
}

/**
 * Aggregate per-file tags + line counts into raw maturity metrics.
 *
 * Input is the output of `classifyFiles` joined with on-disk size/line data.
 * Output matches `MaturityMetricsRepository.compute_raw_metrics` field-by-field.
 */
export function aggregateRawMetrics(files: readonly FileWithTags[]): MaturityRawMetrics {
  const metrics = emptyRawMetrics();

  const excludedPaths = new Set<string>();
  for (const f of files) {
    const ft = findTagValue(f.tags, "file_type");
    if (ft && SPECS_EXCLUDED_FILE_TYPES.has(ft)) {
      excludedPaths.add(f.path);
    }
  }

  const agentTypeValues = new Set<string>();
  const mcpServerNames = new Set<string>();
  const subprojectInstructionPaths: string[] = [];

  for (const f of files) {
    const lines = f.lines || 0;
    const fileType = findTagValue(f.tags, "file_type");
    const agentType = findTagValue(f.tags, "agent_type");
    const skillLevel = findTagValue(f.tags, "skill_level");
    const ext = findTagValue(f.tags, "file_extension");
    const scope = findTagValue(f.tags, "project_scope");
    for (const name of f.mcpServerNames ?? []) {
      const trimmed = name.trim();
      if (trimmed) {
        mcpServerNames.add(trimmed);
      }
    }

    if (fileType === FILE_TYPE_SKILL) {
      metrics.skillCount += 1;
      metrics.skillLineCount += lines;
    }
    if (skillLevel === SKILL_LEVEL_ADVANCED) {
      metrics.advancedSkillCount += 1;
    }
    if (fileType === FILE_TYPE_SKILL_RESOURCE) {
      metrics.skillResourceCount += 1;
    }
    if (fileType === FILE_TYPE_AGENT) {
      metrics.agentCount += 1;
      metrics.agentLineCount += lines;
    }
    if (fileType === FILE_TYPE_COMMAND) {
      metrics.commandCount += 1;
      metrics.commandLineCount += lines;
    }
    if (fileType === FILE_TYPE_INSTRUCTION) {
      metrics.aiInstructionFiles += 1;
      if (lines > metrics.instructionMaxLineCount) {
        metrics.instructionMaxLineCount = lines;
      }
    }
    if (ext && MARKDOWN_EXTENSIONS.has(ext) && !excludedPaths.has(f.path)) {
      metrics.specsFileCount += 1;
      metrics.specsLineCount += lines;
    }
    if (agentType) {
      agentTypeValues.add(agentType);
    }
    if (fileType === FILE_TYPE_INSTRUCTION && scope === PROJECT_SCOPE_SUBPROJECT) {
      subprojectInstructionPaths.push(f.path);
    }
  }

  metrics.agentTypeDistinct = agentTypeValues.size;
  metrics.mcpCount = mcpServerNames.size;
  metrics.subprojectCoverage = countSubprojectPrefixes(subprojectInstructionPaths);
  return metrics;
}
