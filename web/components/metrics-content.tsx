import { MetricCard } from "./metric-card";
import type { Locale } from "../lib/i18n";
import { messages } from "../lib/i18n";
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
      formula: "score = min(skill_count, 30) / 30 × 100",
      raw: "统计仓库中 skill（技能）的数量。",
    },
    {
      label: "高级技能",
      key: "advanced_skill_count",
      formula: "score = min(advanced_skill_count, 10) / 10 × 100",
      raw: "统计「高级技能」的数量，也就是目录里带有脚本、可被直接执行的技能。",
    },
    {
      label: "代理",
      key: "agent_count",
      formula: "score = min(agent_count, 10) / 10 × 100",
      raw: "统计 agent（智能体）定义文件的数量。",
    },
    {
      label: "命令",
      key: "command_count",
      formula: "score = min(command_count, 10) / 10 × 100",
      raw: "统计命令（command）文件的数量，例如 commands/ 或 .codex/prompts/ 下的命令。",
    },
    {
      label: "MCP 服务",
      key: "mcp_count",
      formula: "score = min(mcp_count, 3) / 3 × 100",
      raw: "统计明确支持的仓库级 MCP 配置来源里解析出的唯一服务名数量，目前包括 Claude Code 的 .mcp.json / mcp.json 与 Codex 的 .codex/config.toml。",
    },
    {
      label: "指令文件",
      key: "ai_instruction_files",
      formula: "score = min(ai_instruction_files, 1) / 1 × 100",
      raw: "统计给 AI 的指令文件，例如 CLAUDE.md、AGENTS.md、GEMINI.md、Cursor rules。",
    },
    {
      label: "规格文件",
      key: "specs_file_count",
      formula: "score = min(specs_file_count, 50) / 50 × 100",
      raw: "统计 Markdown 文档（md/mdx/mdc）的数量，不含上面已计入的指令、技能、agent、命令或 MCP 文件。",
    },
    {
      label: "覆盖率",
      key: "subproject_coverage",
      formula: "score = min(subproject_coverage, 5) / 5 × 100",
      raw: "统计带有 AI 指令文件的子项目数量（例如 apps/ 或 libs/ 下的各个子项目）。",
    },
  ],
  en: [
    {
      label: "Skills",
      key: "skill_count",
      formula: "score = min(skill_count, 30) / 30 × 100",
      raw: "Counts the number of skills in the repository.",
    },
    {
      label: "Advanced skills",
      key: "advanced_skill_count",
      formula: "score = min(advanced_skill_count, 10) / 10 × 100",
      raw: "Counts advanced skills — skills whose directory includes scripts or other executable resources.",
    },
    {
      label: "Agents",
      key: "agent_count",
      formula: "score = min(agent_count, 10) / 10 × 100",
      raw: "Counts agent definition files.",
    },
    {
      label: "Commands",
      key: "command_count",
      formula: "score = min(command_count, 10) / 10 × 100",
      raw: "Counts command files, such as those under commands/ or .codex/prompts/.",
    },
    {
      label: "MCP servers",
      key: "mcp_count",
      formula: "score = min(mcp_count, 3) / 3 × 100",
      raw: "Counts unique MCP server names parsed from explicitly supported repository-level MCP sources: Claude Code .mcp.json / mcp.json and Codex .codex/config.toml.",
    },
    {
      label: "Instructions",
      key: "ai_instruction_files",
      formula: "score = min(ai_instruction_files, 1) / 1 × 100",
      raw: "Counts AI instruction files, such as CLAUDE.md, AGENTS.md, GEMINI.md, and Cursor rules.",
    },
    {
      label: "Spec files",
      key: "specs_file_count",
      formula: "score = min(specs_file_count, 50) / 50 × 100",
      raw: "Counts Markdown documents (md/mdx/mdc), excluding files already counted above as instructions, skills, agents, commands, or MCP.",
    },
    {
      label: "Coverage",
      key: "subproject_coverage",
      formula: "score = min(subproject_coverage, 5) / 5 × 100",
      raw: "Counts subprojects (for example under apps/ or libs/) that contain an AI instruction file.",
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
    ["skill_count", "技能数量，封顶 30。"],
    ["skill_line_count", "技能文件总行数，封顶 15000 行。"],
    ["advanced_skill_count", "高级技能数量，封顶 10。"],
    ["skill_engineering_rate", "高级技能占技能总数的比例，达到 50% 即 100 分。"],
    ["skill_resource_count", "skills/ 下的资源文件数量，封顶 30。"],
    ["agent_count", "agent 定义数量，封顶 10。"],
    ["agent_line_count", "agent 文件总行数，封顶 2000 行。"],
    ["command_count", "命令文件数量，封顶 10。"],
    ["command_line_count", "命令文件总行数，封顶 2000 行。"],
    ["mcp_count", "MCP 配置文件数量，封顶 3。"],
    ["ai_instruction_files", "AI 指令文件数量，至少 1 个即 100 分。"],
    [
      "instruction_max_line_count",
      "最长指令文件的行数：50-400 行为 100 分，过短或超过 1000 行会降分。",
    ],
    ["specs_file_count", "规格/文档文件数量，封顶 50。"],
    ["specs_line_count", "规格/文档总行数，封顶 5000 行。"],
    ["subproject_coverage", "带有 AI 指令文件的 apps/libs 子项目数，封顶 5。"],
  ],
  en: [
    ["skill_count", "Skill file count, capped at 30."],
    ["skill_line_count", "Total skill file lines, capped at 15000."],
    ["advanced_skill_count", "Advanced skill count, capped at 10."],
    ["skill_engineering_rate", "Share of skills that are advanced; scores 100 at 50%."],
    ["skill_resource_count", "Resource files under skills/, capped at 30."],
    ["agent_count", "Agent definition count, capped at 10."],
    ["agent_line_count", "Total agent file lines, capped at 2000."],
    ["command_count", "Command file count, capped at 10."],
    ["command_line_count", "Total command file lines, capped at 2000."],
    ["mcp_count", "MCP configuration file count, capped at 3."],
    ["ai_instruction_files", "AI instruction file count; 1 or more scores 100."],
    [
      "instruction_max_line_count",
      "Longest instruction file lines: 50-400 lines score 100; very short or >1000 lines score lower.",
    ],
    ["specs_file_count", "Spec/document file count, capped at 50."],
    ["specs_line_count", "Total spec/document lines, capped at 5000."],
    ["subproject_coverage", "apps/libs subproject prefixes covered by instruction files, capped at 5."],
  ],
} as const;

