import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { parse as parseToml } from "smol-toml";
import { normalizePath } from "../rules/patterns.ts";

const CLAUDE_CODE_MCP_CONFIGS = new Set([".mcp.json", "mcp.json"]);
const CODEX_MCP_CONFIG = ".codex/config.toml";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function uniqueServerNames(value: unknown): string[] {
  if (!isRecord(value)) return [];

  const names = new Set<string>();
  for (const name of Object.keys(value)) {
    const trimmed = name.trim();
    if (trimmed) names.add(trimmed);
  }
  return [...names];
}

export function extractClaudeCodeMcpServerNames(source: string): string[] {
  try {
    const parsed = JSON.parse(source) as unknown;
    return isRecord(parsed) ? uniqueServerNames(parsed.mcpServers) : [];
  } catch {
    return [];
  }
}

export function extractCodexMcpServerNames(source: string): string[] {
  try {
    const parsed = parseToml(source) as unknown;
    return isRecord(parsed) ? uniqueServerNames(parsed.mcp_servers) : [];
  } catch {
    return [];
  }
}

export async function readMcpServerNames(
  repoRoot: string,
  relativePath: string,
): Promise<string[] | undefined> {
  const normalizedPath = normalizePath(relativePath);
  const isClaudeConfig = CLAUDE_CODE_MCP_CONFIGS.has(normalizedPath);
  const isCodexConfig = normalizedPath === CODEX_MCP_CONFIG;
  if (!isClaudeConfig && !isCodexConfig) {
    return undefined;
  }

  try {
    const source = await readFile(join(repoRoot, relativePath), "utf8");
    return isClaudeConfig
      ? extractClaudeCodeMcpServerNames(source)
      : extractCodexMcpServerNames(source);
  } catch {
    return [];
  }
}
