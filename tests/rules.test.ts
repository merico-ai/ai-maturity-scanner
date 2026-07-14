import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  classifyFileExtension,
  classifyProjectScope,
  normalizePath,
} from "../src/rules/patterns.ts";
import { classifyFiles } from "../src/rules/tagger.ts";
import type { CollectedFile, Tag } from "../src/types.ts";

const here = dirname(fileURLToPath(import.meta.url));
const goldenPath = resolve(here, "./fixtures/rules.golden.json");
const golden = JSON.parse(readFileSync(goldenPath, "utf8")) as {
  cases: Array<{ path: string; tags: Tag[] }>;
};

describe("rules golden fixture — classifyFiles over all 5 dimensions", () => {
  const files: CollectedFile[] = golden.cases.map((c) => ({ path: c.path }));
  const classified = classifyFiles(files);
  const byPath = new Map(classified.map((c) => [c.path, c.tags]));

  for (const c of golden.cases) {
    it(`classifies ${c.path}`, () => {
      const normalized = normalizePath(c.path);
      const actual = byPath.get(normalized);
      expect(actual, `path ${normalized} missing from classifyFiles output`).toBeDefined();
      expect(actual).toEqual(c.tags);
    });
  }

  it("skips entries with empty path", () => {
    const result = classifyFiles([{ path: "" }, { path: "CLAUDE.md" }]);
    expect(result).toHaveLength(1);
    expect(result[0]?.path).toBe("CLAUDE.md");
  });
});

describe("classifyFileExtension edge cases", () => {
  it("returns 'none' for hidden file with no real ext", () => {
    expect(classifyFileExtension(".gitignore")).toBe("none");
  });
  it("returns 'none' for filename without a dot", () => {
    expect(classifyFileExtension("Makefile")).toBe("none");
  });
  it("returns 'none' for trailing dot", () => {
    expect(classifyFileExtension("foo.")).toBe("none");
  });
  it("lowercases the extension", () => {
    expect(classifyFileExtension("foo.PY")).toBe("py");
  });
  it("uses only the last extension", () => {
    expect(classifyFileExtension("archive.tar.gz")).toBe("gz");
  });
  it("returns 'other' for extensions longer than 64 chars", () => {
    const long = "a".repeat(65);
    expect(classifyFileExtension(`foo.${long}`)).toBe("other");
  });
  it("accepts an extension at exactly 64 chars", () => {
    const exact = "a".repeat(64);
    expect(classifyFileExtension(`foo.${exact}`)).toBe(exact);
  });
  it("returns 'other' for extensions with invalid chars", () => {
    expect(classifyFileExtension("foo.bar baz")).toBe("other");
  });
  it("accepts + and - in extension", () => {
    expect(classifyFileExtension("foo.exotic+ext")).toBe("exotic+ext");
  });
});

describe("classifyProjectScope", () => {
  it("returns 'root' for top-level files", () => {
    expect(classifyProjectScope("CLAUDE.md")).toBe("root");
  });
  it("returns 'subproject' for nested files", () => {
    expect(classifyProjectScope("apps/web/CLAUDE.md")).toBe("subproject");
  });
});

describe("normalizePath", () => {
  it("strips a single leading ./", () => {
    expect(normalizePath("./CLAUDE.md")).toBe("CLAUDE.md");
  });
  it("strips repeated leading ./", () => {
    expect(normalizePath("././CLAUDE.md")).toBe("CLAUDE.md");
  });
  it("converts backslashes to forward slashes", () => {
    expect(normalizePath("apps\\web\\CLAUDE.md")).toBe("apps/web/CLAUDE.md");
  });
  it("collapses duplicate slashes", () => {
    expect(normalizePath("apps//web/CLAUDE.md")).toBe("apps/web/CLAUDE.md");
  });
  it("strips a trailing slash", () => {
    expect(normalizePath("apps/web/")).toBe("apps/web");
  });
  it("preserves a lone slash", () => {
    expect(normalizePath("/")).toBe("/");
  });
});
