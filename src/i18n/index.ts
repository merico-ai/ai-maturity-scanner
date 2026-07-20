// Report-text internationalization.
//
// Only user-facing report text is translated. CLI prompts, error messages,
// rule names, and tag values (e.g. `file_type=instruction`) stay in their
// canonical form regardless of language.

import type { ProfileLabelId } from "../metrics/profile.ts";

export type Lang = "zh" | "en";

export const LANGS: readonly Lang[] = ["zh", "en"] as const;

export const DEFAULT_LANG: Lang = "zh";

export function isLang(value: string): value is Lang {
  return (LANGS as readonly string[]).includes(value);
}

export interface ReportStrings {
  title: string;
  repoLabel: string;
  headLabel: string;
  scannedAtLabel: string;
  algorithmVersionLabel: string;
  overallSection: string;
  levelLabel: string;
  levelTitles: Record<"L0" | "L1" | "L2" | "L3" | "L4", string>;
  profileLabel: string;
  profileTitles: Record<ProfileLabelId, string>;
  dimensionHeader: string;
  scoreHeader: string;
  configurationDepth: string;
  contextRichness: string;
  integrationBreadth: string;
  metricsSection: string;
  skillClass: string;
  agentClass: string;
  commandClass: string;
  mcpClass: string;
  instruction: string;
  specs: string;
  integration: string;
  helperLabel: (n: number) => string;
  filesHeader: (count: number) => string;
  noFilesMessage: string;
  truncatedMessage: (shown: number, total: number) => string;
  moreSuffix: (count: number) => string;
}

const en: ReportStrings = {
  title: "AI Maturity Report",
  repoLabel: "Repo",
  headLabel: "HEAD",
  scannedAtLabel: "Scanned at",
  algorithmVersionLabel: "Algorithm version",
  overallSection: "Overall",
  levelLabel: "Level",
  levelTitles: {
    L0: "Not Started",
    L1: "Beginner",
    L2: "Improving",
    L3: "Proficient",
    L4: "Expert",
  },
  profileLabel: "Profile",
  profileTitles: {
    unstarted: "Awaiting Start",
    "early-collaboration": "Collaboration Seedling",
    "ai-operating-system": "AI Collaboration Hub",
    "skill-workshop": "Skill Workshop",
    "agent-troupe": "Agent Troupe",
    "command-center": "Command Center",
    "knowledge-library": "Knowledge Library",
    "engineered-skills": "Engineered Skills",
    "multi-agent": "Multi-Agent Collaboration",
    "tool-connected": "Deep Tool Connectivity",
    "structured-context": "Structured Context",
    "cross-project": "Cross-Project Coverage",
  },
  dimensionHeader: "Dimension",
  scoreHeader: "Score",
  configurationDepth: "Configuration depth",
  contextRichness: "Context richness",
  integrationBreadth: "Integration breadth",
  metricsSection: "Metrics",
  skillClass: "Skill class",
  agentClass: "Agent class",
  commandClass: "Command class",
  mcpClass: "MCP class",
  instruction: "Instruction",
  specs: "Specs",
  integration: "Integration",
  helperLabel: (n) => `agent_type_distinct (helper, not in AMI): ${n}`,
  filesHeader: (count) => `Files (${count} total)`,
  noFilesMessage: "No AI-related files detected.",
  truncatedMessage: (shown, total) => `… truncated, showing first ${shown} of ${total} files.`,
  moreSuffix: (count) => `… +${count} more`,
};

const zh: ReportStrings = {
  title: "AI 成熟度报告",
  repoLabel: "仓库",
  headLabel: "HEAD",
  scannedAtLabel: "扫描时间",
  algorithmVersionLabel: "算法版本",
  overallSection: "总览",
  levelLabel: "等级",
  levelTitles: {
    L0: "一窍不通",
    L1: "初学乍练",
    L2: "渐入佳境",
    L3: "驾轻就熟",
    L4: "炉火纯青",
  },
  profileLabel: "协作画像",
  profileTitles: {
    unstarted: "静待启程",
    "early-collaboration": "协作萌芽",
    "ai-operating-system": "AI 协作中枢",
    "skill-workshop": "技能工坊",
    "agent-troupe": "多代理剧团",
    "command-center": "命令指挥台",
    "knowledge-library": "上下文图书馆",
    "engineered-skills": "能力工程化",
    "multi-agent": "多代理协作",
    "tool-connected": "工具深连",
    "structured-context": "上下文成册",
    "cross-project": "跨项目覆盖",
  },
  dimensionHeader: "维度",
  scoreHeader: "分数",
  configurationDepth: "配置深度",
  contextRichness: "上下文丰富度",
  integrationBreadth: "集成广度",
  metricsSection: "指标",
  skillClass: "Skill 类",
  agentClass: "Agent 类",
  commandClass: "Command 类",
  mcpClass: "MCP 类",
  instruction: "指令",
  specs: "规范",
  integration: "集成",
  helperLabel: (n) => `agent_type_distinct（辅助指标，不计入 AMI）：${n}`,
  filesHeader: (count) => `文件（共 ${count} 个）`,
  noFilesMessage: "未检测到 AI 相关文件。",
  truncatedMessage: (shown, total) => `… 已截断，显示前 ${shown} / 共 ${total} 个文件。`,
  moreSuffix: (count) => `… 另有 ${count} 个`,
};

export const STRINGS: Record<Lang, ReportStrings> = { zh, en };

export function stringsFor(lang: Lang): ReportStrings {
  return STRINGS[lang] ?? STRINGS[DEFAULT_LANG];
}
