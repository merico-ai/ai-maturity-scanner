<!-- SPDX-License-Identifier: Apache-2.0 -->
<!-- SPDX-FileCopyrightText: 2026 SubLang International <https://sublang.ai> -->

# CLI: Command-Line Interface

## Intent

This spec defines acceptance tests for `ai-maturity-scanner` CLI usage, output routing, and exit behavior.

## Acceptance

### CLI-14
Verifies: [CLI-1](../user/cli.md#cli-1), [CLI-2](../user/cli.md#cli-2), [CLI-10](../dev/cli.md#cli-10)

Where a git repository exists, when the CLI is executed with no path argument and with an explicit nested path argument in separate runs, the produced reports shall identify the same repository root for scans targeting the same repository.

### CLI-15
Verifies: [CLI-3](../user/cli.md#cli-3), [CLI-11](../dev/cli.md#cli-11)

When the CLI is executed with each supported format and with one unsupported format in separate runs, the supported values shall succeed and the unsupported value shall print the invalid-format error and exit with code `1`.

### CLI-16
Verifies: [CLI-4](../user/cli.md#cli-4), [CLI-12](../dev/cli.md#cli-12)

Where the target repository is valid, when the CLI is executed once with stdout output and once with `--out`, the stdout run shall print the report and the `--out` run shall create a UTF-8 file containing the selected rendered format.

### CLI-17
Verifies: [CLI-5](../user/cli.md#cli-5), [CLI-6](../user/cli.md#cli-6), [CLI-7](../user/cli.md#cli-7), [CLI-8](../user/cli.md#cli-8), [CLI-9](../dev/cli.md#cli-9)

When the CLI is exercised across successful execution, invalid arguments, a non-repository target, and an environment without `git` on `PATH`, the process shall return exit codes `0`, `1`, `2`, and `3` respectively.
