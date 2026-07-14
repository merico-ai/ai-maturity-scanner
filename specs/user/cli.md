<!-- SPDX-License-Identifier: Apache-2.0 -->
<!-- SPDX-FileCopyrightText: 2026 SubLang International <https://sublang.ai> -->

# CLI: Command-Line Interface

## Intent

This spec defines the user-visible command-line behavior of `ai-maturity-scanner`.
It does not cover repository collection internals, maturity scoring internals, or renderer payload structure.

## Usage

### CLI-1

When the user runs `ai-maturity-scanner` with no positional path argument, the CLI shall scan the current working directory.

### CLI-2

When the user runs `ai-maturity-scanner <path>`, the CLI shall treat `<path>` as the repository path to scan.

### CLI-3

When the user sets `-f` or `--format`, the CLI shall accept only `terminal`, `md`, or `json`, and shall use `terminal` when the option is omitted.

### CLI-4

When the user sets `-o` or `--out`, the CLI shall write the rendered report to the specified file path instead of stdout.

## Exit Codes

### CLI-5

When a scan completes successfully, the CLI shall exit with code `0`.

### CLI-6

When command-line argument validation fails or an uncategorized runtime error occurs, the CLI shall exit with code `1`.

### CLI-7

When the target path is not inside a git working tree, the CLI shall exit with code `2`.

### CLI-8

When the `git` binary is not available on `PATH`, the CLI shall exit with code `3`.
