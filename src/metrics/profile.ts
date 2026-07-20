import type { MaturityRawMetrics } from "./types.ts";

export const PROFILE_RULE_VERSION = "v2" as const;

const KNOWLEDGE_LIBRARY_MIN_SPECS_FILES = 20;
const KNOWLEDGE_LIBRARY_MIN_CONTEXT_RICHNESS = 65;
const KNOWLEDGE_LIBRARY_CONTEXT_HEADROOM_FLOOR = 60;
const KNOWLEDGE_LIBRARY_MIN_INSTRUCTION_LINES = 50;
const KNOWLEDGE_LIBRARY_INSTRUCTION_SCORE_FLOOR = 60;
const KNOWLEDGE_LIBRARY_MIN_SPEC_LIBRARY_SCORE = 50;

export const SPECIALIZED_PRIMARY_PROFILE_IDS = [
  "ai-operating-system",
  "skill-workshop",
  "agent-troupe",
  "command-center",
  "knowledge-library",
] as const;

export type SpecializedPrimaryProfileId = (typeof SPECIALIZED_PRIMARY_PROFILE_IDS)[number];
export type PrimaryProfileId = SpecializedPrimaryProfileId | "unstarted" | "early-collaboration";

export const PROFILE_TRAIT_IDS = [
  "engineered-skills",
  "multi-agent",
  "tool-connected",
  "structured-context",
  "cross-project",
] as const;

export type ProfileTraitId = (typeof PROFILE_TRAIT_IDS)[number];
export type ProfileLabelId = PrimaryProfileId | ProfileTraitId;
export type ProfileTraitKind = "supporting" | "structural";

export interface ProfileDimensions {
  configuration_depth: number;
  context_richness: number;
  integration_breadth: number;
}

export interface ProfileEvidence {
  ruleId: string;
  facts: Record<string, number>;
}

export interface ProfileStrengthComponent {
  id: string;
  score: number;
  floor: number;
  headroom: number;
}

export interface ProfileCandidate {
  id: SpecializedPrimaryProfileId;
  strength: number;
  components: ProfileStrengthComponent[];
  evidence: ProfileEvidence;
  selected: boolean;
}

export interface ProfilePrimary {
  id: PrimaryProfileId;
  strength: number;
  evidence: ProfileEvidence;
}

export interface ProfileTrait {
  id: ProfileTraitId;
  kind: ProfileTraitKind;
  evidence: ProfileEvidence;
}

export interface RepositoryProfileEvaluation {
  primary: ProfilePrimary;
  supportingTrait?: ProfileTrait;
  structuralTraits: ProfileTrait[];
  candidates: ProfileCandidate[];
}

const PRIMARY_TIE_ORDER: Record<SpecializedPrimaryProfileId, number> = {
  "ai-operating-system": 1,
  "skill-workshop": 2,
  "agent-troupe": 3,
  "command-center": 4,
  "knowledge-library": 5,
};

