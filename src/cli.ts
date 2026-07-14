import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { Command } from "commander";
import { checkIsGitRepo, getHeadSha, getRepoRoot, isGitInstalled } from "./git/workspace.ts";
import { aggregateRawMetrics } from "./metrics/aggregate.ts";
import { determineLevel, scoreAmi } from "./metrics/score.ts";
import { renderJson } from "./report/json.ts";
import { renderMarkdown } from "./report/markdown.ts";
import { renderTerminal } from "./report/terminal.ts";
import type { MaturityReport } from "./report/types.ts";
import { collectFiles } from "./scan/collect.ts";

export type Format = "terminal" | "md" | "json";

export const FORMATS: readonly Format[] = ["terminal", "md", "json"] as const;

export function isFormat(value: string): value is Format {
  return (FORMATS as readonly string[]).includes(value);
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

export async function buildReport(repoRoot: string): Promise<MaturityReport> {
  const headSha = await getHeadSha(repoRoot);
  const files = await collectFiles(repoRoot);

  const metrics = aggregateRawMetrics(files);
  const { ami, dimensions, normalizedMetrics } = scoreAmi(metrics);
  const level = determineLevel(metrics);

  return {
    repo: { root: repoRoot, headSha, scannedAt: new Date().toISOString() },
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

export function renderReport(report: MaturityReport, format: Format): string {
  if (format === "json") return renderJson(report);
  if (format === "md") return renderMarkdown(report);
  return renderTerminal(report);
}

async function run(target: string, opts: { format: Format; out?: string }): Promise<void> {
  if (!(await isGitInstalled())) {
    throw new UserError("git not found on PATH", 3);
  }

  const cwd = resolve(target);
  if (!(await checkIsGitRepo(cwd))) {
    throw new UserError(`${cwd} is not a git repository`, 2);
  }

  const root = await getRepoRoot(cwd);
  const report = await buildReport(root);
  const output = renderReport(report, opts.format);

  if (opts.out) {
    await writeFile(resolve(opts.out), output, "utf8");
  } else {
    process.stdout.write(output);
  }
}

const program = new Command();

program
  .name("ai-maturity-scanner")
  .description("Scan a code repository and report its AI coding maturity (L0-L4 + AMI score).")
  .argument("[path]", "repository path to scan", process.cwd())
  .option("-f, --format <format>", "output format: terminal | md | json", "terminal")
  .option("-o, --out <file>", "write to file instead of stdout")
  .action(async (path: string, opts: { format: string; out?: string }) => {
    if (!isFormat(opts.format)) {
      console.error(
        `error: invalid --format '${opts.format}'. Expected one of: ${FORMATS.join(", ")}`,
      );
      process.exit(1);
    }
    try {
      await run(path, { format: opts.format, out: opts.out });
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
