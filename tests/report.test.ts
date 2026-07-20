import { describe, expect, it } from "vitest";
import { emptyRawMetrics } from "../src/metrics/types.ts";
import {
  IMAGE_REPORT_QR_TARGET_URL,
  PNG_FINGERPRINT_KEYWORD,
  PNG_IMAGE_HASH_KEYWORD,
  imagePixelHash,
  readPngTextChunk,
  renderImagePng,
  renderImageSvg,
  repoDisplayName,
  reportFingerprint,
} from "../src/report/image.ts";
import { renderJson } from "../src/report/json.ts";
import { renderMarkdown } from "../src/report/markdown.ts";
import { renderTerminal } from "../src/report/terminal.ts";
import type { MaturityReport } from "../src/report/types.ts";
import type { FileWithTags } from "../src/types.ts";

const ANSI_ESCAPE_RE = new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*m`, "g");

function stripAnsi(value: string): string {
  return value.replace(ANSI_ESCAPE_RE, "");
}

function sampleReport(over: Partial<MaturityReport> = {}): MaturityReport {
  return {
    repo: { root: "/repo", headSha: "abc1234567", scannedAt: "2026-07-14T00:00:00Z" },
    meta: { algorithmVersion: "v1", lang: "en" },
    level: "L3",
    levelTitle: "Proficient",
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
  it("surfaces meta.algorithmVersion", () => {
    const parsed = JSON.parse(renderJson(sampleReport()));
    expect(parsed.meta.algorithmVersion).toBe("v1");
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
  it("surfaces the algorithm version", () => {
    const md = renderMarkdown(sampleReport());
    expect(md).toContain("**Algorithm version:** v1");
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
    const out = stripAnsi(renderTerminal(sampleReport()));
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
    const out = stripAnsi(renderTerminal(sampleReport()));
    expect(out).toContain("abc12345");
    expect(out).not.toContain("abc1234567");
  });
  it("emits the empty-state message when there are no files", () => {
    const out = stripAnsi(renderTerminal(sampleReport()));
    expect(out).toContain("No AI-related files detected.");
  });
  it("surfaces the algorithm version", () => {
    const out = stripAnsi(renderTerminal(sampleReport()));
    expect(out).toContain("algorithm v1");
  });
});

describe("renderImage", () => {
  it("derives the repository display name from remote URL or repo root", () => {
    expect(
      repoDisplayName(
        sampleReport({
          repo: {
            root: "/work/fallback",
            remoteUrl: "git@github.com:merico-ai/ai-maturity-scanner.git",
            headSha: "abc1234567",
            scannedAt: "2026-07-14T00:00:00Z",
          },
        }),
      ),
    ).toBe("ai-maturity-scanner");
    expect(
      repoDisplayName(sampleReport({ repo: { ...sampleReport().repo, root: "/work/local" } })),
    ).toBe("local");
  });

  it("renders report data into an SVG image template", async () => {
    const report = sampleReport({
      repo: {
        root: "/repo",
        remoteUrl: "https://github.com/merico-ai/ai-maturity-scanner.git",
        headSha: "abc1234567",
        scannedAt: "2026-07-14T00:00:00Z",
      },
    });
    const svg = await renderImageSvg(report);

    expect(svg).toContain('width="1080" height="1920"');
    expect(svg).toContain("Repository AI Maturity");
    expect(svg).toContain("ai-maturity-scanner");
    expect(svg).not.toContain("github.com");
    expect(svg).not.toContain(".git");
    expect(svg).toContain("L3");
    expect(svg).toContain("67.5");
    expect(svg).toContain('role="img" aria-label="AI Maturity badge L3"');
    expect(svg).toContain("AI Maturity");
    expect(svg).toContain('fill="#4c1"');
    expect(svg).toContain("QR unavailable");
    expect(svg).toContain("Coming soon");
    expect(svg).toContain("Scan my repository AI maturity");
    expect(svg).not.toContain("Fingerprint");
    expect(svg).not.toContain(reportFingerprint(report));
    expect(svg).not.toContain("Full sharing variant");
    expect(svg).not.toContain("Redacted sharing variant");
  });

  it("embeds a QR code when a target URL is configured", async () => {
    const svg = await renderImageSvg(sampleReport(), {
      qrTargetUrl: IMAGE_REPORT_QR_TARGET_URL,
    });

    expect(svg).not.toContain("QR unavailable");
    expect(svg).toContain("<svg");
    expect(svg).toContain('width="150" height="150"');
    expect(svg).toContain("Scan my repository AI maturity");
    // metric-sources QR stays a placeholder until its URL is configured
    expect(svg).toContain("Coming soon");
  });

  it("embeds a second QR code for metric sources when its URL is configured", async () => {
    const svg = await renderImageSvg(sampleReport(), {
      qrTargetUrl: IMAGE_REPORT_QR_TARGET_URL,
      metricsSourceUrl: "https://example.com/metrics",
    });

    expect((svg.match(/width="150" height="150"/g) ?? []).length).toBe(2);
    expect(svg).toContain("Scan my repository AI maturity");
    expect(svg).toContain("Scan metric sources");
    expect(svg).not.toContain("Coming soon");
    expect(svg).not.toContain("QR unavailable");
  });

  it("generates a deterministic SHA-256 report fingerprint", () => {
    const fingerprint = reportFingerprint(sampleReport());

    expect(fingerprint).toMatch(/^[a-f0-9]{64}$/);
    expect(reportFingerprint(sampleReport())).toBe(fingerprint);
    expect(reportFingerprint(sampleReport({ ami: 68 }))).not.toBe(fingerprint);
  });

  it("redacts only the repository display field", async () => {
    const svg = await renderImageSvg(sampleReport(), { redacted: true });

    expect(svg).toContain("Repository hidden");
    expect(svg).not.toContain("/repo");
    expect(svg).toContain("abc12345");
    expect(svg).toContain("67.5");
    expect(svg).toContain("L3");
  });

  it("renders Chinese image copy", async () => {
    const svg = await renderImageSvg(
      sampleReport({ meta: { algorithmVersion: "v1", lang: "zh" } }),
    );

    expect(svg).toContain("代码库 AI 成熟度");
    expect(svg).toContain("扫码查看我的代码库AI成熟度");
    expect(svg).toContain("扫码查看指标来源");
    expect(svg).toContain("即将上线");
  });

  it("renders a PNG buffer", async () => {
    const report = sampleReport();
    const png = await renderImagePng(report);

    expect(png.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
    expect(readPngTextChunk(png, PNG_FINGERPRINT_KEYWORD)).toBe(reportFingerprint(report));
    expect(readPngTextChunk(png, PNG_IMAGE_HASH_KEYWORD)).toBe(await imagePixelHash(png));
  }, 15_000);
});

describe("i18n: zh output", () => {
  it("renderMarkdown emits Chinese labels", () => {
    const md = renderMarkdown(sampleReport({ meta: { algorithmVersion: "v1", lang: "zh" } }));
    expect(md).toContain("# AI 成熟度报告");
    expect(md).toContain("**仓库:**");
    expect(md).toContain("**等级:** L3");
    expect(md).toContain("## 总览");
    expect(md).toContain("## 指标");
    expect(md).toContain("### 配置深度 — Skill 类");
    expect(md).toContain("### 上下文丰富度 — 指令");
    expect(md).toContain("### 集成广度");
    expect(md).toContain("_agent_type_distinct（辅助指标，不计入 AMI）：2_");
    expect(md).toContain("_未检测到 AI 相关文件。_");
  });

  it("renderTerminal emits Chinese labels", () => {
    const out = stripAnsi(
      renderTerminal(sampleReport({ meta: { algorithmVersion: "v1", lang: "zh" } })),
    );
    expect(out).toContain("AI 成熟度报告");
    expect(out).toContain("等级: L3");
    expect(out).toContain("配置深度");
    expect(out).toContain("Skill 类");
    expect(out).toContain("agent_type_distinct（辅助指标，不计入 AMI）：2");
    expect(out).toContain("未检测到 AI 相关文件。");
  });

  it("metric identifiers stay canonical in both languages", () => {
    const en = renderMarkdown(sampleReport());
    const zh = renderMarkdown(sampleReport({ meta: { algorithmVersion: "v1", lang: "zh" } }));
    for (const name of ["skill_count", "agent_count", "mcp_count", "subproject_coverage"]) {
      expect(en).toContain(`| ${name} |`);
      expect(zh).toContain(`| ${name} |`);
    }
  });
});
