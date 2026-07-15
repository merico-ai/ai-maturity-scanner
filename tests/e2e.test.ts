import { type ExecFileException, execFile, execFileSync } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildReport, renderReport } from "../src/cli.ts";
import { aggregateRawMetrics } from "../src/metrics/aggregate.ts";
import { score } from "../src/metrics/score.ts";
import { collectFiles } from "../src/scan/collect.ts";

const execFileAsync = promisify(execFile);

async function git(cwd: string, args: string[]): Promise<string> {
  const { stdout } = await execFileAsync("git", args, {
    cwd,
    env: { ...process.env, GIT_TERMINAL_PROMPT: "0" },
  });
  return stdout.trim();
}

function gitAvailable(): boolean {
  try {
    execFileSync("git", ["--version"]);
    return true;
  } catch (err) {
    return (err as ExecFileException).code !== "ENOENT";
  }
}

const itOrSkip = gitAvailable() ? it : it.skip;

let repoDir: string;

beforeAll(async () => {
  if (!gitAvailable()) return;

  repoDir = await mkdtemp(join(tmpdir(), "ami-scanner-e2e-"));
  await git(repoDir, ["init", "-q"]);
  await git(repoDir, ["config", "user.email", "test@example.com"]);
  await git(repoDir, ["config", "user.name", "Test"]);

  await writeFile(join(repoDir, "CLAUDE.md"), `${"# Project guide\n".repeat(20)}\n`);

  await mkdir(join(repoDir, "skills", "build", "scripts"), { recursive: true });
  await writeFile(join(repoDir, "skills", "build", "SKILL.md"), "# Build skill\n\n");
  await writeFile(join(repoDir, "skills", "build", "scripts", "build.sh"), "#!/bin/sh\necho hi\n");

  await mkdir(join(repoDir, "skills", "test"), { recursive: true });
  await writeFile(join(repoDir, "skills", "test", "SKILL.md"), "# Test skill\n");

  await mkdir(join(repoDir, "specs"), { recursive: true });
  for (let i = 0; i < 12; i++) {
    await writeFile(join(repoDir, "specs", `spec-${i}.md`), `# Spec ${i}\n\nDetails.\n`);
  }

  await mkdir(join(repoDir, "commands"), { recursive: true });
  await writeFile(join(repoDir, "commands", "deploy.md"), "# Deploy\n");

  await mkdir(join(repoDir, "agents"), { recursive: true });
  await writeFile(join(repoDir, "agents", "researcher.md"), "# Researcher\n");

  await writeFile(join(repoDir, ".mcp.json"), "{}\n");

  await mkdir(join(repoDir, "apps", "web"), { recursive: true });
  await writeFile(join(repoDir, "apps", "web", "CLAUDE.md"), "# Web\n");

  await mkdir(join(repoDir, "docs"), { recursive: true });
  await writeFile(join(repoDir, "docs", "architecture.md"), "# Architecture\n");

  await git(repoDir, ["add", "."]);
  await git(repoDir, ["commit", "-q", "-m", "fixture"]);
});

afterAll(async () => {
  if (repoDir) {
    await rm(repoDir, { recursive: true, force: true });
  }
});

describe("e2e: full pipeline on a fixture git repo", () => {
  itOrSkip("collects, aggregates, and scores a fixture repo", async () => {
    const files = await collectFiles(repoDir);
    expect(files.length).toBeGreaterThan(0);

    const paths = new Set(files.map((f) => f.path));
    expect(paths.has("CLAUDE.md")).toBe(true);
    expect(paths.has("skills/build/SKILL.md")).toBe(true);
    expect(paths.has("apps/web/CLAUDE.md")).toBe(true);
    expect(paths.has("docs/architecture.md")).toBe(true); // markdown → spec

    const metrics = aggregateRawMetrics(files);
    expect(metrics.aiInstructionFiles).toBe(2); // CLAUDE.md + apps/web/CLAUDE.md
    expect(metrics.skillCount).toBe(2);
    expect(metrics.advancedSkillCount).toBe(1);
    expect(metrics.specsFileCount).toBeGreaterThanOrEqual(12);
    expect(metrics.subprojectCoverage).toBe(1); // apps/web/
    expect(metrics.agentTypeDistinct).toBe(1); // claude

    const result = score(metrics);
    expect(result.level).toMatch(/^L[0-4]$/);
    expect(result.ami).toBeGreaterThanOrEqual(0);
    expect(result.ami).toBeLessThanOrEqual(100);

    // All 15 normalized metrics present.
    expect(Object.keys(result.normalizedMetrics)).toHaveLength(15);
    expect(result.normalizedMetrics.ai_instruction_files).toBe(100);
    expect(result.normalizedMetrics.subproject_coverage).toBe(20); // 1/5*100
  });

  itOrSkip("buildReport + renderReport produce parseable output in every format", async () => {
    const report = await buildReport(repoDir, { lang: "en" });
    expect(report.level).toMatch(/^L[0-4]$/);
    expect(report.meta.algorithmVersion).toBe("v1");
    expect(report.meta.lang).toBe("en");

    const json = renderReport(report, "json");
    const parsed = JSON.parse(json);
    expect(parsed.level).toBe(report.level);
    expect(parsed.repo.headSha).toBe(report.repo.headSha);
    expect(parsed.meta.algorithmVersion).toBe("v1");
    expect(parsed.meta.lang).toBe("en");
    expect(Object.keys(parsed.normalizedMetrics)).toHaveLength(15);

    const md = renderReport(report, "md");
    expect(md).toContain("# AI Maturity Report");
    expect(md).toContain(`**Level:** ${report.level}`);

    const term = renderReport(report, "terminal");
    expect(term).toContain("AI Maturity Report");
    expect(term).toContain(report.level);
  });
});
