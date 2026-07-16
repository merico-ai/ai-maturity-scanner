// Path classification rules for AI maturity signals.
// Re-run `npm test` against the golden fixture whenever these rules change.

import { Minimatch } from "minimatch";

export interface Rule {
  kind: string;
  value: string;
  /** Returns true when this rule matches a normalized (forward-slash) path. */
  test: (normalizedPath: string) => boolean;
}

function rl(kind: string, value: string, pattern: string): Rule {
  const re = new RegExp(pattern, "i");
  return { kind, value, test: (p: string) => re.test(p) };
}

// Default glob(s) matching spec documents. Reproduces the legacy fixed-dir
// regex `(^|/)specs/.*\.md$` (specs dir at any depth, Markdown only, dotfiles
// included). Overridable via the `--spec-glob` flag / config file.
export const DEFAULT_SPEC_GLOBS = ["**/specs/**/*.md"] as const;

/**
 * Build the `file_type=spec` rule from a set of globs.
 * Returns null when no globs are configured (spec never matches).
 */
export function buildSpecRule(specGlobs: readonly string[]): Rule | null {
  if (specGlobs.length === 0) return null;
  const matchers = specGlobs.map((g) => new Minimatch(g, { dot: true }));
  return {
    kind: "file_type",
    value: "spec",
    test: (p: string) => matchers.some((m) => m.match(p)),
  };
}

// Order matters within each dimension: first match wins. The spec rule is
// injected by `buildRules` between the HEAD and TAIL file_type groups below.

const FILE_TYPE_RULES_BEFORE_SPEC: readonly Rule[] = [
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
];

const FILE_TYPE_RULES_AFTER_SPEC: readonly Rule[] = [
  rl("file_type", "hook", String.raw`(^|/)\.codex/hooks\.json$`),
  rl(
    "file_type",
    "config",
    String.raw`(^|/)\.claude/settings\.json$|(^|/)opencode\.json$|(^|/)\.opencode/config\.json$|` +
      String.raw`(^|/)\.codex/config\.toml$|(^|/)\.gemini/settings\.json$|(^|/)\.continue/config\.json$`,
  ),
  rl("file_type", "mcp", String.raw`(^|/)\.?mcp\.json$`),
];

const AGENT_TYPE_RULES: readonly Rule[] = [
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
];

/**
 * Assemble the full rule set for a scan, with the spec rule built from
 * `specGlobs`. Defaults to {@link DEFAULT_SPEC_GLOBS} so callers with no
 * configured globs keep the legacy behavior.
 */
export function buildRules(specGlobs: readonly string[] = DEFAULT_SPEC_GLOBS): readonly Rule[] {
  const specRule = buildSpecRule(specGlobs);
  return [
    ...FILE_TYPE_RULES_BEFORE_SPEC,
    ...(specRule ? [specRule] : []),
    ...FILE_TYPE_RULES_AFTER_SPEC,
    ...AGENT_TYPE_RULES,
  ];
}

/** Rule set using {@link DEFAULT_SPEC_GLOBS} — the legacy classification behavior. */
export const DEFAULT_RULES: readonly Rule[] = buildRules();

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
