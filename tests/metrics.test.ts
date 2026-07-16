import { describe, expect, it } from "vitest";
import { aggregateRawMetrics } from "../src/metrics/aggregate.ts";
import {
  CAP_ENGINEERING_RATE_PCT,
  CAP_SKILL_COUNT,
  lerp,
  sat,
  scoreEngineeringRate,
  scoreInstructionLines,
} from "../src/metrics/normalize.ts";
import {
  LEVEL2_ABILITY_APPLIED,
  LEVEL2_ADVANCED_SKILL,
  LEVEL3_ABILITY_APPLIED,
  LEVEL3_ADVANCED_SKILL,
  LEVEL3_ENGINEERING_RATE,
  LEVEL3_SPECS_FILES,
  LEVEL4_ABILITY_APPLIED,
  LEVEL4_ENGINEERING_RATE,
  LEVEL4_SPECS_FILES,
  determineLevel,
  score,
  scoreAmi,
} from "../src/metrics/score.ts";
import {
  abilityAppliedCount,
  emptyRawMetrics,
  skillEngineeringRate,
} from "../src/metrics/types.ts";
import type { FileWithTags } from "../src/types.ts";

describe("sat", () => {
  it("returns 0 for raw ≤ 0", () => {
    expect(sat(0, 10)).toBe(0);
    expect(sat(-1, 10)).toBe(0);
  });
  it("returns 0 for cap ≤ 0", () => {
    expect(sat(5, 0)).toBe(0);
    expect(sat(5, -1)).toBe(0);
  });
  it("returns 100 when raw ≥ cap", () => {
    expect(sat(10, 10)).toBe(100);
    expect(sat(11, 10)).toBe(100);
  });
  it("returns raw/cap*100 in between", () => {
    expect(sat(5, 10)).toBe(50);
    expect(sat(7.5, 10)).toBe(75);
  });
});

describe("lerp", () => {
  it("returns y0 when x1 === x0", () => {
    expect(lerp(5, 10, 5, 20, 7)).toBe(10);
  });
  it("interpolates linearly", () => {
    expect(lerp(0, 0, 10, 100, 5)).toBe(50);
    expect(lerp(0, 10, 20, 30, 10)).toBe(20);
  });
});

describe("scoreInstructionLines (piecewise)", () => {
  it("returns floor 10 at raw = 0", () => {
    expect(scoreInstructionLines(0)).toBe(10);
  });
  it("returns floor 10 for negative raw", () => {
    expect(scoreInstructionLines(-5)).toBe(10);
  });
  it("hits 30 at raw = 20 (end of low ramp)", () => {
    expect(scoreInstructionLines(20)).toBe(30);
  });
  it("hits 100 at raw = 50 (start of sweet spot)", () => {
    expect(scoreInstructionLines(50)).toBe(100);
  });
  it("stays 100 at raw = 400 (end of sweet spot)", () => {
    expect(scoreInstructionLines(400)).toBe(100);
  });
  it("hits 30 at raw = 1000 (end of high ramp)", () => {
    expect(scoreInstructionLines(1000)).toBe(30);
  });
  it("returns 10 for raw > 1000 (info overload)", () => {
    expect(scoreInstructionLines(1001)).toBe(10);
    expect(scoreInstructionLines(5000)).toBe(10);
  });
  it("interpolates within the low ramp (10→30 across 0→20)", () => {
    expect(scoreInstructionLines(10)).toBeCloseTo(20, 5);
  });
  it("interpolates within the mid ramp (30→100 across 20→50)", () => {
    expect(scoreInstructionLines(35)).toBeCloseTo(65, 5);
  });
  it("interpolates within the high ramp (100→30 across 400→1000)", () => {
    expect(scoreInstructionLines(700)).toBeCloseTo(65, 5);
  });
});

describe("scoreEngineeringRate", () => {
  it("returns 0 for rate ≤ 0", () => {
    expect(scoreEngineeringRate(0)).toBe(0);
    expect(scoreEngineeringRate(-0.1)).toBe(0);
  });
  it("returns 100 when rate ≥ cap", () => {
    expect(scoreEngineeringRate(0.5)).toBe(100);
    expect(scoreEngineeringRate(1)).toBe(100);
  });
  it("treats inputs > 1 as already-percent", () => {
    // 25 (%) → 25/50*100 = 50
    expect(scoreEngineeringRate(25)).toBe(50);
  });
  it("saturates linearly", () => {
    expect(scoreEngineeringRate(0.25)).toBe(50);
  });
  it("matches CAP_ENGINEERING_RATE_PCT constant", () => {
    expect(CAP_ENGINEERING_RATE_PCT).toBe(50);
  });
});

