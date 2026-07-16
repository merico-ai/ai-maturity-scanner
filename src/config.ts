// Loads optional scan configuration from the repository root.
//
// Today only `specGlobs` is supported; the shape is intentionally minimal and
// forward-compatible. Loading is lenient: a missing file or a malformed value
// never fails a scan — it logs a warning and falls back to defaults.

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { DEFAULT_SPEC_GLOBS } from "./rules/patterns.ts";

export interface ScannerConfig {
  /** Globs selecting spec documents; overrides the built-in default spec glob. */
  specGlobs?: string[];
}

export const CONFIG_FILENAME = ".ai-maturity-scanner.json";

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((v) => typeof v === "string");
}

/**
 * Read `<repoRoot>/.ai-maturity-scanner.json` if present.
 *
 * Returns `{}` when the file is missing. Malformed JSON, a non-object root,
 * or an invalid `specGlobs` shape log a warning to stderr and return `{}`,
 * so a broken config never aborts the scan.
 */
export async function loadConfig(repoRoot: string): Promise<ScannerConfig> {
  let raw: string;
  try {
    raw = await readFile(join(repoRoot, CONFIG_FILENAME), "utf8");
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return {};
    throw err;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    console.error(
      `warning: ${CONFIG_FILENAME} is not valid JSON; ignoring (${err instanceof Error ? err.message : String(err)}).`,
    );
    return {};
  }

  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    console.error(`warning: ${CONFIG_FILENAME} must be a JSON object; ignoring.`);
    return {};
  }

  const config: ScannerConfig = {};
  const obj = parsed as Record<string, unknown>;
  if (obj.specGlobs !== undefined) {
    if (isStringArray(obj.specGlobs)) {
      config.specGlobs = obj.specGlobs;
    } else {
      console.error(
        `warning: ${CONFIG_FILENAME} 'specGlobs' must be an array of strings; ignoring.`,
      );
    }
  }
  return config;
}

/**
 * Resolve the effective spec globs.
 *
 * Precedence: CLI flags (non-empty) override the config file, which overrides
 * the built-in default spec glob.
 */
export function resolveSpecGlobs(
  configGlobs: readonly string[] | undefined,
  cliGlobs: readonly string[] = [],
): readonly string[] {
  if (cliGlobs.length > 0) return cliGlobs;
  if (configGlobs && configGlobs.length > 0) return configGlobs;
  return DEFAULT_SPEC_GLOBS;
}
