// Path classification rules for AI maturity signals.
// Re-run `npm test` against the golden fixture whenever these rules change.

export interface Rule {
  kind: string;
  value: string;
  pattern: RegExp;
}

function rl(kind: string, value: string, pattern: string): Rule {
  return { kind, value, pattern: new RegExp(pattern, "i") };
}

// Order matters within each dimension: first match wins.
export const ALL_RULES: readonly Rule[] = [
  // ── file_type ────────────────────────────────────────────────────
  rl(
    "file_type",
    "instruction",
    String.raw`(^|/)(?:CLAUDE|AGENTS|GEMINI)\.md$|(^|/)copilot-instructions\.md$` +
      String.raw`|(^|/)rules/.*\.mdc?$|(^|/)\.?rules$|(^|/)\.(?:cursor|windsurf|cline)rules$` +
      String.raw`|(^|/)\.clinerules/.*\.md$`,
  ),
  rl("file_type", "skill", String.raw`(^|/)skills/.*/SKILL\.md$`),
  rl("file_type", "skill_resource", String.raw`(^|/)skills/.+$`),
  rl("file_type", "command", String.raw`(^|/)commands/.*\.md$|(^|/)\.codex/prompts/.*\.md$`),
  rl("file_type", "agent", String.raw`(^|/)(?:\.agent|agents)/.*\.md$`),
  rl("file_type", "spec", String.raw`(^|/)specs/.*\.md$`),
  rl("file_type", "hook", String.raw`(^|/)\.codex/hooks\.json$`),
  rl(
    "file_type",
    "config",
    String.raw`(^|/)\.claude/settings\.json$|(^|/)opencode\.json$|(^|/)\.opencode/config\.json$|` +
      String.raw`(^|/)\.codex/config\.toml$|(^|/)\.gemini/settings\.json$|(^|/)\.continue/config\.json$`,
  ),
  rl("file_type", "mcp", String.raw`(^|/)\.?mcp\.json$`),
  // ── agent_type ────────────────────────────────────────────────────
  rl(
    "agent_type",
    "claude",
    String.raw`(^|/)CLAUDE\.md$|(^|/)\.claude/.*\.md$|(^|/)\.claude/settings\.json$`,
  ),
  rl("agent_type", "codex", String.raw`(^|/)\.codex/`),
  rl("agent_type", "opencode", String.raw`(^|/)\.opencode/|(^|/)opencode\.json$`),
  rl("agent_type", "continue", String.raw`(^|/)\.continue/`),
  rl("agent_type", "roocode", String.raw`(^|/)\.roo/.*\.md$`),
  rl("agent_type", "trae", String.raw`(^|/)\.trae/.*\.md$`),
  rl("agent_type", "gemini", String.raw`(^|/)GEMINI\.md$|(^|/)\.gemini/`),
  rl("agent_type", "cline", String.raw`(^|/)\.clinerules$|(^|/)\.clinerules/.*\.md$`),
  rl("agent_type", "cursor", String.raw`(^|/)\.cursorrules$|(^|/)\.cursor/`),
  rl("agent_type", "windsurf", String.raw`(^|/)\.windsurfrules$|(^|/)\.windsurf/`),
  rl("agent_type", "qoder", String.raw`(^|/)\.qoder/`),
  rl("agent_type", "codebuddy", String.raw`(^|/)\.codebuddy/`),
  rl("agent_type", "copilot", String.raw`(^|/)copilot-instructions\.md$|(^|/)\.github/copilot/`),
  rl("agent_type", "generic_agent", String.raw`(^|/)\.agent/`),
] as const;

export const DIMENSIONS = ["file_type", "agent_type"] as const;

export const FILE_EXTENSION_RULE_VERSION = "1";
export const PROJECT_SCOPE_RULE_VERSION = "1";

const VALID_EXTENSION = /^[a-z0-9][a-z0-9_+-]*$/;

export function normalizePath(path: string): string {
  let normalized = path.replace(/\\/g, "/");
  while (normalized.startsWith("./")) {
    normalized = normalized.slice(2);
  }
  normalized = normalized.replace(/\/+/g, "/");
  if (normalized !== "/") {
    normalized = normalized.replace(/\/+$/, "");
  }
  return normalized;
}

export function classifyFileExtension(path: string): string {
  const filename = normalizePath(path).split("/").pop() ?? "";
  const lastDot = filename.lastIndexOf(".");
  if (lastDot <= 0) {
    // No dot, or dot at position 0 (hidden file with no extension) → "none"
    return "none";
  }
  const stem = filename.slice(0, lastDot);
  const extension = filename.slice(lastDot + 1);
  if (!stem || !extension) {
    return "none";
  }
  const normalized = extension.toLowerCase();
  if (normalized.length > 64 || !VALID_EXTENSION.test(normalized)) {
    return "other";
  }
  return normalized;
}

export function classifyProjectScope(path: string): "root" | "subproject" {
  const normalized = normalizePath(path);
  return normalized.includes("/") ? "subproject" : "root";
}
