import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  evaluateRepositoryProfile,
  PROFILE_TRAIT_IDS,
  SPECIALIZED_PRIMARY_PROFILE_IDS,
  type ProfileLabelId,
} from "../src/metrics/profile.ts";
import { scoreAmi } from "../src/metrics/score.ts";
import { emptyRawMetrics, type MaturityRawMetrics } from "../src/metrics/types.ts";

interface CorpusRecord {
  id: string;
  rawMetrics: Partial<MaturityRawMetrics>;
}

interface CorpusManifest {
  schemaVersion: number;
  kind: string;
  records: CorpusRecord[];
}

const TIE_ORDER: Record<ProfileLabelId, number> = {
  "ai-operating-system": 1,
  "skill-workshop": 2,
  "agent-troupe": 3,
  "command-center": 4,
  "knowledge-library": 5,
  "tool-connected": 6,
  "cross-project": 7,
  unstarted: 99,
  "early-collaboration": 99,
  "engineered-skills": 99,
  "multi-agent": 99,
  "structured-context": 99,
};

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function increment(counts: Record<string, number>, id: string): void {
  counts[id] = (counts[id] ?? 0) + 1;
}

function rateMap(
  ids: readonly string[],
  counts: Record<string, number>,
  total: number,
): Record<string, { count: number; rate: number }> {
  return Object.fromEntries(
    ids.map((id) => {
      const count = counts[id] ?? 0;
      return [id, { count, rate: round2((count / total) * 100) }];
    }),
  );
}

function counterfactualWinner(
  candidates: Array<{ id: ProfileLabelId; strength: number }>,
): ProfileLabelId {
  return [...candidates].sort(
    (left, right) => right.strength - left.strength || TIE_ORDER[left.id] - TIE_ORDER[right.id],
  )[0].id;
}

async function main(): Promise<void> {
  const manifestRef =
    process.argv[2] ?? "tests/fixtures/profile-corpus/repository-profile-corpus.manifest.json";
  const manifestPath = resolve(manifestRef);
  const manifest = JSON.parse(await readFile(manifestPath, "utf8")) as CorpusManifest;
  const primaryEligibility: Record<string, number> = {};
  const primaryWinners: Record<string, number> = {};
  const traitCarriers: Record<string, number> = {};
  const coverageDistribution: Record<string, number> = {};
  const directWinners: Record<string, number> = {};
  const actualForDirectEligible: Record<string, Record<string, number>> = {
    "tool-connected": {},
    "cross-project": {},
  };
  let aiOperatingSystemZeroIntegrationFloor = 0;

  for (const record of manifest.records) {
    const raw = { ...emptyRawMetrics(), ...record.rawMetrics };
    const score = scoreAmi(raw);
    const profile = evaluateRepositoryProfile(raw, score.normalizedMetrics, {
      configuration_depth: score.dimensions.configurationDepth,
      context_richness: score.dimensions.contextRichness,
      integration_breadth: score.dimensions.integrationBreadth,
    });
    increment(primaryWinners, profile.primary.id);
    increment(coverageDistribution, String(raw.subprojectCoverage));
    for (const candidate of profile.candidates) {
      increment(primaryEligibility, candidate.id);
      if (candidate.id === "ai-operating-system" && candidate.strength === 0 && candidate.components.some((component) => component.id === "integration_breadth" && component.headroom === 0)) {
        aiOperatingSystemZeroIntegrationFloor += 1;
      }
    }
    for (const item of [profile.supportingTrait, ...profile.structuralTraits]) {
      if (item) increment(traitCarriers, item.id);
    }
    for (const direct of [
      { id: "tool-connected" as const, eligible: raw.mcpCount >= 2, strength: round2(score.normalizedMetrics.mcp_count ?? 0) },
      { id: "cross-project" as const, eligible: raw.subprojectCoverage >= 3, strength: round2(score.normalizedMetrics.subproject_coverage ?? 0) },
    ]) {
      if (!direct.eligible) continue;
      const hypotheticalWinner = counterfactualWinner([
        ...profile.candidates.map((candidate) => ({ id: candidate.id, strength: candidate.strength })),
        { id: direct.id, strength: direct.strength },
      ]);
      if (hypotheticalWinner === direct.id) increment(directWinners, direct.id);
      increment(actualForDirectEligible[direct.id], profile.primary.id);
    }
  }

  const total = manifest.records.length;
  const result = {
    schemaVersion: 1,
    corpus: { kind: manifest.kind, total, manifest: manifestRef },
    rates: {
      primaryEligibility: rateMap(SPECIALIZED_PRIMARY_PROFILE_IDS, primaryEligibility, total),
      primaryWinners: rateMap(
        ["unstarted", "early-collaboration", ...SPECIALIZED_PRIMARY_PROFILE_IDS],
        primaryWinners,
        total,
      ),
      traitCarriers: rateMap(PROFILE_TRAIT_IDS, traitCarriers, total),
      aiOperatingSystem: {
        eligibility: rateMap(["ai-operating-system"], primaryEligibility, total)["ai-operating-system"],
        winner: rateMap(["ai-operating-system"], primaryWinners, total)["ai-operating-system"],
        subprojectCoverageDistribution: coverageDistribution,
        zeroStrengthAtIntegrationFloor: aiOperatingSystemZeroIntegrationFloor,
      },
    },
    counterfactual: {
      definition: {
        eligibility: { "tool-connected": "mcpCount >= 2", "cross-project": "subprojectCoverage >= 3" },
        directStrength:
          "identity(existing normalized mcp_count or subproject_coverage), then round2",
        candidates: "eligible specialized primaries plus the corresponding hypothetical single-signal label",
        tieOrder: ["ai-operating-system", "skill-workshop", "agent-troupe", "command-center", "knowledge-library", "tool-connected", "cross-project"],
      },
      directWinnerCount: directWinners,
      actualPrimaryDistributionForEligible: actualForDirectEligible,
    },
  };
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

void main();
