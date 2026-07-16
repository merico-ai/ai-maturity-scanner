import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { Command } from "commander";
import { loadConfig, resolveSpecGlobs } from "./config.ts";
import {
  checkIsGitRepo,
  getHeadSha,
  getRemoteUrl,
  getRepoRoot,
  isGitInstalled,
} from "./git/workspace.ts";
import { DEFAULT_LANG, LANGS, isLang } from "./i18n/index.ts";
import type { Lang } from "./i18n/index.ts";
import { aggregateRawMetrics } from "./metrics/aggregate.ts";
import { determineLevel, scoreAmi } from "./metrics/score.ts";
import { ALGORITHM_VERSION } from "./metrics/types.ts";
import {
  PNG_FINGERPRINT_KEYWORD,
  PNG_IMAGE_HASH_KEYWORD,
  imagePixelHash,
  readPngTextChunk,
  renderImagePng,
} from "./report/image.ts";
import { renderJson } from "./report/json.ts";
import { renderMarkdown } from "./report/markdown.ts";
import { renderTerminal } from "./report/terminal.ts";
import type { MaturityReport } from "./report/types.ts";
import { collectFiles } from "./scan/collect.ts";

export type TextFormat = "terminal" | "md" | "json";
export type Format = TextFormat | "png";

export const FORMATS: readonly Format[] = ["png", "terminal", "md", "json"] as const;
export const TEXT_FORMATS: readonly TextFormat[] = ["terminal", "md", "json"] as const;

export function isFormat(value: string): value is Format {
  return (FORMATS as readonly string[]).includes(value);
}

function isTextFormat(value: Format): value is TextFormat {
  return (TEXT_FORMATS as readonly string[]).includes(value);
}

export class UserError extends Error {
  constructor(
    message: string,
    readonly exitCode: number,
  ) {
    super(message);
    this.name = "UserError";
  }
}

const SHA256_RE = /^[a-f0-9]{64}$/i;

export interface BuildReportOptions {
  lang?: Lang;
  /** CLI-provided spec globs; override the config file when non-empty. */
  specGlobs?: readonly string[];
}

export async function buildReport(
  repoRoot: string,
  opts: BuildReportOptions = {},
): Promise<MaturityReport> {
  const headSha = await getHeadSha(repoRoot);
  const remoteUrl = await getRemoteUrl(repoRoot);
  const cfg = await loadConfig(repoRoot);
  const specGlobs = resolveSpecGlobs(cfg.specGlobs, opts.specGlobs ?? []);
  const files = await collectFiles(repoRoot, { specGlobs });

  const metrics = aggregateRawMetrics(files);
  const { ami, dimensions, normalizedMetrics } = scoreAmi(metrics);
  const level = determineLevel(metrics);

  return {
    repo: { root: repoRoot, remoteUrl, headSha, scannedAt: new Date().toISOString() },
    meta: { algorithmVersion: ALGORITHM_VERSION, lang: opts.lang ?? DEFAULT_LANG },
    level,
    ami,
    dimensions: {
      configuration_depth: dimensions.configurationDepth,
      context_richness: dimensions.contextRichness,
      integration_breadth: dimensions.integrationBreadth,
    },
    normalizedMetrics,
    rawMetrics: metrics,
    files,
  };
}

export function renderReport(report: MaturityReport, format: TextFormat): string {
  if (format === "json") return renderJson(report);
  if (format === "md") return renderMarkdown(report);
  return renderTerminal(report);
}

async function run(
  target: string,
  opts: { format: Format; out?: string; lang: Lang; redacted?: boolean; specGlobs?: string[] },
): Promise<void> {
  if (!(await isGitInstalled())) {
    throw new UserError("git not found on PATH", 3);
  }

  const cwd = resolve(target);
  if (!(await checkIsGitRepo(cwd))) {
    throw new UserError(`${cwd} is not a git repository`, 2);
  }

  const root = await getRepoRoot(cwd);
  const report = await buildReport(root, { lang: opts.lang, specGlobs: opts.specGlobs });

  if (isTextFormat(opts.format)) {
    const output = renderReport(report, opts.format);
    if (opts.out) {
      await writeFile(resolve(opts.out), output, "utf8");
    } else {
      process.stdout.write(output);
    }
    return;
  }

  const outputPath = resolve(opts.out ?? "ai-maturity-report.png");
  const output = await renderImagePng(report, {
    lang: opts.lang,
    redacted: opts.redacted,
  });
  await writeFile(outputPath, output);
  process.stdout.write(`AI maturity report generated at: ${outputPath}\n`);
}