function ReportImageGuide({ locale }: MetricsContentProps) {
  const metrics = messages[locale].metrics;
  const previewSvg = renderImageSvg(
    { ...sampleReport, meta: { ...sampleReport.meta, lang: locale } },
    { lang: locale },
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
              <p className="mt-3 text-sm leading-6 text-muted">{item.raw}</p>
              <p className="mt-2 rounded-md bg-slate-950 px-3 py-2 font-mono text-xs leading-5 text-emerald-200">
                {item.formula}
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
        <h2 className="font-mono text-2xl font-semibold text-ink">{metrics.formulaTitle}</h2>
        <div className="mt-5 grid gap-3 lg:grid-cols-4">
          {metrics.formulaSteps.map((step, index) => (
            <div className="rounded-md border border-line bg-canvas p-4" key={step}>
              <span className="font-mono text-sm font-black text-brand">
                {String(index + 1).padStart(2, "0")}
              </span>
              <p className="mt-3 text-sm leading-6 text-muted">{step}</p>
            </div>
          ))}
        </div>
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
          {metrics.levels.map(([level, description]) => (
            <div
              className="grid gap-2 rounded-md border border-line bg-canvas p-4 sm:grid-cols-[5rem_1fr] sm:items-center"
              key={level}
            >
              <strong className="font-mono text-xl text-brand">{level}</strong>
              <span className="text-sm leading-6 text-muted">{description}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
