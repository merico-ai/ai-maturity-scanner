import Link from "next/link";

import { renderImageSvg } from "../../src/report/image-svg";
import type { ImageReportData } from "../../src/report/image-svg";
import type { Locale } from "../lib/i18n";
import { localizePath, messages } from "../lib/i18n";
import { sampleMetricsSourceQrSvg, sampleQrSvg } from "../lib/sample-qr";
import { MetricCard } from "./metric-card";

type MetricsContentProps = {
  locale: Locale;
};

const imageMetricDetails = {
  zh: [
    ["技能", "skill_count", "根据仓库中 skill 的数量归一化得到的分数（满分 100）。"],
    ["高级技能", "advanced_skill_count", "根据高级 skill 数量归一化得到的分数（满分 100）。"],
    ["代理", "agent_count", "根据 agent 定义数量归一化得到的分数（满分 100）。"],
    ["命令", "command_count", "根据命令文件数量归一化得到的分数（满分 100）。"],
    [
      "MCP 服务",
      "mcp_count",
      "根据仓库级 MCP 配置解析出的唯一服务名数量归一化得到的分数（满分 100）。",
    ],
    ["指令文件", "ai_instruction_files", "根据 AI 指令文件数量归一化得到的分数（满分 100）。"],
    [
      "规格文件",
      "specs_file_count",
      "根据 spec/文档 Markdown 文件数量归一化得到的分数（满分 100）。",
    ],
    [
      "覆盖率",
      "subproject_coverage",
      "根据带有 AI 指令文件的子项目数量归一化得到的分数（满分 100）。",
    ],
  ],
  en: [
    ["Skills", "skill_count", "A score (max 100) derived from the number of skills."],
    ["Advanced skills", "advanced_skill_count", "A score (max 100) derived from advanced skills."],
    ["Agents", "agent_count", "A score (max 100) derived from agent definitions."],
    ["Commands", "command_count", "A score (max 100) derived from command files."],
    ["MCP servers", "mcp_count", "A score (max 100) derived from unique MCP server names."],
    [
      "Instructions",
      "ai_instruction_files",
      "A score (max 100) derived from AI instruction files.",
    ],
    [
      "Spec files",
      "specs_file_count",
      "A score (max 100) derived from spec/document Markdown files.",
    ],
    ["Coverage", "subproject_coverage", "A score (max 100) derived from covered subprojects."],
  ],
} as const;

const normalizedMetrics = {
  zh: [
    ["skill_count", "仓库中 skill（技能）的数量。"],
    ["skill_line_count", "技能文件的总行数。"],
    ["advanced_skill_count", "高级技能（目录含脚本的技能）的数量。"],
    ["skill_engineering_rate", "高级技能占技能总数的比例。"],
    ["skill_resource_count", "skills/ 下的资源文件数量。"],
    ["agent_count", "agent 定义的数量。"],
    ["agent_line_count", "agent 文件的总行数。"],
    ["command_count", "命令文件的数量。"],
    ["command_line_count", "命令文件的总行数。"],
    ["mcp_count", "仓库级 MCP 配置里解析出的唯一服务名数量。"],
    ["ai_instruction_files", "AI 指令文件（如 CLAUDE.md、AGENTS.md）的数量。"],
    ["instruction_max_line_count", "最长一个指令文件的行数。"],
    ["specs_file_count", "规格/文档 Markdown 文件的数量。"],
    ["specs_line_count", "规格/文档文件的总行数。"],
    ["subproject_coverage", "带有 AI 指令文件的 apps/、libs/ 子项目数量。"],
  ],
  en: [
    ["skill_count", "Number of skills in the repository."],
    ["skill_line_count", "Total lines across skill files."],
    ["advanced_skill_count", "Number of advanced skills."],
    ["skill_engineering_rate", "Share of skills that are advanced."],
    ["skill_resource_count", "Number of resource files under skills/."],
    ["agent_count", "Number of agent definitions."],
    ["agent_line_count", "Total lines across agent files."],
    ["command_count", "Number of command files."],
    ["command_line_count", "Total lines across command files."],
    ["mcp_count", "Number of unique MCP server names in repository-level MCP config."],
    ["ai_instruction_files", "Number of AI instruction files (e.g. CLAUDE.md, AGENTS.md)."],
    ["instruction_max_line_count", "Line count of the longest instruction file."],
    ["specs_file_count", "Number of spec/document Markdown files."],
    ["specs_line_count", "Total lines across spec/document files."],
    ["subproject_coverage", "Number of apps/ or libs/ subprojects with an AI instruction file."],
  ],
} as const;

