import { describe, expect, it } from "vitest";
import {
  DEFAULT_RULES,
  DEFAULT_SPEC_GLOBS,
  buildRules,
  buildSpecRule,
} from "../src/rules/patterns.ts";
import { classifyFile } from "../src/rules/tagger.ts";
import type { Tag } from "../src/types.ts";

/** Extract the `file_type` tag value (or undefined) for a path under a rule set. */
function fileTypeOf(
  path: string,
  rules: readonly ReturnType<typeof buildRules> = DEFAULT_RULES,
): string | undefined {
  const tags: Tag[] = classifyFile(path, rules);
  return tags.find((t) => t.kind === "file_type")?.value;
}

describe("default spec glob preserves the legacy `specs/` behavior", () => {
  it("DEFAULT_SPEC_GLOBS targets specs at any depth", () => {
    expect(DEFAULT_SPEC_GLOBS).toEqual(["**/specs/**/*.md"]);
  });

  it("tags Markdown under specs/ (root and nested) as spec", () => {
    expect(fileTypeOf("specs/a.md")).toBe("spec");
    expect(fileTypeOf("specs/sub/b.md")).toBe("spec");
    expect(fileTypeOf("apps/web/specs/c.md")).toBe("spec");
  });

  it("does not tag non-Markdown or look-alike paths", () => {
    expect(fileTypeOf("specs/a.txt")).toBeUndefined();
    expect(fileTypeOf("myspecs/a.md")).toBeUndefined();
    expect(fileTypeOf("specs.md")).toBeUndefined();
    expect(fileTypeOf("README.md")).toBeUndefined();
  });

  it("still tags dotfile specs (mirrors legacy regex .*\\.md)", () => {
    expect(fileTypeOf("specs/.hidden.md")).toBe("spec");
  });
});

describe("custom spec globs override the default", () => {
  const rules = buildRules(["docs/specs/**/*.md"]);

  it("tags files under the custom glob as spec", () => {
    expect(fileTypeOf("docs/specs/a.md", rules)).toBe("spec");
    expect(fileTypeOf("docs/specs/nested/b.md", rules)).toBe("spec");
  });

  it("no longer tags the legacy specs/ path", () => {
    expect(fileTypeOf("specs/a.md", rules)).toBeUndefined();
  });

  it("supports multiple globs", () => {
    const multi = buildRules(["docs/specs/**/*.md", "design/**/*.md"]);
    expect(fileTypeOf("docs/specs/a.md", multi)).toBe("spec");
    expect(fileTypeOf("design/x.md", multi)).toBe("spec");
    expect(fileTypeOf("specs/a.md", multi)).toBeUndefined();
  });
});

describe("buildSpecRule edge cases", () => {
  it("returns null for an empty glob list (spec never matches)", () => {
    expect(buildSpecRule([])).toBeNull();
  });

  it("buildRules with no globs omits the spec rule entirely", () => {
    const rules = buildRules([]);
    expect(fileTypeOf("specs/a.md", rules)).toBeUndefined();
    expect(fileTypeOf("docs/specs/a.md", rules)).toBeUndefined();
  });
});
