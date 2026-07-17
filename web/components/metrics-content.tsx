import { MetricCard } from "./metric-card";
import type { Locale } from "../lib/i18n";
import { messages } from "../lib/i18n";
import { sampleQrSvg } from "../lib/sample-qr";
import { renderImageSvg } from "../../src/report/image-svg";
import type { ImageReportData } from "../../src/report/image-svg";

type MetricsContentProps = {
  locale: Locale;
};

const imageMetricDetails = {
  zh: [
    {
      label: "技能",
      key: "skill_count",
      desc: "根据仓库中 skill 的数量归一化得到的分数（满分 100）。",
    },
    {
      label: "高级技能",
      key: "advanced_skill_count",
      desc: "根据高级 skill 数量归一化得到的分数（满分 100）。高级 skill 指目录中带脚本的技能。",
    },
    {
      label: "代理",
      key: "agent_count",
      desc: "根据 agent 定义数量归一化得到的分数（满分 100）。",
    },
    {
      label: "命令",
      key: "command_count",
      desc: "根据命令文件数量归一化得到的分数（满分 100），例如 commands/ 或 .codex/prompts/ 下的命令。",
    },
    {
      label: "MCP 服务",
      key: "mcp_count",
      desc: "根据仓库级 MCP 配置解析出的唯一服务名数量归一化得到的分数（满分 100）。目前支持 Claude Code 的 .mcp.json / mcp.json 与 Codex 的 .codex/config.toml。",
    },
    {
      label: "指令文件",
      key: "ai_instruction_files",
      desc: "根据 AI 指令文件数量归一化得到的分数（满分 100），例如 CLAUDE.md、AGENTS.md、GEMINI.md、Cursor rules。",
    },
    {
      label: "规格文件",
      key: "specs_file_count",
      desc: "根据 spec/文档 Markdown 文件数量归一化得到的分数（满分 100）。",
    },
    {
      label: "覆盖率",
      key: "subproject_coverage",
      desc: "根据带有 AI 指令文件的 apps/、libs/ 子项目数量归一化得到的分数（满分 100）。",
    },
  ],
  en: [
    {
      label: "Skills",
      key: "skill_count",
      desc: "A score (max 100) derived by normalizing the number of skills in the repository.",
    },
    {
      label: "Advanced skills",
      key: "advanced_skill_count",
      desc: "A score (max 100) derived by normalizing the count of advanced skills — skills whose directory includes scripts.",
    },
    {
      label: "Agents",
      key: "agent_count",
      desc: "A score (max 100) derived by normalizing the number of agent definitions.",
    },
    {
      label: "Commands",
      key: "command_count",
      desc: "A score (max 100) derived by normalizing the number of command files, e.g. under commands/ or .codex/prompts/.",
    },
    {
      label: "MCP servers",
      key: "mcp_count",
      desc: "A score (max 100) derived by normalizing the count of unique MCP server names from supported repository-level MCP config (Claude Code .mcp.json / mcp.json and Codex .codex/config.toml).",
    },
    {
      label: "Instructions",
      key: "ai_instruction_files",
      desc: "A score (max 100) derived by normalizing the number of AI instruction files, e.g. CLAUDE.md, AGENTS.md, GEMINI.md, Cursor rules.",
    },
    {
      label: "Spec files",
      key: "specs_file_count",
      desc: "A score (max 100) derived by normalizing the number of spec/document Markdown files.",
    },
    {
      label: "Coverage",
      key: "subproject_coverage",
      desc: "A score (max 100) derived by normalizing the number of apps/ or libs/ subprojects that contain an AI instruction file.",
    },
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
  dimensions: {
    configuration_depth: 75,
    context_richness: 60,
    integration_breadth: 40,
  },
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
    mcp_count: 0,
    ai_instruction_files: 100,
    instruction_max_line_count: 100,
    specs_file_count: 100,
    specs_line_count: 80,
    subproject_coverage: 20,
  },
  rawMetrics: {
    skillCount: 25,
    skillResourceCount: 12,
    agentCount: 3,
    commandCount: 1,
    mcpCount: 0,
  },
  files: Array.from({ length: 44 }),
};

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
    ["advanced_skill_count", "Number of advanced skills (skills whose directory includes scripts)."],
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

function ReportImageGuide({ locale }: MetricsContentProps) {
  const metrics = messages[locale].metrics;
  const previewSvg = renderImageSvg(
    { ...sampleReport, meta: { ...sampleReport.meta, lang: locale } },
    { lang: locale, qrSvg: sampleQrSvg },
  ).replace(/^<\?xml[^>]*>\s*/, "");

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
      <div className="overflow-hidden rounded-md border border-line bg-slate-100 p-4 shadow-soft">
        <div
          aria-label={locale === "zh" ? "代码库 AI 成熟度报告示意图" : "Repository AI maturity report preview"}
          className="[&_svg]:h-auto [&_svg]:w-full"
          dangerouslySetInnerHTML={{ __html: previewSvg }}
        />
      </div>

      <section className="surface-card sm:p-6">
        <p className="eyebrow">{metrics.imageScoreLabel}</p>
        <h2 className="mt-3 font-mono text-2xl font-semibold text-ink">{metrics.imageTitle}</h2>
        <p className="body-copy mt-3 text-sm">{metrics.imageDescription}</p>
        <div className="mt-6 grid gap-3">
          {imageMetricDetails[locale].map((item) => (
            <article className="rounded-md border border-line bg-canvas p-4" key={item.key}>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="font-mono text-base font-semibold text-ink">{item.label}</h3>
                <code className="text-xs font-bold text-brand">{item.key}</code>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted">{item.desc}</p>
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

      <section className="mt-8">
        <ReportImageGuide locale={locale} />
      </section>

      <section className="surface-card mt-8 sm:p-6">
        <h2 className="font-mono text-2xl font-semibold text-ink">
          {metrics.metricFormulaTitle}
        </h2>
        <div className="mt-5 grid gap-3 lg:grid-cols-3">
          {normalizedMetrics[locale].map(([name, description]) => (
            <article className="rounded-md border border-line bg-canvas p-4" key={name}>
              <code className="text-sm font-bold text-brand">{name}</code>
              <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="surface-card mt-8 sm:p-6">
        <h2 className="font-mono text-2xl font-semibold text-ink">{metrics.levelTitle}</h2>
        <div className="mt-5 grid gap-3">
          {metrics.levels.map((item) => (
            <div
              className="grid gap-2 rounded-md border border-line bg-canvas p-4 sm:grid-cols-[5rem_1fr] sm:items-center"
              key={item.level}
            >
              <strong className="font-mono text-xl text-brand">{item.level}</strong>
              <div className="min-w-0">
                <div className="font-semibold text-ink">{item.title}</div>
                <span className="text-sm leading-6 text-muted">{item.description}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
