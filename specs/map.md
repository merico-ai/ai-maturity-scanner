<!-- SPDX-License-Identifier: Apache-2.0 -->
<!-- SPDX-FileCopyrightText: 2026 SubLang International <https://sublang.ai> -->

# Spec Map

Quick-reference index for locating spec files.
Spec items are the source of truth.
Code can be inconsistent with specs during development.

## Authoring and reviewing specs

Know the rules in [`meta.md`](meta.md) before authoring, modifying, or reviewing a DR, IR, or item.

- DRs and IRs: see [Organization](meta.md#organization), [Record format](meta.md#record-format), and [Citation](meta.md#citation).
- Items: see [Organization](meta.md#organization), [Item syntax](meta.md#item-syntax), [Spec packages](meta.md#spec-packages), and [Citation](meta.md#citation).

## Layout

```text
decisions/  Decision records (DRs)
iterations/ Iteration records (IRs)
user/       User-visible behavior
dev/        Implementation requirements
test/       Acceptance testing
map.md      This index
meta.md     The spec of specs
```

## Decisions

| ID | File | Summary |
| --- | --- | --- |
| DR-000 | [000-spec-structure-format.md](decisions/000-spec-structure-format.md) | Spec structure, format, and naming conventions |
| DR-001 | [001-repository-profile-labels.md](decisions/001-repository-profile-labels.md) | Add explainable repository profile labels alongside maturity levels |

## Iterations

| ID | File | Goal |
| --- | --- | --- |
| IR-000 | [000-spdx-headers.md](iterations/000-spdx-headers.md) | Add SPDX headers to applicable files |
| IR-001 | [001-high-priority-roadmap.md](iterations/001-high-priority-roadmap.md) | High-priority ROADMAP batch: version, i18n, npm rename, image research, web site |
| IR-002 | [002-repository-profile-labels.md](iterations/002-repository-profile-labels.md) | Deliver explainable repository profile labels |
| IR-002 calibration | [002-profile-calibration.md](iterations/002-profile-calibration.md) | Repository-profile calibration fixture and disposition |

## Packages

### CLI

| Group | File | Summary |
| --- | --- | --- |
| user | [cli.md](user/cli.md) | CLI usage, format flags, output routing, and exit codes |
| dev | [cli.md](dev/cli.md) | Entry-point validation, repo-root resolution, and module execution rules |
| test | [cli.md](test/cli.md) | CLI acceptance checks for usage, output, and exit behavior |

### SCAN

| Group | File | Summary |
| --- | --- | --- |
| dev | [repository-scan.md](dev/repository-scan.md) | Tracked-file collection, filtering, and line-count rules |
| test | [repository-scan.md](test/repository-scan.md) | Scan acceptance checks for tracked files and measurements |

### TAG

| Group | File | Summary |
| --- | --- | --- |
| dev | [tagging.md](dev/tagging.md) | Path tagging, normalization, and advanced skill detection |
| test | [tagging.md](test/tagging.md) | Tagging acceptance checks across all classifier dimensions |

### MAT

| Group | File | Summary |
| --- | --- | --- |
| user | [maturity.md](user/maturity.md) | User-facing AMI and L0-L4 scoring model |
| dev | [maturity.md](dev/maturity.md) | Raw metrics, normalization caps, and AMI composition |
| test | [maturity.md](test/maturity.md) | Scoring acceptance checks for levels and normalized metrics |

### REP

| Group | File | Summary |
| --- | --- | --- |
| user | [reporting.md](user/reporting.md) | Terminal, Markdown, and JSON report surfaces |
| dev | [reporting.md](dev/reporting.md) | Report payload and renderer contracts |
| test | [reporting.md](test/reporting.md) | Report-rendering acceptance checks |

### DIST

| Group | File | Summary |
| --- | --- | --- |
| dev | [distribution.md](dev/distribution.md) | Package metadata, build hooks, and smoke-check requirements |
| test | [distribution.md](test/distribution.md) | Distribution acceptance checks for packaging and built CLI smoke |

### GIT

| Group | File | Summary |
| --- | --- | --- |
| dev | [git.md](dev/git.md) | Commit message format and Spex trailers |

### IMGR

| Group | File | Summary |
| --- | --- | --- |
| dev | [image-rendering.md](dev/image-rendering.md) | Shareable image report rendering backend, QR, and redaction design |

### LIC

| Group | File | Summary |
| --- | --- | --- |
| dev | [licensing.md](dev/licensing.md) | SPDX header requirements and file-scope rules |
| test | [licensing.md](test/licensing.md) | Copyright and license header presence checks |
