import pc from "picocolors";
import { stringsFor } from "../i18n/index.ts";
import type { ReportStrings } from "../i18n/index.ts";
import type { MaturityRawMetrics } from "../metrics/types.ts";
import type { FileWithTags, Tag } from "../types.ts";
import type { Level, MaturityReport } from "./types.ts";

const BAR_WIDTH = 24;
const FILE_SHOW_LIMIT = 30;

function fmt(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

function bar(score: number): string {
  const filled = Math.max(0, Math.min(BAR_WIDTH, Math.round((score / 100) * BAR_WIDTH)));
  const empty = BAR_WIDTH - filled;
  const barStr = `${"█".repeat(filled)}${"░".repeat(empty)}`;
  if (score >= 75) return pc.green(barStr);
  if (score >= 50) return pc.yellow(barStr);
  if (score >= 25) return pc.cyan(barStr);
  return pc.red(barStr);
}

function levelColor(level: Level): string {
  switch (level) {
    case "L0":
      return pc.red(level);
    case "L1":
      return pc.yellow(level);
    case "L2":
      return pc.cyan(level);
    case "L3":
      return pc.green(level);
    case "L4":
      return pc.blue(level);
  }
}

function levelTitleBadge(level: Level, title: string): string {
  const fill = level === "L1" ? pc.black : pc.white;
  const body = fill(pc.bold(` ${title} `));
  switch (level) {
    case "L0":
      return pc.bgRed(body);
    case "L1":
      return pc.bgYellow(body);
    case "L2":
      return pc.bgCyan(body);
    case "L3":
      return pc.bgGreen(body);
    case "L4":
      return pc.bgBlue(body);
  }
}

function shortSha(sha: string): string {
  return sha.length > 8 ? sha.slice(0, 8) : sha;
}

function metricRow(name: string, raw: number, score: number): string {
  const nameCol = name.padEnd(30);
  const rawCol = String(fmt(raw)).padStart(8);
  const scoreCol = fmt(score).padStart(5);
  return `  ${pc.dim(nameCol)} ${rawCol}  ${bar(score)} ${scoreCol}`;
}

function metricsBlock(
  raw: MaturityRawMetrics,
  normalized: Record<string, number>,
  t: ReportStrings,
): string {
  const g = (k: string) => normalized[k] ?? 0;
  const er = raw.skillCount > 0 ? raw.advancedSkillCount / raw.skillCount : 0;
  const lines: string[] = [];
  const section = (title: string, rows: Array<[string, number, number]>) => {
    lines.push("");
    lines.push(`  ${pc.bold(title)}`);
    for (const [name, r, s] of rows) lines.push(metricRow(name, r, s));
  };

  section(t.skillClass, [
    ["skill_count", raw.skillCount, g("skill_count")],
    ["skill_line_count", raw.skillLineCount, g("skill_line_count")],
    ["advanced_skill_count", raw.advancedSkillCount, g("advanced_skill_count")],
    ["skill_engineering_rate", er, g("skill_engineering_rate")],
    ["skill_resource_count", raw.skillResourceCount, g("skill_resource_count")],
  ]);
  section(t.agentClass, [
    ["agent_count", raw.agentCount, g("agent_count")],
    ["agent_line_count", raw.agentLineCount, g("agent_line_count")],
  ]);
  section(t.commandClass, [
    ["command_count", raw.commandCount, g("command_count")],
    ["command_line_count", raw.commandLineCount, g("command_line_count")],
  ]);
  section(t.mcpClass, [["mcp_count", raw.mcpCount, g("mcp_count")]]);
  section(t.instruction, [
    ["ai_instruction_files", raw.aiInstructionFiles, g("ai_instruction_files")],
    ["instruction_max_line_count", raw.instructionMaxLineCount, g("instruction_max_line_count")],
  ]);
  section(t.specs, [
    ["specs_file_count", raw.specsFileCount, g("specs_file_count")],
    ["specs_line_count", raw.specsLineCount, g("specs_line_count")],
  ]);
  section(t.integration, [
    ["subproject_coverage", raw.subprojectCoverage, g("subproject_coverage")],
  ]);
  lines.push("");
  lines.push(`  ${pc.dim(t.helperLabel(raw.agentTypeDistinct))}`);
  return lines.join("\n");
}

function findTag(tags: readonly Tag[], kind: string): string | undefined {
  return tags.find((t) => t.kind === kind)?.value;
}

function filesBlock(files: readonly FileWithTags[], t: ReportStrings): string {
  if (files.length === 0) {
    return `\n  ${pc.yellow(t.noFilesMessage)}`;
  }
  const grouped = new Map<string, FileWithTags[]>();
  for (const f of files) {
    const ft = findTag(f.tags, "file_type") ?? "(none)";
    const list = grouped.get(ft) ?? [];
    list.push(f);
    grouped.set(ft, list);
  }
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

  const lines: string[] = [`\n  ${pc.bold(t.filesHeader(files.length))}`];
  let shown = 0;
  for (const ft of [...grouped.keys()].sort(
    (a, b) =>
      (order.indexOf(a) === -1 ? Number.MAX_SAFE_INTEGER : order.indexOf(a)) -
      (order.indexOf(b) === -1 ? Number.MAX_SAFE_INTEGER : order.indexOf(b)),
  )) {
    const list = grouped.get(ft);
    if (!list) continue;
    lines.push("");
    lines.push(`  ${pc.cyan(ft)} ${pc.dim(`(${list.length})`)}`);
    for (const f of list) {
      if (shown >= FILE_SHOW_LIMIT) {
        lines.push(`  ${pc.dim(t.moreSuffix(files.length - shown))}`);
        return lines.join("\n");
      }
      const agent = findTag(f.tags, "agent_type");
      const skill = findTag(f.tags, "skill_level");
      const ann = [agent, skill].filter(Boolean).join(", ");
      const suffix = ann ? ` ${pc.dim(`(${ann})`)}` : "";
      lines.push(`    ${f.path}${suffix}`);
      shown++;
    }
  }
  return lines.join("\n");
}

function profileLabels(report: MaturityReport): string {
  const traitLabels = report.profile.traits.map((trait) => {
    const tier =
      trait.tier === "high"
        ? pc.green(trait.tierTitle)
        : trait.tier === "medium"
          ? pc.yellow(trait.tierTitle)
          : pc.dim(trait.tierTitle);
    return `${trait.title}·${tier}`;
  });
  return [report.profile.primary.title, ...traitLabels].join(" / ");
}

export function renderTerminal(report: MaturityReport): string {
  const t = stringsFor(report.meta.lang);
  const d = report.dimensions;
  const dimPad = 21;
  return [
    "",
    `  ${pc.bold(t.title)}`,
    `  ${pc.dim(`${report.repo.root} @ ${shortSha(report.repo.headSha)}`)}`,
    `  ${pc.dim(`algorithm ${report.meta.algorithmVersion}`)}`,
    "",
    `  ${t.levelLabel}: ${pc.bold(levelColor(report.level))} ${levelTitleBadge(report.level, t.levelTitles[report.level])}    AMI: ${pc.bold(fmt(report.ami))}${pc.dim("/100")}    ${t.profileLabel}: ${pc.bold(profileLabels(report))}`,
    "",
    `  ${t.configurationDepth.padEnd(dimPad)}${bar(d.configuration_depth)} ${fmt(d.configuration_depth).padStart(5)}`,
    `  ${t.contextRichness.padEnd(dimPad)}${bar(d.context_richness)} ${fmt(d.context_richness).padStart(5)}`,
    `  ${t.integrationBreadth.padEnd(dimPad)}${bar(d.integration_breadth)} ${fmt(d.integration_breadth).padStart(5)}`,
    "",
    `  ${pc.dim(`${t.scannedAtLabel} ${report.repo.scannedAt}`)}`,
    metricsBlock(report.rawMetrics, report.normalizedMetrics, t),
    filesBlock(report.files, t),
    "",
  ].join("\n");
}
