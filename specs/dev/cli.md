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

When the user passes an invalid `--format` value, the CLI shall print `error: invalid --format '<value>'. Expected one of: png, terminal, md, json` to stderr and shall terminate with exit code `1`.

### CLI-12

When the scan succeeds, the CLI shall render the report according to the selected format.
For text formats, it shall write UTF-8 output either to stdout or to the resolved `--out` file path.
For `png`, it shall write a PNG file to the resolved `--out` path, or to `ai-maturity-report.png` in the caller's current working directory when `--out` is omitted, and shall print `AI maturity report generated at: <path>` to stdout.

### CLI-13

When `src/cli.ts` is imported as a module rather than executed as the entry point, the module shall not parse `process.argv` automatically.

### CLI-20

When `verify-image` is executed against a file without valid `AI-Maturity-Image-Hash` PNG metadata or with mismatched image hash metadata, the CLI shall print a user-facing error and terminate with exit code `1`.
