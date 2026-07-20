import { stringsFor } from "../i18n/index.ts";
import type { ReportStrings } from "../i18n/index.ts";
import type { MaturityRawMetrics } from "../metrics/types.ts";
import type { FileWithTags, Tag } from "../types.ts";
import type { MaturityReport } from "./types.ts";

const FILE_SHOW_LIMIT = 50;

function fmt(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

function metricTable(rows: ReadonlyArray<{ name: string; raw: number; score: number }>): string {
  const lines = ["| Metric | Raw | Score |", "| --- | ---: | ---: |"];
  for (const r of rows) {
    lines.push(`| ${r.name} | ${fmt(r.raw)} | ${fmt(r.score)} |`);
  }
  return lines.join("\n");
}

function metricsSections(
  raw: MaturityRawMetrics,
  normalized: Record<string, number>,
  t: ReportStrings,
): string {
  const g = (k: string) => normalized[k] ?? 0;
  const skill = metricTable([
    { name: "skill_count", raw: raw.skillCount, score: g("skill_count") },
    { name: "skill_line_count", raw: raw.skillLineCount, score: g("skill_line_count") },
    { name: "advanced_skill_count", raw: raw.advancedSkillCount, score: g("advanced_skill_count") },
    {
      name: "skill_engineering_rate",
      raw: raw.skillCount > 0 ? raw.advancedSkillCount / raw.skillCount : 0,
      score: g("skill_engineering_rate"),
    },
    { name: "skill_resource_count", raw: raw.skillResourceCount, score: g("skill_resource_count") },
  ]);
  const agent = metricTable([
    { name: "agent_count", raw: raw.agentCount, score: g("agent_count") },
    { name: "agent_line_count", raw: raw.agentLineCount, score: g("agent_line_count") },
  ]);
  const command = metricTable([
    { name: "command_count", raw: raw.commandCount, score: g("command_count") },
    { name: "command_line_count", raw: raw.commandLineCount, score: g("command_line_count") },
  ]);
  const mcp = metricTable([{ name: "mcp_count", raw: raw.mcpCount, score: g("mcp_count") }]);
  const instruction = metricTable([
    { name: "ai_instruction_files", raw: raw.aiInstructionFiles, score: g("ai_instruction_files") },
    {
      name: "instruction_max_line_count",
      raw: raw.instructionMaxLineCount,
      score: g("instruction_max_line_count"),
    },
  ]);
  const specs = metricTable([
    { name: "specs_file_count", raw: raw.specsFileCount, score: g("specs_file_count") },
    { name: "specs_line_count", raw: raw.specsLineCount, score: g("specs_line_count") },
  ]);
  const integration = metricTable([
    { name: "subproject_coverage", raw: raw.subprojectCoverage, score: g("subproject_coverage") },
  ]);
  return [
    `### ${t.configurationDepth} — ${t.skillClass}`,
    skill,
    "",
    `### ${t.configurationDepth} — ${t.agentClass}`,
    agent,
    "",
    `### ${t.configurationDepth} — ${t.commandClass}`,
    command,
    "",
    `### ${t.configurationDepth} — ${t.mcpClass}`,
    mcp,
    "",
    `### ${t.contextRichness} — ${t.instruction}`,
    instruction,
    "",
    `### ${t.contextRichness} — ${t.specs}`,
    specs,
    "",
    `### ${t.integrationBreadth}`,
    integration,
    "",
    `_${t.helperLabel(raw.agentTypeDistinct)}_`,
  ].join("\n");
}

function groupByFileType(files: readonly FileWithTags[]): Map<string, FileWithTags[]> {
  const out = new Map<string, FileWithTags[]>();
  for (const f of files) {
    const ft = f.tags.find((t) => t.kind === "file_type")?.value ?? "(none)";
    const list = out.get(ft) ?? [];
    list.push(f);
    out.set(ft, list);
  }
  return out;
}

function findTag(tags: readonly Tag[], kind: string): string | undefined {
  return tags.find((t) => t.kind === kind)?.value;
}

function filesSection(files: readonly FileWithTags[], t: ReportStrings): string {
  if (files.length === 0) return `## ${t.filesHeader(0)}\n\n_${t.noFilesMessage}_`;
  const grouped = groupByFileType(files);
  const order = [
    "instruction",
    "skill",
    "skill_resource",
    "command",
    "agent",
    "spec",
    "hook",
    "config",
    "mcp",
    "(none)",
  ];
  const keys = [...grouped.keys()].sort((a, b) => {
    const ia = order.indexOf(a);
    const ib = order.indexOf(b);
    return (ia === -1 ? Number.MAX_SAFE_INTEGER : ia) - (ib === -1 ? Number.MAX_SAFE_INTEGER : ib);
  });

  const lines: string[] = [`## ${t.filesHeader(files.length)}`];
  let shown = 0;
  let truncated = false;
  for (const k of keys) {
    const list = grouped.get(k);
    if (!list) continue;
    lines.push("");
    lines.push(`### file_type=${k} (${list.length})`);
    for (const f of list) {
      if (shown >= FILE_SHOW_LIMIT) {
        truncated = true;
        break;
      }
      const agent = findTag(f.tags, "agent_type");
      const skillLevel = findTag(f.tags, "skill_level");
      const annotations = [agent && `agent=${agent}`, skillLevel && skillLevel].filter(Boolean);
      const suffix = annotations.length ? ` _(${annotations.join(", ")})_` : "";
      lines.push(`- \`${f.path}\`${suffix}`);
      shown++;
    }
    if (truncated) break;
  }
  if (truncated) {
    lines.push("");
    lines.push(`_${t.truncatedMessage(FILE_SHOW_LIMIT, files.length)}_`);
  }
  return lines.join("\n");
}

function profileLabels(report: MaturityReport): string {
  return [
    report.profile.primary.title,
    report.profile.supportingTrait?.title,
    ...report.profile.structuralTraits.map((trait) => trait.title),
  ]
    .filter((title): title is string => Boolean(title))
    .join(" · ");
}

export function renderMarkdown(report: MaturityReport): string {
  const t = stringsFor(report.meta.lang);
  const d = report.dimensions;
  return [
    `# ${t.title}`,
    "",
    `**${t.repoLabel}:** \`${report.repo.root}\`  `,
    `**${t.headLabel}:** \`${report.repo.headSha}\`  `,
    `**${t.scannedAtLabel}:** ${report.repo.scannedAt}  `,
    `**${t.algorithmVersionLabel}:** ${report.meta.algorithmVersion}`,
    "",
    `## ${t.overallSection}`,
    "",
    `**${t.levelLabel}:** ${report.level} ${t.levelTitles[report.level]}  `,
    `**AMI:** ${fmt(report.ami)} / 100`,
    `**${t.profileLabel}:** ${profileLabels(report)}`,
    "",
    `| ${t.dimensionHeader} | ${t.scoreHeader} |`,
    "| --- | ---: |",
    `| ${t.configurationDepth} | ${fmt(d.configuration_depth)} |`,
    `| ${t.contextRichness} | ${fmt(d.context_richness)} |`,
    `| ${t.integrationBreadth} | ${fmt(d.integration_breadth)} |`,
    "",
    `## ${t.metricsSection}`,
    "",
    metricsSections(report.rawMetrics, report.normalizedMetrics, t),
    "",
    filesSection(report.files, t),
    "",
  ].join("\n");
}
