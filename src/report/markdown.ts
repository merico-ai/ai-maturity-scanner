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

function metricsSections(raw: MaturityRawMetrics, normalized: Record<string, number>): string {
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
    "### Configuration depth — Skill class",
    skill,
    "",
    "### Configuration depth — Agent class",
    agent,
    "",
    "### Configuration depth — Command class",
    command,
    "",
    "### Configuration depth — MCP class",
    mcp,
    "",
    "### Context richness — Instruction",
    instruction,
    "",
    "### Context richness — Specs",
    specs,
    "",
    "### Integration breadth",
    integration,
    "",
    `_agent_type_distinct (helper, not in AMI): ${raw.agentTypeDistinct}_`,
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

function filesSection(files: readonly FileWithTags[]): string {
  if (files.length === 0) return "## Files\n\n_No AI-related files detected._";
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

  const lines: string[] = [`## Files (${files.length} total)`];
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
    lines.push(`_… truncated, showing first ${FILE_SHOW_LIMIT} of ${files.length} files._`);
  }
  return lines.join("\n");
}

export function renderMarkdown(report: MaturityReport): string {
  const d = report.dimensions;
  return [
    "# AI Maturity Report",
    "",
    `**Repo:** \`${report.repo.root}\`  `,
    `**HEAD:** \`${report.repo.headSha}\`  `,
    `**Scanned at:** ${report.repo.scannedAt}`,
    "",
    "## Overall",
    "",
    `**Level:** ${report.level}  `,
    `**AMI:** ${fmt(report.ami)} / 100`,
    "",
    "| Dimension | Score |",
    "| --- | ---: |",
    `| Configuration depth | ${fmt(d.configuration_depth)} |`,
    `| Context richness | ${fmt(d.context_richness)} |`,
    `| Integration breadth | ${fmt(d.integration_breadth)} |`,
    "",
    "## Metrics",
    "",
    metricsSections(report.rawMetrics, report.normalizedMetrics),
    "",
    filesSection(report.files),
    "",
  ].join("\n");
}
