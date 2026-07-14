<!-- SPDX-License-Identifier: Apache-2.0 -->
<!-- SPDX-FileCopyrightText: 2026 SubLang International <https://sublang.ai> -->

# CLI: Command-Line Interface

## Intent

This spec defines implementation requirements for the `ai-maturity-scanner` command-line entry point.
It does not cover git file enumeration, metric scoring, or package distribution.

## Execution

### CLI-9

When the command starts a scan, the CLI shall check for `git` availability before repository validation and shall raise the user-facing `git not found on PATH` error when `git` is unavailable.

### CLI-10

When the target path resolves inside a git working tree, the CLI shall discover the repository root from git metadata and shall build the report from that repository root rather than from the caller's nested path.

### CLI-11

When the user passes an invalid `--format` value, the CLI shall print `error: invalid --format '<value>'. Expected one of: terminal, md, json` to stderr and shall terminate with exit code `1`.

### CLI-12

When the scan succeeds, the CLI shall render the report according to the selected format and shall write UTF-8 output either to stdout or to the resolved `--out` file path.

### CLI-13

When `src/cli.ts` is imported as a module rather than executed as the entry point, the module shall not parse `process.argv` automatically.
