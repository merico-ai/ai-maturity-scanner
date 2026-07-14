---
name: commit
description: Prepare commits for this repository. Use when Codex is asked to create, stage, review, or write a git commit message for ai-maturity-scanner, especially when selecting commit subjects, bodies, trailers, or Spex package references.
---

<!-- SPDX-License-Identifier: Apache-2.0 -->
<!-- SPDX-FileCopyrightText: 2026 SubLang International <https://sublang.ai> -->

# Commit

## Workflow

Follow `specs/dev/git.md` as the source of truth before creating a commit.

1. Inspect `git status --short` and only stage files that belong to the requested change.
2. Verify `git config user.name` and `git config user.email` are configured before committing.
3. Write the subject as `<type>(<scope>)<!>: <subject>`.
4. Add a body only when it explains useful what/why context.
5. Add required trailers exactly as described below.

## Subject Rules

Use one of these types:

`feat`, `fix`, `docs`, `style`, `refactor`, `test`, `ci`, `build`, `perf`, `chore`

Keep the subject imperative, 50 characters or fewer, and without a trailing period.
Use a scope when it adds clarity, for example:

```text
docs(commit): add project commit skill
```

## Body Rules

If a body is needed, explain what changed and why.
Wrap body text at 72 characters.
Use bullets when they make the change easier to scan.

## Trailer Rules

Do not add any `Co-authored-by` trailer or AI co-author attribution.

Always include at least one Spex trailer:

```text
Spex: <package id>
```

Use the package short form from `specs/map.md`, such as `GIT` or `LIC`.
If a commit affects multiple spec packages, add one `Spex:` trailer per package.
For changes unrelated to an existing spec package, use the closest applicable
package and update specs first when the requested behavior changes project rules.

## Example

```text
docs(commit): add project commit skill

Document the repository-specific commit workflow so agents use the
same subject, body, and trailer rules.

Spex: GIT
```
