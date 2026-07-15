<!-- SPDX-License-Identifier: Apache-2.0 -->
<!-- SPDX-FileCopyrightText: 2026 SubLang International <https://sublang.ai> -->

# DIST: Distribution

## Intent

This spec defines acceptance tests for packaging, build hooks, and the built CLI smoke check.

## Acceptance

### DIST-6
Verifies: [DIST-1](../dev/distribution.md#dist-1), [DIST-2](../dev/distribution.md#dist-2)

When package metadata is inspected for distribution, the package manifest shall declare ESM packaging, `Node >= 22`, the CLI bin entry for `./dist/cli.js`, and the packaged file set `dist/`, `README.md`, and `LICENSE`.

### DIST-7
Verifies: [DIST-3](../dev/distribution.md#dist-3), [DIST-4](../dev/distribution.md#dist-4)

When build and publish hooks are exercised, the build script shall produce `dist/cli.js`, `prepack` shall invoke the build, and `prepublishOnly` shall run tests before build.

### DIST-8
Verifies: [DIST-5](../dev/distribution.md#dist-5)

Where the package has been built, when `node dist/cli.js --help` is executed, the process shall exit successfully and print command help text.
