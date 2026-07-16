import { basename } from "node:path";
import type { Lang } from "../i18n/index.ts";

export interface ImageReportData {
  repo: {
    root: string;
    remoteUrl?: string;
    headSha: string;
    scannedAt: string;
  };
  meta: {
    algorithmVersion: string;
    lang: Lang;
  };
  level: string;
  ami: number;
  dimensions: {
    configuration_depth: number;
    context_richness: number;
    integration_breadth: number;
  };
  normalizedMetrics: Record<string, number>;
  rawMetrics: {
    skillCount: number;
    skillResourceCount: number;
    agentCount: number;
    commandCount: number;
    mcpCount: number;
  };
  files: readonly unknown[];
}

export interface ImageSvgOptions {
  lang?: Lang;
  qrSvg?: string;
  redacted?: boolean;
}

const WIDTH = 1080;
const HEIGHT = 1920;

const copy = {
  en: {
    title: "Repository AI Maturity",
    level: "Level",
    scanReport: "Scan report",
    scanCta: "Scan to view my",
    scanCtaStrong: "repository AI maturity",
    scanNote: "Shareable report card",
    qrUnavailable: "QR unavailable",
    amiScore: "AMI score",
    aiFiles: "AI files",
    abilityApplied: "Ability applied",
    configurationDepth: "Configuration depth",
    contextRichness: "Context richness",
    integrationBreadth: "Integration breadth",
    repositoryHidden: "Repository hidden",
    algorithm: "Algorithm",
    metrics: {
      skill_count: "Skills",
      advanced_skill_count: "Advanced skills",
      agent_count: "Agents",
      command_count: "Commands",
      mcp_count: "MCP servers",
      ai_instruction_files: "Instructions",
      specs_file_count: "Spec files",
      subproject_coverage: "Coverage",
    },
  },
  zh: {
    title: "代码库 AI 成熟度",
    level: "等级",
    scanReport: "扫码查看",
    scanCta: "扫码查看我的",
    scanCtaStrong: "代码库 AI 成熟度",
    scanNote: "分享报告卡片",
    qrUnavailable: "无二维码",
    amiScore: "AMI 分数",
    aiFiles: "AI 文件",
    abilityApplied: "能力应用",
    configurationDepth: "配置深度",
    contextRichness: "上下文丰富度",
    integrationBreadth: "集成广度",
    repositoryHidden: "代码库地址已隐藏",
    algorithm: "算法",
    metrics: {
      skill_count: "技能",
      advanced_skill_count: "高级技能",
      agent_count: "代理",
      command_count: "命令",
      mcp_count: "MCP 服务",
      ai_instruction_files: "指令文件",
      specs_file_count: "规格文件",
      subproject_coverage: "覆盖率",
    },
  },
} as const;

