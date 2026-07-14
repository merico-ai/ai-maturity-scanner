import { describe, expect, it } from "vitest";
import { emptyRawMetrics } from "../src/metrics/types.ts";
import { renderJson } from "../src/report/json.ts";
import { renderMarkdown } from "../src/report/markdown.ts";
import { renderTerminal } from "../src/report/terminal.ts";
import type { MaturityReport } from "../src/report/types.ts";
import type { FileWithTags } from "../src/types.ts";

function sampleReport(over: Partial<MaturityReport> = {}): MaturityReport {
  return {
    repo: { root: "/repo", headSha: "abc1234567", scannedAt: "2026-07-14T00:00:00Z" },
    level: "L3",
    ami: 67.5,
    dimensions: {
      configuration_depth: 75,
      context_richness: 60,
      integration_breadth: 40,
    },
    normalizedMetrics: {
      skill_count: 40,
      skill_line_count: 30,
      advanced_skill_count: 50,
      skill_engineering_rate: 60,
      skill_resource_count: 20,
      agent_count: 50,
      agent_line_count: 30,
      command_count: 40,
      command_line_count: 20,
      mcp_count: 33,
      ai_instruction_files: 100,
      instruction_max_line_count: 100,
      specs_file_count: 24,
      specs_line_count: 10,
      subproject_coverage: 20,
    },
    rawMetrics: {
      ...emptyRawMetrics(),
      skillCount: 12,
      skillLineCount: 4500,
      advancedSkillCount: 5,
      skillResourceCount: 6,
      agentCount: 5,
      agentLineCount: 600,
      commandCount: 4,
      commandLineCount: 400,
      mcpCount: 1,
      aiInstructionFiles: 2,
      instructionMaxLineCount: 200,
      specsFileCount: 12,
      specsLineCount: 500,
      subprojectCoverage: 1,
      agentTypeDistinct: 2,
    },
    files: [] as FileWithTags[],
    ...over,
  };
}

describe("renderJson", () => {
  it("returns valid JSON with a trailing newline", () => {
    const out = renderJson(sampleReport());
    expect(out.endsWith("\n")).toBe(true);
    const parsed = JSON.parse(out);
    expect(parsed.level).toBe("L3");
    expect(parsed.ami).toBe(67.5);
    expect(parsed.repo.headSha).toBe("abc1234567");
  });
  it("round-trips through parse without losing fields", () => {
    const r = sampleReport();
    const parsed = JSON.parse(renderJson(r)) as MaturityReport;
    expect(parsed.dimensions).toEqual(r.dimensions);
    expect(parsed.normalizedMetrics).toEqual(r.normalizedMetrics);
    expect(parsed.rawMetrics).toEqual(r.rawMetrics);
  });
});

describe("renderMarkdown", () => {
  it("includes the level, ami, and dimensions", () => {
    const md = renderMarkdown(sampleReport());
    expect(md).toContain("# AI Maturity Report");
    expect(md).toContain("**Level:** L3");
    expect(md).toContain("**AMI:** 67.5 / 100");
    expect(md).toContain("Configuration depth");
    expect(md).toContain("| Configuration depth | 75 |");
  });
  it("includes all 15 metric rows", () => {
    const md = renderMarkdown(sampleReport());
    for (const name of [
      "skill_count",
      "skill_line_count",
      "advanced_skill_count",
      "skill_engineering_rate",
      "skill_resource_count",
      "agent_count",
      "agent_line_count",
      "command_count",
      "command_line_count",
      "mcp_count",
      "ai_instruction_files",
      "instruction_max_line_count",
      "specs_file_count",
      "specs_line_count",
      "subproject_coverage",
    ]) {
      expect(md).toContain(`| ${name} |`);
    }
  });
  it("shows repo + head sha", () => {
    const md = renderMarkdown(sampleReport());
    expect(md).toContain("`/repo`");
    expect(md).toContain("abc1234567");
  });
  it("renders an empty-state files section", () => {
    const md = renderMarkdown(sampleReport());
    expect(md).toContain("_No AI-related files detected._");
  });
  it("lists files grouped by file_type", () => {
    const files: FileWithTags[] = [
      {
        path: "CLAUDE.md",
        size: 100,
        lines: 10,
        tags: [
          { kind: "file_type", value: "instruction" },
          { kind: "agent_type", value: "claude" },
        ],
      },
      {
        path: "skills/foo/SKILL.md",
        size: 50,
        lines: 5,
        tags: [
          { kind: "file_type", value: "skill" },
          { kind: "skill_level", value: "advanced_skill" },
        ],
      },
    ];
    const md = renderMarkdown(sampleReport({ files }));
    expect(md).toContain("### file_type=instruction (1)");
    expect(md).toContain("`CLAUDE.md` _(agent=claude)_");
    expect(md).toContain("### file_type=skill (1)");
    expect(md).toContain("`skills/foo/SKILL.md` _(advanced_skill)_");
  });
});

describe("renderTerminal", () => {
  it("includes the level, ami, and dimensions", () => {
    const out = renderTerminal(sampleReport());
    expect(out).toContain("AI Maturity Report");
    expect(out).toContain("Level: L3");
    expect(out).toContain("AMI: 67.5");
    expect(out).toContain("Configuration depth");
  });
  it("emits a bar character for each dimension", () => {
    const out = renderTerminal(sampleReport());
    // Both filled (█) and empty (░) bar characters are present.
    expect(out).toMatch(/█/);
    expect(out).toMatch(/░/);
  });
  it("shows the short SHA, not the full SHA", () => {
    const out = renderTerminal(sampleReport());
    expect(out).toContain("abc12345");
    expect(out).not.toContain("abc1234567");
  });
  it("emits the empty-state message when there are no files", () => {
    const out = renderTerminal(sampleReport());
    expect(out).toContain("No AI-related files detected.");
  });
});