async function verifyImage(file: string): Promise<void> {
  const imagePath = resolve(file);
  const png = await readFile(imagePath);
  const storedImageHash = readPngTextChunk(png, PNG_IMAGE_HASH_KEYWORD);
  const fingerprint = readPngTextChunk(png, PNG_FINGERPRINT_KEYWORD);

  if (!storedImageHash) {
    throw new UserError(`no ${PNG_IMAGE_HASH_KEYWORD} metadata found in ${imagePath}`, 1);
  }
  if (!SHA256_RE.test(storedImageHash)) {
    throw new UserError(`invalid ${PNG_IMAGE_HASH_KEYWORD} metadata in ${imagePath}`, 1);
  }
  const actualImageHash = await imagePixelHash(png);
  if (actualImageHash !== storedImageHash) {
    throw new UserError(`image hash mismatch for ${imagePath}`, 1);
  }

  if (!fingerprint) {
    throw new UserError(`no ${PNG_FINGERPRINT_KEYWORD} metadata found in ${imagePath}`, 1);
  }
  if (!SHA256_RE.test(fingerprint)) {
    throw new UserError(`invalid ${PNG_FINGERPRINT_KEYWORD} metadata in ${imagePath}`, 1);
  }
  process.stdout.write("Fingerprint verified.\n");
}

// Commander coercion: collect repeated `--spec-glob` values into an array.
function appendSpecGlob(value: string, previous: string[]): string[] {
  return previous.concat(value);
}

const program = new Command();

program
  .name("ai-maturity-scanner")
  .description("Scan a code repository and report its AI coding maturity (L0-L4 + AMI score).")
  .argument("[path]", "repository path to scan", process.cwd())
  .option("-f, --format <format>", "output format: png | terminal | md | json", "png")
  .option("-l, --lang <lang>", "report language: zh | en", DEFAULT_LANG)
  .option("-o, --out <file>", "write report file path")
  .option("--redacted", "redact repository address in png output")
  .option(
    "-g, --spec-glob <glob>",
    "glob matching spec files (repeatable); overrides .ai-maturity-scanner.json",
    appendSpecGlob,
    [],
  )
  .action(
    async (
      path: string,
      opts: {
        format: string;
        lang: string;
        out?: string;
        redacted?: boolean;
        specGlob?: string[];
      },
    ) => {
      if (!isFormat(opts.format)) {
        console.error(
          `error: invalid --format '${opts.format}'. Expected one of: ${FORMATS.join(", ")}`,
        );
        process.exit(1);
      }
      if (!isLang(opts.lang)) {
        console.error(`error: invalid --lang '${opts.lang}'. Expected one of: ${LANGS.join(", ")}`);
        process.exit(1);
      }
      try {
        await run(path, {
          format: opts.format,
          lang: opts.lang,
          out: opts.out,
          redacted: opts.redacted,
          specGlobs: opts.specGlob,
        });
      } catch (err) {
        if (err instanceof UserError) {
          console.error(`error: ${err.message}`);
          process.exit(err.exitCode);
        }
        console.error(`error: ${err instanceof Error ? err.message : String(err)}`);
        process.exit(1);
      }
    },
  );

program
  .command("verify-image")
  .description("Verify hidden fingerprint metadata in a generated PNG report.")
  .argument("<file>", "PNG report file")
  .action(async (file: string) => {
    try {
      await verifyImage(file);
    } catch (err) {
      if (err instanceof UserError) {
        console.error(`error: ${err.message}`);
        process.exit(err.exitCode);
      }
      console.error(`error: ${err instanceof Error ? err.message : String(err)}`);
      process.exit(1);
    }
  });

// Only parse argv when this file is the entry point, not when imported (e.g. by tests).
const entryUrl = process.argv[1] ? pathToFileURL(process.argv[1]).href : "";
if (entryUrl === import.meta.url) {
  program.parseAsync(process.argv);
}
