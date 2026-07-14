<!-- SPDX-License-Identifier: Apache-2.0 -->
<!-- SPDX-FileCopyrightText: 2026 SubLang International <https://sublang.ai> -->

# SCAN: Repository Scan

## Intent

This spec defines how the scanner collects tracked files, computes file sizes and line counts, and filters scan results before metric aggregation.
It does not cover path tag definitions, metric aggregation, or report rendering.

## Collection

### SCAN-1

When collecting repository files, the scanner shall enumerate repository-relative tracked paths with `git ls-files --full-name`.

### SCAN-2

When collecting repository files, the scanner shall classify each tracked path in the context of the full tracked-file set and shall retain only files that have one or more tags and are either structurally tagged as `file_type`, `agent_type`, or `skill_level`, or have a Markdown extension in `md`, `mdx`, or `mdc`.

### SCAN-3

When a retained file is emitted to downstream scoring, the scanner shall include its repository-relative path, byte size, tag set, and line count.

### SCAN-4

When the retained file extension is `md`, `mdx`, or `mdc`, the scanner shall count editor-visible lines by streaming the file; otherwise the scanner shall emit line count `0`.

### SCAN-5

When file size or line-count reads fail for a retained file, the scanner shall continue the scan and shall emit `0` for the failed measurement.
