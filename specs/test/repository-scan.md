<!-- SPDX-License-Identifier: Apache-2.0 -->
<!-- SPDX-FileCopyrightText: 2026 SubLang International <https://sublang.ai> -->

# SCAN: Repository Scan

## Intent

This spec defines acceptance tests for tracked-file collection, relevance filtering, and line counting.

## Acceptance

### SCAN-6
Verifies: [SCAN-1](../dev/repository-scan.md#scan-1)

Where a repository contains tracked files and ignored files, when the scanner collects repository files, the emitted paths shall match `git ls-files --full-name` output rather than the full working tree contents.

### SCAN-7
Verifies: [SCAN-2](../dev/repository-scan.md#scan-2)

Where tracked files include AI-related fixtures, plain Markdown documents, and unrelated non-Markdown files, when the scanner collects repository files, it shall retain the AI-related fixtures and plain Markdown documents and shall omit unrelated non-Markdown files with no relevant tags.

### SCAN-8
Verifies: [SCAN-3](../dev/repository-scan.md#scan-3), [SCAN-4](../dev/repository-scan.md#scan-4)

Where retained files include Markdown and non-Markdown entries, when the scanner emits collected file records, each record shall contain path, size, tags, and lines, with streamed line counts for Markdown files and line count `0` for non-Markdown files.

### SCAN-9
Verifies: [SCAN-5](../dev/repository-scan.md#scan-5)

Where a retained file cannot be measured during size or line-count collection, when the scanner completes the run, the scan shall continue and the failed measurement field shall be `0`.
