// Walk a git working tree, classify each tracked file, and produce the
// input the aggregator needs: per-file path + tags + size + line count.
//
// To match the C# pipeline we only compute line counts for Markdown files
// (MaturityScanService.cs:491). Non-Markdown files are still tagged so they
// count toward file_extension totals, but their `lines` is 0.

import { open } from "node:fs/promises";
import { join } from "node:path";
import { listTrackedFiles } from "../git/workspace.ts";
import { buildRules } from "../rules/patterns.ts";
import { classifyFileInContext } from "../rules/tagger.ts";
import type { CollectedFile, FileWithTags, Tag } from "../types.ts";
import { countLines } from "./line-count.ts";

const MARKDOWN_EXTS = new Set(["md", "mdx", "mdc"]);

function isRelevant(tags: readonly Tag[]): boolean {
  const structural = tags.some(
    (t) => t.kind === "file_type" || t.kind === "agent_type" || t.kind === "skill_level",
  );
  if (structural) return true;
  const ext = tags.find((t) => t.kind === "file_extension")?.value;
  return ext !== undefined && MARKDOWN_EXTS.has(ext);
}

async function fileSize(repoRoot: string, relativePath: string): Promise<number> {
  try {
    const handle = await open(join(repoRoot, relativePath), "r");
    const stat = await handle.stat();
    await handle.close();
    return stat.size;
  } catch {
    return 0;
  }
}

export interface CollectOptions {
  /** Cap on parallel file reads. Defaults to 16. */
  concurrency?: number;
  /** Globs selecting spec documents; defaults to the built-in spec glob. */
  specGlobs?: readonly string[];
}

/**
 * List tracked files in `repoRoot`, classify them, and return only those
 * relevant to the maturity metrics (AI-related tags or Markdown files).
 */
export async function collectFiles(
  repoRoot: string,
  opts: CollectOptions = {},
): Promise<FileWithTags[]> {
  const paths = await listTrackedFiles(repoRoot);
  const collected: CollectedFile[] = paths.map((p) => ({ path: p }));

  // Tag every file once, in memory.
  const rules = buildRules(opts.specGlobs);
  const tagged = collected.map((f) => ({
    path: f.path,
    tags: classifyFileInContext(f, collected, rules),
  }));

  // Keep only files that can move a metric needle.
  const relevant = tagged.filter((f) => f.tags.length > 0 && isRelevant(f.tags));

  const concurrency = Math.max(1, opts.concurrency ?? 16);
  const out: FileWithTags[] = new Array(relevant.length);

  let cursor = 0;
  async function worker() {
    while (cursor < relevant.length) {
      const i = cursor++;
      const entry = relevant[i];
      if (!entry) continue;
      const size = await fileSize(repoRoot, entry.path);
      const ext = entry.tags.find((t) => t.kind === "file_extension")?.value;
      const isMd = ext !== undefined && MARKDOWN_EXTS.has(ext);
      const lines = isMd ? await safeCountLines(join(repoRoot, entry.path)) : 0;
      out[i] = { path: entry.path, tags: entry.tags, size, lines };
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, relevant.length) }, () => worker());
  await Promise.all(workers);
  return out.filter(Boolean);
}

async function safeCountLines(absPath: string): Promise<number> {
  try {
    return await countLines(absPath);
  } catch {
    return 0;
  }
}
