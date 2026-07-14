import {
  CAP_ADVANCED_SKILL_COUNT,
  CAP_AGENT_COUNT,
  CAP_AGENT_LINES,
  CAP_COMMAND_COUNT,
  CAP_COMMAND_LINES,
  CAP_INSTRUCTION_FILES,
  CAP_MCP_COUNT,
  CAP_SKILL_COUNT,
  CAP_SKILL_LINES,
  CAP_SKILL_RESOURCE_COUNT,
  CAP_SPECS_FILES,
  CAP_SPECS_LINES,
  CAP_SUBPROJECT_COVERAGE,
  sat,
  scoreEngineeringRate,
  scoreInstructionLines,
} from "./normalize.ts";
import type { DimensionScores, MaturityRawMetrics, MaturityScore } from "./types.ts";
import { abilityAppliedCount, skillEngineeringRate } from "./types.ts";

// ── Dimension weights (design §4.1 v1.6) ─────────────────────────────
export const WEIGHT_CONFIG_DEPTH = 0.6;
export const WEIGHT_CONTEXT_RICHNESS = 0.3;
export const WEIGHT_INTEGRATION_BREADTH = 0.1;

// ── Level thresholds (design §5 v1.6) ────────────────────────────────
export const LEVEL2_ABILITY_APPLIED = 8;
export const LEVEL2_ADVANCED_SKILL = 1;
export const LEVEL3_ABILITY_APPLIED = 15;
export const LEVEL3_ADVANCED_SKILL = 2;
export const LEVEL3_ENGINEERING_RATE = 0.15;
export const LEVEL3_SPECS_FILES = 10;
export const LEVEL4_ABILITY_APPLIED = 25;
export const LEVEL4_ENGINEERING_RATE = 0.4;
export const LEVEL4_SPECS_FILES = 20;

export type Level = "L0" | "L1" | "L2" | "L3" | "L4";

const SKILL_KEYS = [
  "skill_count",
  "skill_line_count",
  "advanced_skill_count",
  "skill_engineering_rate",
  "skill_resource_count",
] as const;

const AGENT_KEYS = ["agent_count", "agent_line_count"] as const;
const COMMAND_KEYS = ["command_count", "command_line_count"] as const;
const MCP_KEYS = ["mcp_count"] as const;
const INSTRUCTION_KEYS = ["ai_instruction_files", "instruction_max_line_count"] as const;
const SPECS_KEYS = ["specs_file_count", "specs_line_count"] as const;
const INTEGRATION_KEYS = ["subproject_coverage"] as const;

function mean(values: readonly number[]): number {
  if (values.length === 0) return 0;
  let total = 0;
  for (const v of values) total += v;
  return total / values.length;
}

export function normalize(metrics: MaturityRawMetrics): Record<string, number> {
  const engineeringRate = skillEngineeringRate(metrics);
  return {
    skill_count: sat(metrics.skillCount, CAP_SKILL_COUNT),
    skill_line_count: sat(metrics.skillLineCount, CAP_SKILL_LINES),
    advanced_skill_count: sat(metrics.advancedSkillCount, CAP_ADVANCED_SKILL_COUNT),
    skill_engineering_rate: scoreEngineeringRate(engineeringRate),
    skill_resource_count: sat(metrics.skillResourceCount, CAP_SKILL_RESOURCE_COUNT),
    agent_count: sat(metrics.agentCount, CAP_AGENT_COUNT),
    agent_line_count: sat(metrics.agentLineCount, CAP_AGENT_LINES),
    command_count: sat(metrics.commandCount, CAP_COMMAND_COUNT),
    command_line_count: sat(metrics.commandLineCount, CAP_COMMAND_LINES),
    mcp_count: sat(metrics.mcpCount, CAP_MCP_COUNT),
    ai_instruction_files: sat(metrics.aiInstructionFiles, CAP_INSTRUCTION_FILES),
    instruction_max_line_count: scoreInstructionLines(metrics.instructionMaxLineCount),
    specs_file_count: sat(metrics.specsFileCount, CAP_SPECS_FILES),
    specs_line_count: sat(metrics.specsLineCount, CAP_SPECS_LINES),
    subproject_coverage: sat(metrics.subprojectCoverage, CAP_SUBPROJECT_COVERAGE),
  };
}

function dimensionScores(normalized: Record<string, number>): DimensionScores {
  const skill = mean(SKILL_KEYS.map((k) => normalized[k] ?? 0));
  const agent = mean(AGENT_KEYS.map((k) => normalized[k] ?? 0));
  const command = mean(COMMAND_KEYS.map((k) => normalized[k] ?? 0));
  const mcp = mean(MCP_KEYS.map((k) => normalized[k] ?? 0));
  const depth = (skill + agent + command + mcp) / 4;

  const context = mean([...INSTRUCTION_KEYS, ...SPECS_KEYS].map((k) => normalized[k] ?? 0));
  const integration = mean(INTEGRATION_KEYS.map((k) => normalized[k] ?? 0));
  return {
    configurationDepth: depth,
    contextRichness: context,
    integrationBreadth: integration,
  };
}

export interface ScoreAmiResult {
  ami: number;
  dimensions: DimensionScores;
  normalizedMetrics: Record<string, number>;
}

export function scoreAmi(metrics: MaturityRawMetrics): ScoreAmiResult {
  const normalizedMetrics = normalize(metrics);
  const dimensions = dimensionScores(normalizedMetrics);
  const ami =
    dimensions.configurationDepth * WEIGHT_CONFIG_DEPTH +
    dimensions.contextRichness * WEIGHT_CONTEXT_RICHNESS +
    dimensions.integrationBreadth * WEIGHT_INTEGRATION_BREADTH;
  return { ami: round2(ami), dimensions, normalizedMetrics };
}

export function determineLevel(metrics: MaturityRawMetrics): Level {
  if (metrics.aiInstructionFiles < 1) return "L0";

  const ability = abilityAppliedCount(metrics);
  const rate = skillEngineeringRate(metrics);
  const specsFiles = metrics.specsFileCount;

  if (
    ability >= LEVEL4_ABILITY_APPLIED &&
    rate >= LEVEL4_ENGINEERING_RATE &&
    specsFiles >= LEVEL4_SPECS_FILES
  ) {
    return "L4";
  }

  if (
    ability >= LEVEL3_ABILITY_APPLIED &&
    metrics.advancedSkillCount >= LEVEL3_ADVANCED_SKILL &&
    rate >= LEVEL3_ENGINEERING_RATE &&
    specsFiles >= LEVEL3_SPECS_FILES
  ) {
    return "L3";
  }

  if (ability >= LEVEL2_ABILITY_APPLIED && metrics.advancedSkillCount >= LEVEL2_ADVANCED_SKILL) {
    return "L2";
  }

  return "L1";
}

export function score(metrics: MaturityRawMetrics): MaturityScore {
  const { ami, dimensions, normalizedMetrics } = scoreAmi(metrics);
  return {
    level: determineLevel(metrics),
    ami,
    dimensions,
    normalizedMetrics,
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