function mean(values: readonly number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((total, value) => total + value, 0) / values.length;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function metric(normalizedMetrics: Record<string, number>, id: string): number {
  return normalizedMetrics[id] ?? 0;
}

/** Progress above an eligibility floor, constrained to the profile scale. */
export function profileHeadroom(score: number, floor: number): number {
  return Math.max(0, Math.min(100, ((score - floor) / (100 - floor)) * 100));
}

function component(id: string, score: number, floor: number): ProfileStrengthComponent {
  return { id, score: round2(score), floor, headroom: round2(profileHeadroom(score, floor)) };
}

function candidate(
  id: SpecializedPrimaryProfileId,
  components: ProfileStrengthComponent[],
  strength: number,
  evidence: ProfileEvidence,
): ProfileCandidate {
  return { id, strength: round2(strength), components, evidence, selected: false };
}

function trait(
  id: ProfileTraitId,
  kind: ProfileTraitKind,
  ruleId: string,
  facts: Record<string, number>,
): ProfileTrait {
  return { id, kind, evidence: { ruleId, facts } };
}

/**
 * Derive profile labels from an already-calculated report. This intentionally
 * reads only the established v1 metrics and dimensions; it never participates
 * in AMI or maturity-level scoring.
 */
export function evaluateRepositoryProfile(
  rawMetrics: MaturityRawMetrics,
  normalizedMetrics: Record<string, number>,
  dimensions: ProfileDimensions,
): RepositoryProfileEvaluation {
  const hasAiInstructions = rawMetrics.aiInstructionFiles > 0;
  const skillScore = mean([
    metric(normalizedMetrics, "skill_count"),
    metric(normalizedMetrics, "skill_line_count"),
    metric(normalizedMetrics, "advanced_skill_count"),
    metric(normalizedMetrics, "skill_engineering_rate"),
    metric(normalizedMetrics, "skill_resource_count"),
  ]);
  const agentScore = mean([
    metric(normalizedMetrics, "agent_count"),
    metric(normalizedMetrics, "agent_line_count"),
  ]);
  const commandScore = mean([
    metric(normalizedMetrics, "command_count"),
    metric(normalizedMetrics, "command_line_count"),
  ]);
  // Kept as an explicit derived signal even though MCP remains trait-only.
  const mcpScore = metric(normalizedMetrics, "mcp_count");
  const agentRoleScore = Math.min(100, (rawMetrics.agentTypeDistinct / 5) * 100);
  const specLibraryScore = mean([
    metric(normalizedMetrics, "specs_file_count"),
    metric(normalizedMetrics, "specs_line_count"),
  ]);
  const candidates: ProfileCandidate[] = [];

  const activeClasses = [
    rawMetrics.skillCount,
    rawMetrics.agentCount,
    rawMetrics.commandCount,
    rawMetrics.mcpCount,
  ].filter((count) => count > 0).length;
  if (
    hasAiInstructions &&
    dimensions.configuration_depth >= 60 &&
    dimensions.context_richness >= 60 &&
    dimensions.integration_breadth >= 60 &&
    activeClasses >= 3
  ) {
    const components = [
      component("configuration_depth", dimensions.configuration_depth, 60),
      component("context_richness", dimensions.context_richness, 60),
      component("integration_breadth", dimensions.integration_breadth, 60),
    ];
    candidates.push(
      candidate(
        "ai-operating-system",
        components,
        Math.min(...components.map((item) => item.headroom)),
        {
          ruleId: "DR-001.primary.ai-operating-system",
          facts: {
            configuration_depth: dimensions.configuration_depth,
            context_richness: dimensions.context_richness,
            integration_breadth: dimensions.integration_breadth,
            active_classes: activeClasses,
          },
        },
      ),
    );
  }
  const engineeringRate =
    rawMetrics.skillCount > 0 ? rawMetrics.advancedSkillCount / rawMetrics.skillCount : 0;
  if (hasAiInstructions && skillScore >= 50 && engineeringRate >= 0.15) {
    const components = [component("skill_score", skillScore, 50)];
    candidates.push(
      candidate("skill-workshop", components, components[0].headroom, {
        ruleId: "DR-001.primary.skill-workshop",
        facts: { skill_score: skillScore, skill_engineering_rate: engineeringRate },
      }),
    );
  }
  if (hasAiInstructions && rawMetrics.agentCount >= 3 && rawMetrics.agentTypeDistinct >= 3) {
    const components = [
      component("agent_score", agentScore, 15),
      component("agent_role_score", agentRoleScore, 60),
    ];
    candidates.push(
      candidate("agent-troupe", components, mean(components.map((item) => item.headroom)), {
        ruleId: "DR-001.primary.agent-troupe",
        facts: {
          agent_count: rawMetrics.agentCount,
          agent_type_distinct: rawMetrics.agentTypeDistinct,
          agent_score: agentScore,
          agent_role_score: agentRoleScore,
        },
      }),
    );
  }
  if (hasAiInstructions && commandScore >= 40 && rawMetrics.commandCount >= 3) {
    const components = [component("command_score", commandScore, 40)];
    candidates.push(
      candidate("command-center", components, components[0].headroom, {
        ruleId: "DR-001.primary.command-center",
        facts: { command_score: commandScore, command_count: rawMetrics.commandCount },
      }),
    );
  }
  if (
    hasAiInstructions &&
    rawMetrics.specsFileCount >= KNOWLEDGE_LIBRARY_MIN_SPECS_FILES &&
    dimensions.context_richness >= KNOWLEDGE_LIBRARY_MIN_CONTEXT_RICHNESS &&
    rawMetrics.instructionMaxLineCount >= KNOWLEDGE_LIBRARY_MIN_INSTRUCTION_LINES &&
    specLibraryScore >= KNOWLEDGE_LIBRARY_MIN_SPEC_LIBRARY_SCORE
  ) {
    const components = [
      component(
        "context_richness",
        dimensions.context_richness,
        KNOWLEDGE_LIBRARY_CONTEXT_HEADROOM_FLOOR,
      ),
      component(
        "instruction_max_line_score",
        metric(normalizedMetrics, "instruction_max_line_count"),
        KNOWLEDGE_LIBRARY_INSTRUCTION_SCORE_FLOOR,
      ),
      component("spec_library_score", specLibraryScore, KNOWLEDGE_LIBRARY_MIN_SPEC_LIBRARY_SCORE),
    ];
    candidates.push(
      candidate("knowledge-library", components, mean(components.map((item) => item.headroom)), {
        ruleId: "DR-001.primary.knowledge-library",
        facts: {
          specs_file_count: rawMetrics.specsFileCount,
          context_richness: dimensions.context_richness,
          instruction_max_line_count: rawMetrics.instructionMaxLineCount,
          spec_library_score: specLibraryScore,
        },
      }),
    );
  }

  const ranked = [...candidates].sort(
    (left, right) =>
      right.strength - left.strength || PRIMARY_TIE_ORDER[left.id] - PRIMARY_TIE_ORDER[right.id],
  );
  const winner = ranked[0];
  if (winner) {
    const selected = candidates.find((item) => item.id === winner.id);
    if (selected) selected.selected = true;
  }

  const eligibleTraits: ProfileTrait[] = [];
  if (rawMetrics.advancedSkillCount >= 2 && engineeringRate >= 0.15) {
    eligibleTraits.push(
      trait("engineered-skills", "supporting", "DR-001.trait.engineered-skills", {
        advanced_skill_count: rawMetrics.advancedSkillCount,
        skill_engineering_rate: engineeringRate,
      }),
    );
  }
  if (rawMetrics.agentCount >= 3 && rawMetrics.agentTypeDistinct >= 3) {
    eligibleTraits.push(
      trait("multi-agent", "supporting", "DR-001.trait.multi-agent", {
        agent_count: rawMetrics.agentCount,
        agent_type_distinct: rawMetrics.agentTypeDistinct,
      }),
    );
  }
  if (rawMetrics.mcpCount >= 2) {
    eligibleTraits.push(
      trait("tool-connected", "structural", "DR-001.trait.tool-connected", {
        mcp_count: rawMetrics.mcpCount,
        mcp_score: mcpScore,
      }),
    );
  }
  if (
    rawMetrics.instructionMaxLineCount >= 50 &&
    rawMetrics.instructionMaxLineCount <= 400 &&
    rawMetrics.specsFileCount >= 10
  ) {
    eligibleTraits.push(
      trait("structured-context", "supporting", "DR-001.trait.structured-context", {
        instruction_max_line_count: rawMetrics.instructionMaxLineCount,
        specs_file_count: rawMetrics.specsFileCount,
      }),
    );
  }
  if (rawMetrics.subprojectCoverage >= 3) {
    eligibleTraits.push(
      trait("cross-project", "structural", "DR-001.trait.cross-project", {
        subproject_coverage: rawMetrics.subprojectCoverage,
      }),
    );
  }

  const primaryId: PrimaryProfileId = hasAiInstructions
    ? (winner?.id ?? "early-collaboration")
    : "unstarted";
  const primary: ProfilePrimary =
    winner && primaryId === winner.id
      ? { id: winner.id, strength: winner.strength, evidence: winner.evidence }
      : {
          id: primaryId,
          strength: 0,
          evidence: {
            ruleId: `DR-001.primary.${primaryId}`,
            facts: { ai_instruction_files: rawMetrics.aiInstructionFiles },
          },
        };
  const suppressed = new Set<ProfileTraitId>();
  if (primary.id === "skill-workshop") suppressed.add("engineered-skills");
  if (primary.id === "agent-troupe") suppressed.add("multi-agent");
  if (primary.id === "knowledge-library") suppressed.add("structured-context");
  const traits = eligibleTraits.filter((item) => !suppressed.has(item.id));

  return {
    primary,
    supportingTrait: traits.find((item) => item.kind === "supporting"),
    structuralTraits: traits.filter((item) => item.kind === "structural"),
    candidates,
  };
}