describe("skillEngineeringRate + abilityAppliedCount", () => {
  it("returns 0 when skillCount ≤ 0", () => {
    expect(skillEngineeringRate({ ...emptyRawMetrics(), skillCount: 0 })).toBe(0);
  });
  it("returns advanced/count ratio", () => {
    const m = { ...emptyRawMetrics(), skillCount: 10, advancedSkillCount: 3 };
    expect(skillEngineeringRate(m)).toBeCloseTo(0.3, 5);
  });
  it("abilityAppliedCount sums skill+resource+agent+command+mcp", () => {
    const m = {
      ...emptyRawMetrics(),
      skillCount: 2,
      skillResourceCount: 3,
      agentCount: 4,
      commandCount: 1,
      mcpCount: 1,
    };
    expect(abilityAppliedCount(m)).toBe(11);
  });
});

describe("determineLevel cascade", () => {
  it("L0 when no AI instruction file", () => {
    const m = { ...emptyRawMetrics() };
    expect(determineLevel(m)).toBe("L0");
  });

  it("L1 once an instruction file exists but nothing else", () => {
    const m = { ...emptyRawMetrics(), aiInstructionFiles: 1 };
    expect(determineLevel(m)).toBe("L1");
  });

  it("L2 requires ability ≥ 8 AND advanced_skill ≥ 1", () => {
    const base = { ...emptyRawMetrics(), aiInstructionFiles: 1, advancedSkillCount: 1 };
    expect(determineLevel({ ...base, skillCount: 7 })).toBe("L1");
    const l2: typeof base = {
      ...base,
      skillCount: 4,
      skillResourceCount: 4,
    };
    expect(abilityAppliedCount(l2)).toBe(LEVEL2_ABILITY_APPLIED);
    expect(determineLevel(l2)).toBe("L2");
  });

  it("L3 requires ability ≥ 15, advanced ≥ 2, rate ≥ 0.15, specs ≥ 10", () => {
    const base = {
      ...emptyRawMetrics(),
      aiInstructionFiles: 1,
      advancedSkillCount: 2,
      specsFileCount: 10,
      skillCount: 10,
      skillResourceCount: 5,
    };
    expect(abilityAppliedCount(base)).toBe(LEVEL3_ABILITY_APPLIED);
    expect(skillEngineeringRate(base)).toBeGreaterThanOrEqual(LEVEL3_ENGINEERING_RATE);
    expect(determineLevel(base)).toBe("L3");
  });

  it("L3 fails when specs too low", () => {
    const m = {
      ...emptyRawMetrics(),
      aiInstructionFiles: 1,
      advancedSkillCount: 2,
      specsFileCount: LEVEL3_SPECS_FILES - 1,
      skillCount: 10,
      skillResourceCount: 5,
    };
    expect(determineLevel(m)).toBe("L2");
  });

  it("L4 requires ability ≥ 25, rate ≥ 0.40, specs ≥ 20", () => {
    const m = {
      ...emptyRawMetrics(),
      aiInstructionFiles: 1,
      advancedSkillCount: 12,
      skillCount: 20,
      skillResourceCount: 5,
      specsFileCount: 20,
    };
    expect(abilityAppliedCount(m)).toBe(LEVEL4_ABILITY_APPLIED);
    expect(skillEngineeringRate(m)).toBeGreaterThanOrEqual(LEVEL4_ENGINEERING_RATE);
    expect(determineLevel(m)).toBe("L4");
  });

  it("L4 fails when rate < 0.40", () => {
    const m = {
      ...emptyRawMetrics(),
      aiInstructionFiles: 1,
      advancedSkillCount: 5,
      skillCount: 20,
      skillResourceCount: 5,
      specsFileCount: 20,
    };
    expect(determineLevel(m)).toBe("L3");
  });

  it("threshold constants match v1.6 spec", () => {
    expect(LEVEL2_ABILITY_APPLIED).toBe(8);
    expect(LEVEL2_ADVANCED_SKILL).toBe(1);
    expect(LEVEL3_ABILITY_APPLIED).toBe(15);
    expect(LEVEL3_ADVANCED_SKILL).toBe(2);
    expect(LEVEL3_ENGINEERING_RATE).toBe(0.15);
    expect(LEVEL3_SPECS_FILES).toBe(10);
    expect(LEVEL4_ABILITY_APPLIED).toBe(25);
    expect(LEVEL4_ENGINEERING_RATE).toBe(0.4);
    expect(LEVEL4_SPECS_FILES).toBe(20);
  });
});

