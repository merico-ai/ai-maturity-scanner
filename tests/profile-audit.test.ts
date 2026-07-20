import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { describe, expect, it } from "vitest";

const execFileAsync = promisify(execFile);
const repoRoot = fileURLToPath(new URL("..", import.meta.url));

describe("repository profile audit fixture", () => {
  it("keeps the audit harness output aligned with the checked-in fixture", async () => {
    const { stdout } = await execFileAsync(
      "node",
      ["--experimental-strip-types", "scripts/audit-profiles.ts"],
      {
        cwd: repoRoot,
        maxBuffer: 1024 * 1024,
      },
    );
    const expected = JSON.parse(
      await readFile(
        new URL("./fixtures/profile-corpus/repository-profile-corpus.result.json", import.meta.url),
        "utf8",
      ),
    );

    expect(JSON.parse(stdout)).toEqual(expected);
  });
});
