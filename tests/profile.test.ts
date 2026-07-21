import { describe, expect, it } from "vitest";
import { evaluateRepositoryProfile, profileHeadroom, tierOf } from "../src/metrics/profile.ts";
import { scoreAmi } from "../src/metrics/score.ts";
import { emptyRawMetrics } from "../src/metrics/types.ts";

function evaluate(raw = emptyRawMetrics()) {
  const score = scoreAmi(raw);
  return evaluateRepositoryProfile(raw, score.normalizedMetrics, {
    configuration_depth: score.dimensions.configurationDepth,
    context_richness: score.dimensions.contextRichness,
    integration_breadth: score.dimensions.integrationBreadth,
  });
}

describe("repository profiles", () => {
  it("uses neutral unstarted state, returns three ranked traits, and skips candidates", () => {
    const profile = evaluate({
      ...emptyRawMetrics(),
      skillCount: 30,
      mcpCount: 3,
      subprojectCoverage: 3,
    });
    expect(profile.primary.id).toBe("unstarted");
    expect(profile.candidates).toEqual([]);
    expect(profile.traits).toHaveLength(3);
    expect(profile.traits.map((trait) => trait.id)).toEqual([
      "tool-connected",
      "cross-project",
      "structured-context",
    ]);
    expect(profile.traits[0]).toMatchObject({ id: "tool-connected", degree: 100, tier: "high" });
    expect(profile.traits[1]).toMatchObject({ id: "cross-project", degree: 60, tier: "medium" });
  });

  it("maps degrees to tiers on the uniform 40/70 scale and computes trait degrees", () => {
    expect(tierOf(0)).toBe("low");
    expect(tierOf(39.99)).toBe("low");
    expect(tierOf(40)).toBe("medium");
    expect(tierOf(69.99)).toBe("medium");
    expect(tierOf(70)).toBe("high");
    expect(tierOf(100)).toBe("high");
    const profile = evaluate({
      ...emptyRawMetrics(),
      mcpCount: 3,
      subprojectCoverage: 3,
    });
    const byId = Object.fromEntries(profile.traits.map((trait) => [trait.id, trait]));
    expect(byId["tool-connected"]).toMatchObject({ degree: 100, tier: "high" });
    expect(byId["cross-project"]).toMatchObject({ degree: 60, tier: "medium" });
  });

  it("uses early-collaboration when no specialized primary is eligible", () => {
    expect(evaluate({ ...emptyRawMetrics(), aiInstructionFiles: 1 }).primary.id).toBe(
      "early-collaboration",
    );
  });

  it("selects each specialized primary when its evidence is strongest", () => {
    expect(
      evaluate({
        ...emptyRawMetrics(),
        aiInstructionFiles: 1,
        skillCount: 30,
        skillLineCount: 15000,
        advancedSkillCount: 5,
        skillResourceCount: 30,
      }).primary.id,
    ).toBe("skill-workshop");
    expect(
      evaluate({
        ...emptyRawMetrics(),
        aiInstructionFiles: 1,
        agentCount: 3,
        agentLineCount: 2000,
        agentTypeDistinct: 3,
      }).primary.id,
    ).toBe("agent-troupe");
    expect(
      evaluate({
        ...emptyRawMetrics(),
        aiInstructionFiles: 1,
        commandCount: 3,
        commandLineCount: 2000,
      }).primary.id,
    ).toBe("command-center");
    expect(
      evaluate({
        ...emptyRawMetrics(),
        aiInstructionFiles: 1,
        instructionMaxLineCount: 120,
        specsFileCount: 25,
        specsLineCount: 5000,
      }).primary.id,
    ).toBe("knowledge-library");
  });

  it("does not select knowledge-library from short instructions plus many docs alone", () => {
    const profile = evaluate({
      ...emptyRawMetrics(),
      aiInstructionFiles: 1,
      instructionMaxLineCount: 9,
      specsFileCount: 23,
      specsLineCount: 5000,
    });

    expect(profile.primary.id).toBe("early-collaboration");
    expect(profile.candidates.map((candidate) => candidate.id)).not.toContain("knowledge-library");
  });

  it("can select ai-operating-system without a specialized class candidate", () => {
    const profile = evaluate({
      ...emptyRawMetrics(),
      aiInstructionFiles: 1,
      instructionMaxLineCount: 50,
      specsFileCount: 9,
      specsLineCount: 5000,
      subprojectCoverage: 5,
      skillCount: 30,
      skillLineCount: 15000,
      agentCount: 10,
      agentLineCount: 2000,
      agentTypeDistinct: 1,
      commandCount: 1,
      commandLineCount: 600,
      mcpCount: 3,
    });
    expect(profile.primary.id).toBe("ai-operating-system");
    expect(
      profile.candidates.find((candidate) => candidate.id === "ai-operating-system"),
    ).toMatchObject({
      selected: true,
      components: expect.arrayContaining([
        expect.objectContaining({ id: "integration_breadth", floor: 60 }),
      ]),
    });
  });

  it("rounds strengths before deterministic tie-breaking", () => {
    const raw = {
      ...emptyRawMetrics(),
      aiInstructionFiles: 1,
      skillCount: 10,
      advancedSkillCount: 2,
      commandCount: 3,
    };
    const profile = evaluateRepositoryProfile(
      raw,
      {
        skill_count: 75,
        skill_line_count: 75,
        advanced_skill_count: 75,
        skill_engineering_rate: 75,
        skill_resource_count: 75,
        command_count: 70,
        command_line_count: 70,
      },
      { configuration_depth: 0, context_richness: 0, integration_breadth: 0 },
    );
    expect(profile.primary.id).toBe("skill-workshop");
    expect(profile.candidates.map((candidate) => candidate.strength)).toEqual([50, 50]);
    expect(profile.candidates.filter((candidate) => candidate.selected)).toHaveLength(1);
  });

  it("returns the three highest-degree traits and suppresses the trait matching the primary", () => {
    const profile = evaluate({
      ...emptyRawMetrics(),
      aiInstructionFiles: 1,
      instructionMaxLineCount: 50,
      specsFileCount: 10,
      specsLineCount: 5000,
      advancedSkillCount: 2,
      skillCount: 10,
      agentCount: 3,
      agentTypeDistinct: 3,
      mcpCount: 2,
      subprojectCoverage: 3,
    });
    expect(profile.primary.id).toBe("agent-troupe");
    expect(profile.traits).toHaveLength(3);
    expect(profile.traits.map((trait) => trait.id)).toEqual([
      "tool-connected",
      "structured-context",
      "cross-project",
    ]);
    expect(profile.traits.map((trait) => trait.id)).not.toContain("multi-agent");
    expect(profile.traits[0]).toMatchObject({
      id: "tool-connected",
      degree: 66.67,
      tier: "medium",
    });

    const skillProfile = evaluate({
      ...emptyRawMetrics(),
      aiInstructionFiles: 1,
      skillCount: 30,
      skillLineCount: 15000,
      advancedSkillCount: 5,
      skillResourceCount: 30,
    });
    expect(skillProfile.primary.id).toBe("skill-workshop");
    expect(skillProfile.traits.map((trait) => trait.id)).not.toContain("engineered-skills");
  });

  it("keeps the specified headroom scale and rounded candidate components", () => {
    expect(profileHeadroom(50, 50)).toBe(0);
    expect(profileHeadroom(100, 50)).toBe(100);
    expect(profileHeadroom(0, 50)).toBe(0);
    const profile = evaluate({
      ...emptyRawMetrics(),
      aiInstructionFiles: 1,
      commandCount: 3,
      commandLineCount: 1800,
    });
    expect(profile.candidates[0].components[0].headroom).toBe(33.33);
  });
});
