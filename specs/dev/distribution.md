<!-- SPDX-License-Identifier: Apache-2.0 -->
<!-- SPDX-FileCopyrightText: 2026 SubLang International <https://sublang.ai> -->

# DIST: Distribution

## Intent

This spec defines package distribution requirements for the published Node.js CLI artifact.
It does not cover runtime CLI behavior, scan semantics, or release automation credentials.

## Package Artifact

### DIST-1

When the package is distributed, the package shall declare `type=module`, `engines.node >= 22`, and the `ai-maturity-scanner` executable mapped to `./dist/cli.js`.

### DIST-2

When the package is packed for distribution, the published file set shall include `dist/`, `README.md`, and `LICENSE`.

### DIST-3

When the package build runs, the build shall produce `dist/cli.js` from the TypeScript sources with `tsup`.

### DIST-4

When `prepack` runs, the package shall build before packing, and when `prepublishOnly` runs, the package shall run tests and then build before publish.

### DIST-5

When validating a built distribution artifact, executing `node dist/cli.js --help` shall complete successfully as a smoke check.