describe("scoreAmi weights", () => {
  it("empty metrics still has the instruction floor (10) baked into context_richness", () => {
    // scoreInstructionLines(0) returns the floor 10, so context_richness is
    // mean(0, 10, 0, 0) = 2.5, and AMI = 0.6*0 + 0.3*2.5 + 0.1*0 = 0.75.
    const r = scoreAmi(emptyRawMetrics());
    expect(r.dimensions.configurationDepth).toBe(0);
    expect(r.dimensions.contextRichness).toBeCloseTo(2.5, 5);
    expect(r.dimensions.integrationBreadth).toBe(0);
    expect(r.ami).toBe(0.75);
  });

  it("rounds AMI to 2 decimal places", () => {
    const m = { ...emptyRawMetrics(), aiInstructionFiles: 1, instructionMaxLineCount: 100 };
    const r = scoreAmi(m);
    // context_richness = mean of (ai_instruction_files=100, instruction_max=100, specs_file=0, specs_lines=0) = 50
    // depth = 0, integration = 0
    // ami = 0*0.6 + 50*0.3 + 0*0.1 = 15
    expect(r.ami).toBe(15);
    expect(r.dimensions.contextRichness).toBeCloseTo(50, 5);
  });

  it("caps configuration_depth at skill_count saturation", () => {
    const m = {
      ...emptyRawMetrics(),
      skillCount: CAP_SKILL_COUNT + 10, // well over cap
      advancedSkillCount: 5, // half of cap
    };
    const r = scoreAmi(m);
    expect(r.normalizedMetrics.skill_count).toBe(100);
    expect(r.normalizedMetrics.advanced_skill_count).toBe(50);
  });

  it("score() packages level + ami + dimensions together", () => {
    const m = { ...emptyRawMetrics(), aiInstructionFiles: 1 };
    const s = score(m);
    expect(s.level).toBe("L1");
    expect(s.ami).toBe(s.ami); // sanity
    expect(s.normalizedMetrics).toHaveProperty("skill_count");
    expect(s.normalizedMetrics).toHaveProperty("subproject_coverage");
  });
});

