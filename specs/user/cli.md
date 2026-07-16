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

When the user sets `-f` or `--format`, the CLI shall accept only `png`, `terminal`, `md`, or `json`, and shall use `png` when the option is omitted.

### CLI-4

When the user sets `-o` or `--out`, the CLI shall write the rendered report to the specified file path.
For `png` output, the CLI shall print `AI maturity report generated at: <path>` to stdout after writing the image.
For text output formats, the CLI shall write to stdout when `--out` is omitted.

### CLI-19

When the user sets `--verbose`, and the selected primary output is written to a file, the CLI shall also write a terminal report containing scan results and metric data to stdout.
When the selected text output format already writes to stdout because `--out` is omitted, `--verbose` shall not add a second report to stdout.

### CLI-18

When the user runs `ai-maturity-scanner verify-image <file>`, the CLI shall read the hidden `AI-Maturity-Image-Hash` PNG metadata, recompute the image pixel hash, and print `Fingerprint verified.` when the values match.

## Exit Codes

### CLI-5

When a scan completes successfully, the CLI shall exit with code `0`.

### CLI-6

When command-line argument validation fails or an uncategorized runtime error occurs, the CLI shall exit with code `1`.

### CLI-7

When the target path is not inside a git working tree, the CLI shall exit with code `2`.

### CLI-8

When the `git` binary is not available on `PATH`, the CLI shall exit with code `3`.
