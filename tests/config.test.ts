import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CONFIG_FILENAME, loadConfig, resolveSpecGlobs } from "../src/config.ts";
import { DEFAULT_SPEC_GLOBS } from "../src/rules/patterns.ts";

describe("resolveSpecGlobs precedence", () => {
  it("uses CLI globs when provided, ignoring config and default", () => {
    expect(resolveSpecGlobs(["cfg/**"], ["cli/**"])).toEqual(["cli/**"]);
  });

  it("falls back to config when CLI is empty", () => {
    expect(resolveSpecGlobs(["cfg/**"], [])).toEqual(["cfg/**"]);
  });

  it("falls back to default when both CLI and config are empty/absent", () => {
    expect(resolveSpecGlobs(undefined, [])).toEqual([...DEFAULT_SPEC_GLOBS]);
    expect(resolveSpecGlobs([], [])).toEqual([...DEFAULT_SPEC_GLOBS]);
  });

  it("ignores an empty config array (uses default)", () => {
    expect(resolveSpecGlobs([], [])).toEqual([...DEFAULT_SPEC_GLOBS]);
  });
});

describe("loadConfig", () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), "ami-cfg-"));
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  async function writeConfig(content: string): Promise<void> {
    await writeFile(join(dir, CONFIG_FILENAME), content, "utf8");
  }

  it("returns {} when no config file exists", async () => {
    expect(await loadConfig(dir)).toEqual({});
  });

  it("parses a valid specGlobs array", async () => {
    await writeConfig(JSON.stringify({ specGlobs: ["docs/specs/**/*.md", "design/*.md"] }));
    expect(await loadConfig(dir)).toEqual({
      specGlobs: ["docs/specs/**/*.md", "design/*.md"],
    });
  });

  it("ignores unknown keys but keeps valid specGlobs", async () => {
    await writeConfig(JSON.stringify({ future: 42, specGlobs: ["x/**/*.md"] }));
    expect(await loadConfig(dir)).toEqual({ specGlobs: ["x/**/*.md"] });
  });

  it("returns {} and warns on malformed JSON", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    await writeConfig("{ not json");
    expect(await loadConfig(dir)).toEqual({});
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });

  it("returns {} and warns when root is not an object", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    await writeConfig(JSON.stringify(["not", "an", "object"]));
    expect(await loadConfig(dir)).toEqual({});
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });

  it("ignores specGlobs of the wrong type and warns", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    await writeConfig(JSON.stringify({ specGlobs: "docs/specs/**/*.md" }));
    expect(await loadConfig(dir)).toEqual({});
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });

  it("ignores specGlobs with non-string entries and warns", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    await writeConfig(JSON.stringify({ specGlobs: ["ok/*.md", 7] }));
    expect(await loadConfig(dir)).toEqual({});
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });
});