describe("aggregateRawMetrics", () => {
  function ft(path: string, lines: number, tags: FileWithTags["tags"]): FileWithTags {
    return { path, tags, size: 0, lines };
  }

  it("returns zero metrics for empty input", () => {
    const m = aggregateRawMetrics([]);
    expect(m).toEqual(emptyRawMetrics());
  });

  it("counts skill + skill_resource + advanced_skill separately", () => {
    const files: FileWithTags[] = [
      ft("skills/a/SKILL.md", 100, [
        { kind: "file_type", value: "skill" },
        { kind: "skill_level", value: "advanced_skill" },
      ]),
      ft("skills/b/SKILL.md", 50, [{ kind: "file_type", value: "skill" }]),
      ft("skills/a/scripts/x.py", 30, [{ kind: "file_type", value: "skill_resource" }]),
    ];
    const m = aggregateRawMetrics(files);
    expect(m.skillCount).toBe(2);
    expect(m.skillLineCount).toBe(150);
    expect(m.advancedSkillCount).toBe(1);
    expect(m.skillResourceCount).toBe(1);
  });

  it("tracks max instruction line count, not sum", () => {
    const files: FileWithTags[] = [
      ft("CLAUDE.md", 100, [{ kind: "file_type", value: "instruction" }]),
      ft("apps/web/CLAUDE.md", 250, [{ kind: "file_type", value: "instruction" }]),
    ];
    const m = aggregateRawMetrics(files);
    expect(m.aiInstructionFiles).toBe(2);
    expect(m.instructionMaxLineCount).toBe(250);
  });

  it("treats plain markdown without ability tag as spec", () => {
    const files: FileWithTags[] = [
      ft("docs/auth.md", 40, [{ kind: "file_extension", value: "md" }]),
      ft("specs/api.md", 60, [
        { kind: "file_type", value: "spec" },
        { kind: "file_extension", value: "md" },
      ]),
    ];
    const m = aggregateRawMetrics(files);
    expect(m.specsFileCount).toBe(2);
    expect(m.specsLineCount).toBe(100);
  });

  it("excludes markdown files that carry an ability file_type", () => {
    const files: FileWithTags[] = [
      ft("skills/x/SKILL.md", 100, [
        { kind: "file_type", value: "skill" },
        { kind: "file_extension", value: "md" },
      ]),
      ft("commands/build.md", 50, [
        { kind: "file_type", value: "command" },
        { kind: "file_extension", value: "md" },
      ]),
      ft("docs/auth.md", 40, [{ kind: "file_extension", value: "md" }]),
    ];
    const m = aggregateRawMetrics(files);
    expect(m.specsFileCount).toBe(1);
    expect(m.specsLineCount).toBe(40);
  });

  it("counts distinct agent_type values, not paths", () => {
    const files: FileWithTags[] = [
      ft("CLAUDE.md", 0, [
        { kind: "file_type", value: "instruction" },
        { kind: "agent_type", value: "claude" },
      ]),
      ft("apps/web/CLAUDE.md", 0, [
        { kind: "file_type", value: "instruction" },
        { kind: "agent_type", value: "claude" },
      ]),
      ft("GEMINI.md", 0, [
        { kind: "file_type", value: "instruction" },
        { kind: "agent_type", value: "gemini" },
      ]),
    ];
    const m = aggregateRawMetrics(files);
    expect(m.agentTypeDistinct).toBe(2);
  });

  it("subproject_coverage counts distinct apps/<name>/ prefixes on instruction files", () => {
    const files: FileWithTags[] = [
      ft("apps/web/CLAUDE.md", 0, [
        { kind: "file_type", value: "instruction" },
        { kind: "project_scope", value: "subproject" },
      ]),
      ft("apps/web/GEMINI.md", 0, [
        { kind: "file_type", value: "instruction" },
        { kind: "project_scope", value: "subproject" },
      ]),
      ft("apps/api/CLAUDE.md", 0, [
        { kind: "file_type", value: "instruction" },
        { kind: "project_scope", value: "subproject" },
      ]),
      ft("libs/foo/CLAUDE.md", 0, [
        { kind: "file_type", value: "instruction" },
        { kind: "project_scope", value: "subproject" },
      ]),
      ft("docs/CLAUDE.md", 0, [
        { kind: "file_type", value: "instruction" },
        { kind: "project_scope", value: "subproject" },
      ]),
    ];
    const m = aggregateRawMetrics(files);
    // apps/web/, apps/api/, libs/foo/ — docs/ doesn't match the prefix pattern
    expect(m.subprojectCoverage).toBe(3);
  });

  it("ignores instruction files at root scope for coverage", () => {
    const files: FileWithTags[] = [
      ft("CLAUDE.md", 0, [
        { kind: "file_type", value: "instruction" },
        { kind: "project_scope", value: "root" },
      ]),
    ];
    const m = aggregateRawMetrics(files);
    expect(m.subprojectCoverage).toBe(0);
  });

  it("counts unique MCP server names across supported files", () => {
    const files: FileWithTags[] = [
      {
        ...ft(".mcp.json", 0, [{ kind: "file_type", value: "mcp" }]),
        mcpServerNames: ["github", "docs", " docs ", ""],
      },
      {
        ...ft("mcp.json", 0, [{ kind: "file_type", value: "mcp" }]),
        mcpServerNames: ["github", "filesystem"],
      },
      {
        ...ft(".codex/config.toml", 0, [
          { kind: "file_type", value: "config" },
          { kind: "agent_type", value: "codex" },
        ]),
        mcpServerNames: ["filesystem", "memory"],
      },
    ];

    const m = aggregateRawMetrics(files);
    expect(m.mcpCount).toBe(4);
  });
});