const sampleReport: ImageReportData = {
  repo: {
    root: "/work/ai-maturity-scanner",
    remoteUrl: "https://github.com/merico-ai/ai-maturity-scanner.git",
    headSha: "abc1234567",
    scannedAt: "2026-07-15T08:00:00Z",
  },
  meta: { algorithmVersion: "v1", lang: "zh" },
  level: "L3",
  ami: 67.5,
  dimensions: { configuration_depth: 75, context_richness: 60, integration_breadth: 40 },
  normalizedMetrics: {
    skill_count: 83,
    skill_line_count: 60,
    advanced_skill_count: 30,
    skill_engineering_rate: 45,
    skill_resource_count: 40,
    agent_count: 30,
    agent_line_count: 35,
    command_count: 10,
    command_line_count: 20,
    mcp_count: 60,
    ai_instruction_files: 100,
    instruction_max_line_count: 100,
    specs_file_count: 100,
    specs_line_count: 80,
    subproject_coverage: 60,
  },
  rawMetrics: {
    skillCount: 25,
    skillResourceCount: 12,
    agentCount: 3,
    commandCount: 1,
    mcpCount: 2,
  },
  profile: {
    primary: {
      id: "skill-workshop",
      title: "技能工坊",
      strength: 52.5,
      evidence: {
        ruleId: "DR-001.primary.skill-workshop",
        facts: { skill_score: 76.25, skill_engineering_rate: 0.3 },
      },
    },
    traits: [
      {
        id: "structured-context",
        title: "上下文成册",
        degree: 100,
        tier: "high",
        tierTitle: "高",
        evidence: {
          ruleId: "DR-001.trait.structured-context",
          facts: { instruction_max_line_count: 100, specs_file_count: 100 },
        },
      },
      {
        id: "tool-connected",
        title: "工具深连",
        degree: 60,
        tier: "medium",
        tierTitle: "中",
        evidence: {
          ruleId: "DR-001.trait.tool-connected",
          facts: { mcp_count: 60 },
        },
      },
      {
        id: "cross-project",
        title: "跨项目覆盖",
        degree: 60,
        tier: "medium",
        tierTitle: "中",
        evidence: {
          ruleId: "DR-001.trait.cross-project",
          facts: { subproject_coverage: 60 },
        },
      },
    ],
    candidates: [],
  },
  files: Array.from({ length: 44 }),
};

function SpecConfigLink({ locale }: MetricsContentProps) {
  return (
    <Link
      className="font-semibold text-brand transition hover:underline"
      href={`${localizePath("/docs", locale)}#spec-config`}
    >
      {locale === "zh" ? "查看 spec 文件配置" : "See spec file configuration"}
    </Link>
  );
}

function ReportImageGuide({ locale }: MetricsContentProps) {
  const metrics = messages[locale].metrics;
  const previewSvg = renderImageSvg(
    { ...sampleReport, meta: { ...sampleReport.meta, lang: locale } },
    { lang: locale, qrSvg: sampleQrSvg, metricsSourceSvg: sampleMetricsSourceQrSvg },
  ).replace(/^<\?xml[^>]*>\s*/, "");
  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
      <div className="overflow-hidden rounded-md border border-line bg-slate-100 p-4 shadow-soft">
        <div
          aria-label={
            locale === "zh" ? "代码库 AI 成熟度报告示意图" : "Repository AI maturity report preview"
          }
          className="[&_svg]:h-auto [&_svg]:w-full"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: SVG is rendered from the local sample report.
          dangerouslySetInnerHTML={{ __html: previewSvg }}
        />
      </div>
      <section className="surface-card sm:p-6">
        <p className="eyebrow">{metrics.imageScoreLabel}</p>
        <h2 className="mt-3 font-mono text-2xl font-semibold text-ink">{metrics.imageTitle}</h2>
        <p className="body-copy mt-3 text-sm">{metrics.imageDescription}</p>
        <div className="mt-6 grid gap-3">
          {imageMetricDetails[locale].map(([label, key, desc]) => (
            <article className="rounded-md border border-line bg-canvas p-4" key={key}>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="font-mono text-base font-semibold text-ink">{label}</h3>
                <code className="text-xs font-bold text-brand">{key}</code>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted">
                {desc}
                {key === "specs_file_count" && (
                  <>
                    {" "}
                    <SpecConfigLink locale={locale} />
                  </>
                )}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export function MetricsContent({ locale }: MetricsContentProps) {
  const metrics = messages[locale].metrics;

  return (
    <main className="page-shell py-8 sm:py-12">
      <section className="max-w-3xl">
        <p className="eyebrow">{metrics.eyebrow}</p>
        <h1 className="page-title mt-3 sm:text-5xl">{metrics.title}</h1>
        <p className="body-copy mt-4 text-base">{metrics.description}</p>
      </section>

      <section className="mt-8">
        <ReportImageGuide locale={locale} />
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-3">
        {metrics.overview.map((metric) => (
          <MetricCard
            description={metric.description}
            key={metric.title}
            title={metric.title}
            weight={metric.weight}
          />
        ))}
      </section>

      <section className="surface-card mt-8 p-4 sm:p-4">
        <h2 className="font-mono text-xl font-semibold text-ink">{metrics.metricFormulaTitle}</h2>
        <div className="mt-4 grid overflow-hidden rounded-md border border-line bg-line lg:grid-cols-3">
          {normalizedMetrics[locale].map(([name, description]) => (
            <article className="min-w-0 border-b border-line bg-canvas px-3 py-2 lg:border-r" key={name}>
              <div className="flex min-w-0 flex-col gap-1 xl:flex-row xl:items-baseline xl:gap-3">
                <code className="shrink-0 text-xs font-bold text-brand">{name}</code>
                <p className="text-xs leading-5 text-muted">
                {description}
                {name === "specs_file_count" && (
                  <>
                    {" "}
                    <SpecConfigLink locale={locale} />
                  </>
                )}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="surface-card mt-8 p-4 sm:p-4">
        <h2 className="font-mono text-xl font-semibold text-ink">{metrics.levelTitle}</h2>
        <div className="mt-4 overflow-hidden rounded-md border border-line">
          {metrics.levels.map((item) => (
            <div
              className="grid gap-1.5 border-b border-line bg-canvas px-3 py-2 last:border-b-0 sm:grid-cols-[3.5rem_9rem_1fr] sm:items-baseline"
              key={item.level}
            >
              <strong className="font-mono text-base text-brand">{item.level}</strong>
              <div className="text-sm font-semibold text-ink">{item.title}</div>
              <span className="min-w-0 text-xs leading-5 text-muted">{item.description}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
