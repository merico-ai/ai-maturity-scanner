export interface MaturityRawMetrics {
  // ── Configuration depth: Skill class (5 metrics) ───────────────
  skillCount: number;
  skillLineCount: number;
  advancedSkillCount: number;
  skillResourceCount: number;
  // ── Configuration depth: Agent class (2 metrics) ───────────────
  agentCount: number;
  agentLineCount: number;
  // ── Configuration depth: Command class (2 metrics) ─────────────
  commandCount: number;
  commandLineCount: number;
  // ── Configuration depth: MCP class (1 metric) ──────────────────
  mcpCount: number;
  // ── Context richness: instruction (2 metrics) ──────────────────
  aiInstructionFiles: number;
  instructionMaxLineCount: number;
  // ── Context richness: specs (2 metrics) ────────────────────────
  specsFileCount: number;
  specsLineCount: number;
  // ── Integration breadth (1 metric) ─────────────────────────────
  subprojectCoverage: number;
  // ── Helper (not in AMI) ────────────────────────────────────────
  agentTypeDistinct: number;
}

export interface DimensionScores {
  configurationDepth: number;
  contextRichness: number;
  integrationBreadth: number;
}

export interface MaturityScore {
  level: "L0" | "L1" | "L2" | "L3" | "L4";
  ami: number;
  dimensions: DimensionScores;
  normalizedMetrics: Record<string, number>;
}

export function skillEngineeringRate(metrics: MaturityRawMetrics): number {
  if (metrics.skillCount <= 0) return 0;
  return metrics.advancedSkillCount / metrics.skillCount;
}

/**
 * Total applied ability fixtures (design §3.1, v1.6).
 * `skill + skill_resource + agent + command + mcp`. Config and hook file types
 * are intentionally excluded — they describe infrastructure, not applied
 * agent capability.
 */
export function abilityAppliedCount(metrics: MaturityRawMetrics): number {
  return (
    metrics.skillCount +
    metrics.skillResourceCount +
    metrics.agentCount +
    metrics.commandCount +
    metrics.mcpCount
  );
}

export function emptyRawMetrics(): MaturityRawMetrics {
  return {
    skillCount: 0,
    skillLineCount: 0,
    advancedSkillCount: 0,
    skillResourceCount: 0,
    agentCount: 0,
    agentLineCount: 0,
    commandCount: 0,
    commandLineCount: 0,
    mcpCount: 0,
    aiInstructionFiles: 0,
    instructionMaxLineCount: 0,
    specsFileCount: 0,
    specsLineCount: 0,
    subprojectCoverage: 0,
    agentTypeDistinct: 0,
  };
}
