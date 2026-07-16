// child_process wrappers around git, run with an explicit cwd.
// All commands are read-only and safe to run against any working tree.

import { type ExecFileException, execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const MAX_BUFFER = 64 * 1024 * 1024;

export interface RunGitOptions {
  cwd: string;
}

export class GitError extends Error {
  constructor(
    message: string,
    readonly exitCode: number | string | undefined,
    readonly stderr: string,
  ) {
    super(message);
    this.name = "GitError";
  }
}

/**
 * Run `git` with the given args. Throws `GitError` on non-zero exit, and a
 * NodeJS.ErrnoException with `code: "ENOENT"` when git is not on PATH.
 */
export async function runGit(args: readonly string[], opts: RunGitOptions): Promise<string> {
  try {
    const { stdout } = await execFileAsync("git", args as string[], {
      cwd: opts.cwd,
      maxBuffer: MAX_BUFFER,
      encoding: "utf8",
    });
    return stdout;
  } catch (err) {
    const e = err as ExecFileException & {
      stdout?: string;
      stderr?: string;
      code?: string | number;
    };
    if (e.code === "ENOENT") {
      // git binary not found
      throw err;
    }
    throw new GitError(
      `git ${args.join(" ")} failed (exit ${e.code ?? "unknown"})`,
      e.code,
      e.stderr ?? "",
    );
  }
}

export async function isGitInstalled(): Promise<boolean> {
  try {
    await execFileAsync("git", ["--version"], { encoding: "utf8" });
    return true;
  } catch (err) {
    const e = err as ExecFileException;
    if (e.code === "ENOENT") return false;
    return true;
  }
}

export async function checkIsGitRepo(cwd: string): Promise<boolean> {
  try {
    const stdout = await runGit(["rev-parse", "--is-inside-work-tree"], { cwd });
    return stdout.trim() === "true";
  } catch {
    return false;
  }
}

export async function getHeadSha(cwd: string): Promise<string> {
  return (await runGit(["rev-parse", "HEAD"], { cwd })).trim();
}

export async function getRemoteUrl(cwd: string): Promise<string | undefined> {
  try {
    const url = (await runGit(["config", "--get", "remote.origin.url"], { cwd })).trim();
    return url || undefined;
  } catch {
    return undefined;
  }
}

export async function getRepoRoot(cwd: string): Promise<string> {
  return (await runGit(["rev-parse", "--show-toplevel"], { cwd })).trim();
}

/**
 * List repo-relative tracked paths (respects .gitignore, matches `git ls-files`).
 *
 * Uses `-z` (NUL-separated) output so paths are returned raw: forward-slash
 * separators on every platform and no `core.quotePath` C-quoting, which would
 * otherwise turn non-ASCII names into `"\nnn"` strings (with literal backslashes
 * that confuse both `normalizePath` and glob matching).
 */
export async function listTrackedFiles(cwd: string): Promise<string[]> {
  const stdout = await runGit(["ls-files", "-z", "--full-name"], { cwd });
  if (!stdout) return [];
  return stdout.split("\0").filter(Boolean);
}
