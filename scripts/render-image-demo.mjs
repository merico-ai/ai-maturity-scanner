import { mkdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import QRCode from "qrcode";
import sharp from "sharp";
import { buildReport } from "../dist/cli.js";

const WIDTH = 1200;
const HEIGHT = 780;
const OUT_DIR = resolve("demo-output");
const QR_TARGET = "https://github.com/merico-ai/ai-maturity-scanner";

const copy = {
  en: {
    title: "AI Maturity Report",
    level: "Level",
    scanReport: "Scan report",
    amiScore: "AMI score",
    aiFiles: "AI files",
    abilityApplied: "Ability applied",
    configurationDepth: "Configuration depth",
    contextRichness: "Context richness",
    integrationBreadth: "Integration breadth",
    fullVariant: "Full sharing variant",
    redactedVariant: "Redacted sharing variant",
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
    title: "AI 成熟度报告",
    level: "等级",
    scanReport: "扫码查看",
    amiScore: "AMI 分数",
    aiFiles: "AI 文件",
    abilityApplied: "能力应用",
    configurationDepth: "配置深度",
    contextRichness: "上下文丰富度",
    integrationBreadth: "集成广度",
    fullVariant: "完整分享版本",
    redactedVariant: "脱敏分享版本",
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
};

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function shortSha(value) {
  return value ? value.slice(0, 8) : "unknown";
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

function repoAddress(report, redacted, t) {
  if (redacted) return t.repositoryHidden;
  return report.repo.url ?? report.repo.root;
}

function svgText(value, x, y, opts = {}) {
  const {
    size = 26,
    weight = 500,
    fill = "#182133",
    anchor = "start",
    opacity = 1,
    family = "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
  } = opts;
  return `<text x="${x}" y="${y}" font-family="${family}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}" opacity="${opacity}">${escapeXml(value)}</text>`;
}

function statCard(label, value, x, y, width = 205) {
  return `
    <rect x="${x}" y="${y}" width="${width}" height="112" rx="18" fill="#ffffff" stroke="#d8dee8"/>
    ${svgText(label, x + 22, y + 38, { size: 20, weight: 650, fill: "#667085" })}
    ${svgText(value, x + 22, y + 84, { size: 38, weight: 800, fill: "#111827" })}
  `;
}

function bar(label, value, x, y, width) {
  const score = clamp(Number(value) || 0, 0, 100);
  const fillWidth = Math.round((width * score) / 100);
  return `
    ${svgText(label, x, y, { size: 22, weight: 700, fill: "#253247" })}
    ${svgText(score.toFixed(1), x + width, y, { size: 22, weight: 700, fill: "#253247", anchor: "end" })}
    <rect x="${x}" y="${y + 18}" width="${width}" height="16" rx="8" fill="#e8edf5"/>
    <rect x="${x}" y="${y + 18}" width="${fillWidth}" height="16" rx="8" fill="#276ef1"/>
  `;
}

function metricPills(report, labels) {
  return Object.entries(labels)
    .map(([key, label], index) => {
      const col = index % 4;
      const row = Math.floor(index / 4);
      const x = 74 + col * 255;
      const y = 536 + row * 70;
      const value = Math.round(report.normalizedMetrics[key] ?? 0);
      return `
        <rect x="${x}" y="${y}" width="225" height="48" rx="24" fill="#eef3fb"/>
        ${svgText(label, x + 20, y + 31, { size: 18, weight: 650, fill: "#44546a" })}
        ${svgText(value, x + 202, y + 31, { size: 18, weight: 800, fill: "#182133", anchor: "end" })}
      `;
    })
    .join("");
}

function embedQr(qrSvg, t) {
  const inner = qrSvg
    .replace(/<\?xml[^>]*>/g, "")
    .replace(/<!DOCTYPE[^>]*>/g, "")
    .replace("<svg", '<svg x="970" y="102" width="130" height="130"');
  return `
    <rect x="944" y="76" width="182" height="214" rx="24" fill="#ffffff" stroke="#d8dee8"/>
    ${inner}
    ${svgText(t.scanReport, 1035, 260, { size: 18, weight: 750, fill: "#667085", anchor: "middle" })}
  `;
}

function renderSvg(report, qrSvg, { lang = "en", redacted = false } = {}) {
  const t = copy[lang] ?? copy.en;
  const address = repoAddress(report, redacted, t);
  const repo = address.length > 62 ? `${address.slice(0, 59)}...` : address;
  const fileCount = report.files.length;
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
  <rect x="48" y="48" width="1104" height="684" rx="34" fill="#ffffff" filter="url(#shadow)"/>
  <rect x="48" y="48" width="1104" height="684" rx="34" fill="none" stroke="#d9e1ec"/>

  ${svgText(t.title, 74, 112, { size: 34, weight: 850, fill: "#111827" })}
  ${svgText(repo, 74, 154, { size: 22, weight: 600, fill: redacted ? "#b42318" : "#586577" })}
  ${svgText(`${t.algorithm} ${report.meta.algorithmVersion} · ${formatDate(report.repo.scannedAt)} · ${shortSha(report.repo.headSha)}`, 74, 188, { size: 18, weight: 600, fill: "#7a8797" })}

  <circle cx="841" cy="142" r="64" fill="#182133"/>
  ${svgText(report.level, 841, 159, { size: 44, weight: 900, fill: "#ffffff", anchor: "middle" })}
  ${svgText(t.level, 841, 225, { size: 18, weight: 750, fill: "#667085", anchor: "middle" })}
  ${embedQr(qrSvg, t)}

  ${statCard(t.amiScore, report.ami.toFixed(1), 74, 250)}
  ${statCard(t.aiFiles, String(fileCount), 302, 250)}
  ${statCard(t.abilityApplied, String(raw.skillCount + raw.skillResourceCount + raw.agentCount + raw.commandCount + raw.mcpCount), 530, 250)}

  ${bar(t.configurationDepth, report.dimensions.configuration_depth, 74, 420, 300)}
  ${bar(t.contextRichness, report.dimensions.context_richness, 450, 420, 300)}
  ${bar(t.integrationBreadth, report.dimensions.integration_breadth, 826, 420, 300)}

  ${metricPills(report, t.metrics)}

  ${svgText(redacted ? t.redactedVariant : t.fullVariant, 74, 700, { size: 18, weight: 750, fill: redacted ? "#b42318" : "#667085" })}
</svg>`;
}

async function writePng(fileName, svg) {
  const outputPath = join(OUT_DIR, fileName);
  await sharp(Buffer.from(svg)).png().toFile(outputPath);
  return outputPath;
}

async function main() {
  const langArgIndex = process.argv.indexOf("--lang");
  const lang = langArgIndex >= 0 ? process.argv[langArgIndex + 1] : "en";
  if (!["en", "zh"].includes(lang)) {
    throw new Error("--lang must be en or zh");
  }
  const pathArg = process.argv.find((arg, index) => index > 1 && arg !== "--lang" && process.argv[index - 1] !== "--lang");
  const repoRoot = resolve(pathArg ?? ".");
  const report = await buildReport(repoRoot, { lang });
  const qrSvg = await QRCode.toString(QR_TARGET, {
    type: "svg",
    margin: 0,
    color: {
      dark: "#182133",
      light: "#ffffff",
    },
  });

  await mkdir(OUT_DIR, { recursive: true });

  const full = await writePng(`ai-maturity-report-${lang}-full.png`, renderSvg(report, qrSvg, { lang }));
  const redacted = await writePng(
    `ai-maturity-report-${lang}-redacted.png`,
    renderSvg(report, qrSvg, { lang, redacted: true }),
  );

  console.log(`Wrote ${full}`);
  console.log(`Wrote ${redacted}`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