function escapeXml(value: unknown): string {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function shortSha(value: string): string {
  return value ? value.slice(0, 8) : "unknown";
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

export function repoDisplayName(report: ImageReportData): string {
  const source = report.repo.remoteUrl ?? report.repo.root;
  const normalized = source.replace(/\/+$/, "").replace(/\.git$/i, "");
  const segment = normalized.split(/[/:]/).filter(Boolean).at(-1);
  return segment || basename(report.repo.root);
}

function svgText(
  value: unknown,
  x: number,
  y: number,
  opts: {
    size?: number;
    weight?: number;
    fill?: string;
    anchor?: "start" | "middle" | "end";
    opacity?: number;
  } = {},
): string {
  const { size = 26, weight = 500, fill = "#182133", anchor = "start", opacity = 1 } = opts;
  const family =
    "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";
  return `<text x="${x}" y="${y}" font-family="${family}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}" opacity="${opacity}">${escapeXml(value)}</text>`;
}

function truncate(value: string, maxLength: number): string {
  return value.length > maxLength ? `${value.slice(0, maxLength - 3)}...` : value;
}

function levelBadgeColor(level: string): string {
  switch (level) {
    case "L0":
      return "#e05d44";
    case "L1":
      return "#fe7d37";
    case "L2":
      return "#dfb317";
    case "L3":
      return "#4c1";
    case "L4":
      return "#007ec6";
    default:
      return "#9f9f9f";
  }
}

function levelBadge(level: string, x: number, y: number): string {
  const label = "AI Maturity";
  const labelWidth = 164;
  const valueWidth = 118;
  const height = 58;
  const radius = 8;

  return `
    <g role="img" aria-label="${escapeXml(`${label} badge ${level}`)}">
      <rect x="${x}" y="${y}" width="${labelWidth + valueWidth}" height="${height}" rx="${radius}" fill="#555"/>
      <path d="M ${x + labelWidth} ${y} h ${valueWidth - radius} a ${radius} ${radius} 0 0 1 ${radius} ${radius} v ${height - 2 * radius} a ${radius} ${radius} 0 0 1 -${radius} ${radius} h -${valueWidth} z" fill="${levelBadgeColor(level)}"/>
      <path d="M ${x + labelWidth - 1} ${y} v ${height} h 1 v -${height} z" fill="#000" opacity="0.12"/>
      ${svgText(label, x + labelWidth / 2, y + 38, { size: 24, weight: 750, fill: "#ffffff", anchor: "middle" })}
      ${svgText(level, x + labelWidth + valueWidth / 2, y + 40, { size: 31, weight: 900, fill: "#ffffff", anchor: "middle" })}
    </g>
  `;
}

function statCard(label: string, value: string, x: number, y: number, width = 285): string {
  return `
    <rect x="${x}" y="${y}" width="${width}" height="138" rx="24" fill="#ffffff" stroke="#d8dee8"/>
    ${svgText(label, x + 28, y + 48, { size: 23, weight: 650, fill: "#667085" })}
    ${svgText(value, x + 28, y + 104, { size: 46, weight: 850, fill: "#111827" })}
  `;
}

function bar(label: string, value: number, x: number, y: number, width: number): string {
  const score = clamp(Number(value) || 0, 0, 100);
  const fillWidth = Math.round((width * score) / 100);
  return `
    ${svgText(label, x, y, { size: 22, weight: 700, fill: "#253247" })}
    ${svgText(score.toFixed(1), x + width, y, { size: 22, weight: 700, fill: "#253247", anchor: "end" })}
    <rect x="${x}" y="${y + 22}" width="${width}" height="22" rx="11" fill="#e8edf5"/>
    <rect x="${x}" y="${y + 22}" width="${fillWidth}" height="22" rx="11" fill="#276ef1"/>
  `;
}

function metricPills(report: ImageReportData, labels: Record<string, string>): string {
  return Object.entries(labels)
    .map(([key, label], index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      const x = 88 + col * 460;
      const y = 1226 + row * 98;
      const value = Math.round(report.normalizedMetrics[key] ?? 0);
      const score = clamp(value, 0, 100);
      const barWidth = 362;
      const fillWidth = Math.round((barWidth * score) / 100);
      return `
        <rect x="${x}" y="${y}" width="412" height="82" rx="22" fill="#eef3fb"/>
        ${svgText(label, x + 24, y + 38, { size: 25, weight: 650, fill: "#44546a" })}
        ${svgText(score, x + 380, y + 38, { size: 25, weight: 850, fill: "#182133", anchor: "end" })}
        <rect x="${x + 24}" y="${y + 54}" width="${barWidth}" height="10" rx="5" fill="#dbe5f1"/>
        <rect x="${x + 24}" y="${y + 54}" width="${fillWidth}" height="10" rx="5" fill="#276ef1"/>
      `;
    })
    .join("");
}

function qrPlaceholder(label: string, x: number, y: number, size: number): string {
  return `
    <rect x="${x}" y="${y}" width="${size}" height="${size}" rx="24" fill="#f1f5f9" stroke="#d8dee8" stroke-dasharray="10 10"/>
    ${svgText(label, x + size / 2, y + size / 2 + 8, { size: 22, weight: 750, fill: "#7a8797", anchor: "middle" })}
  `;
}

function embedQr(qrSvg: string | undefined, t: (typeof copy)[Lang], x: number, y: number): string {
  const size = 150;
  if (!qrSvg) return qrPlaceholder(t.qrUnavailable, x, y, size);
  const inner = qrSvg
    .replace(/<\?xml[^>]*>/g, "")
    .replace(/<!DOCTYPE[^>]*>/g, "")
    .replace("<svg", `<svg x="${x}" y="${y}" width="${size}" height="${size}"`);
  return `
    ${inner}
    ${svgText(t.scanReport, x + size / 2, y + size + 36, { size: 21, weight: 750, fill: "#667085", anchor: "middle" })}
  `;
}

export function renderImageSvg(report: ImageReportData, opts: ImageSvgOptions = {}): string {
  const lang = opts.lang ?? report.meta.lang;
  const t = copy[lang];
  const name = opts.redacted ? t.repositoryHidden : repoDisplayName(report);
  const repo = truncate(name, 34);
  const raw = report.rawMetrics;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f7fafc"/>
      <stop offset="54%" stop-color="#edf4ff"/>
      <stop offset="100%" stop-color="#f8fbf4"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="18" stdDeviation="20" flood-color="#182133" flood-opacity="0.14"/>
    </filter>
  </defs>

  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>
  <rect x="52" y="54" width="976" height="1812" rx="42" fill="#ffffff" filter="url(#shadow)"/>
  <rect x="52" y="54" width="976" height="1812" rx="42" fill="none" stroke="#d9e1ec"/>

  ${svgText(t.title, 88, 150, { size: 52, weight: 900, fill: "#111827" })}
  ${svgText(repo, 88, 214, { size: 34, weight: 750, fill: opts.redacted ? "#b42318" : "#44546a" })}
  ${svgText(`${t.algorithm} ${report.meta.algorithmVersion} · ${formatDate(report.repo.scannedAt)} · ${shortSha(report.repo.headSha)}`, 88, 266, { size: 25, weight: 650, fill: "#7a8797" })}

  <rect x="88" y="334" width="904" height="304" rx="34" fill="#182133"/>
  ${svgText(t.amiScore, 132, 414, { size: 30, weight: 750, fill: "#b9c7dc" })}
  ${svgText(report.ami.toFixed(1), 132, 550, { size: 112, weight: 900, fill: "#ffffff" })}
  ${levelBadge(report.level, 676, 456)}

  ${statCard(t.aiFiles, String(report.files.length), 88, 704)}
  ${statCard(t.abilityApplied, String(raw.skillCount + raw.skillResourceCount + raw.agentCount + raw.commandCount + raw.mcpCount), 397, 704)}
  ${statCard(t.amiScore, report.ami.toFixed(1), 706, 704)}

  ${bar(t.configurationDepth, report.dimensions.configuration_depth, 88, 916, 904)}
  ${bar(t.contextRichness, report.dimensions.context_richness, 88, 1010, 904)}
  ${bar(t.integrationBreadth, report.dimensions.integration_breadth, 88, 1104, 904)}

  ${metricPills(report, t.metrics)}

  <rect x="88" y="1640" width="904" height="196" rx="30" fill="#f8fafc" stroke="#d8dee8"/>
  ${embedQr(opts.qrSvg, t, 122, 1663)}
  ${svgText(t.scanCta, 324, 1704, { size: 30, weight: 750, fill: "#44546a" })}
  ${svgText(t.scanCtaStrong, 324, 1756, { size: 40, weight: 900, fill: "#111827" })}
  ${svgText(t.scanNote, 324, 1800, { size: 23, weight: 650, fill: "#7a8797" })}
</svg>`;
}
