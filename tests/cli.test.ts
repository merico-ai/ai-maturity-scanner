import { mkdir, mkdtemp, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { afterEach, describe, expect, it } from "vitest";
import packageJson from "../package.json" with { type: "json" };
import { CLI_VERSION, isCliEntryPoint } from "../src/cli.ts";

let tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(tempDirs.map((dir) => rm(dir, { recursive: true, force: true })));
  tempDirs = [];
});

describe("CLI entry point detection", () => {
  it("treats an npm bin symlink to the module file as the entry point", async () => {
    const dir = await mkdtemp(join(tmpdir(), "ami-cli-entry-"));
    tempDirs.push(dir);

    const modulePath = join(dir, "dist", "cli.js");
    const binPath = join(dir, "ai-maturity-scanner");
    await mkdir(join(dir, "dist"));
    await writeFile(modulePath, "#!/usr/bin/env node\n");
    await symlink(modulePath, binPath);

    expect(isCliEntryPoint(binPath, pathToFileURL(modulePath).href)).toBe(true);
  });

  it("does not treat an unrelated process argv path as the entry point", () => {
    expect(
      isCliEntryPoint(process.argv[0], pathToFileURL(fileURLToPath(import.meta.url)).href),
    ).toBe(false);
  });
});

describe("CLI version", () => {
  it("uses the package version", () => {
    expect(CLI_VERSION).toBe(packageJson.version);
  });
});
