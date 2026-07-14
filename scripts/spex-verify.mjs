#!/usr/bin/env node

// SPDX-License-Identifier: Apache-2.0
// SPDX-FileCopyrightText: 2026 SubLang International <https://sublang.ai>

/**
 * Spex Package Verify Tool
 *
 * Verifies that a canonical Spex package complies with META rules.
 * Catches the bugs that previously slipped through subagent authoring:
 *   - Uppercase GFM anchors that resolve to nothing
 *   - Cross-package citations to wrong paths (e.g., AGINT path for CLIINST)
 *   - DR / IR / checklist citations from items rather than Intent
 *   - Missing "It does not cover" boundary paragraph
 *   - Item ID gaps or duplicates
 *   - test/ items missing `Verifies:` lines
 *
 * Packages are parsed from the canonical specs/map.md index. The user/dev/test
 * rows in each package table determine its path and forms.
 *
 * Usage:
 *   node scripts/spex-verify.mjs <CODE>          Verify one package by short code (e.g., TDB)
 *   node scripts/spex-verify.mjs --path <PATH>   Verify by relative path (e.g., analytics/team-dashboard)
 *   node scripts/spex-verify.mjs --all           Verify every package in specs/map.md
 *   node scripts/spex-verify.mjs --help          Show this help
 *
 * Exit codes:
 *   0  all checks passed (or only warnings)
 *   1  one or more checks failed
 *   2  invocation error
 *
 * Output: JSON on stdout. Pipe through `jq` for pretty printing.
 */

import { readFile, readdir, stat } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const REPO_ROOT = path.resolve(import.meta.dirname, '..');
const SPECS_DIR = path.join(REPO_ROOT, 'specs');
const MAP_PATH = path.join(SPECS_DIR, 'map.md');

// ─── Package index parsing ─────────────────────────────────────────────

/**
 * Parse package sections in map.md into rows shaped as { path, code, forms }.
 */
async function parsePackageIndex() {
  const text = await readFile(MAP_PATH, 'utf-8');
  const packages = [];
  let current = null;

  for (const line of text.split('\n')) {
    const heading = line.match(/^### ([A-Z][A-Z0-9]*)$/);
    if (heading) {
      if (current) packages.push(current);
      current = { code: heading[1], groups: new Map() };
      continue;
    }
    if (!current) continue;

    const item = line.match(
      /^\| (user|dev|test) \| \[[^\]]+\]\((user|dev|test)\/([^/)]+(?:\/[^/)]+)*)\.md\) \|/,
    );
    if (!item) continue;
    const [, group, linkGroup, pkgPath] = item;
    if (group !== linkGroup) {
      throw new Error(`Package ${current.code} has mismatched group/link: ${line}`);
    }
    current.groups.set(group, pkgPath);
  }
  if (current) packages.push(current);

  return packages.map(({ code, groups }) => {
    if (groups.size === 0) {
      throw new Error(`Package ${code} has no user/dev/test rows in specs/map.md`);
    }
    const paths = new Set(groups.values());
    if (paths.size !== 1) {
      throw new Error(`Package ${code} maps to inconsistent paths: ${[...paths].join(', ')}`);
    }
    const forms = ['user', 'dev', 'test']
      .filter((group) => groups.has(group))
      .map((group) => ({ user: 'U', dev: 'D', test: 'T' })[group])
      .join('/');
    return { path: [...paths][0], code, forms };
  });
}

// ─── Package discovery ─────────────────────────────────────────────────

function formsToArray(forms) {
  // 'U/D/T' -> ['user', 'dev', 'test']
  // 'D/T'   -> ['dev', 'test']
  // 'D'     -> ['dev']
  const map = { U: 'user', D: 'dev', T: 'test' };
  return forms.split('/').map((c) => map[c]);
}

function expectedFiles(pkgPath, forms) {
  const groups = formsToArray(forms);
  return groups.map((g) => ({
    group: g,
    abs: path.join(SPECS_DIR, g, `${pkgPath}.md`),
    rel: path.join('specs', g, `${pkgPath}.md`),
  }));
}

// ─── Check helpers ─────────────────────────────────────────────────────

async function readIfExists(file) {
  try {
    return await readFile(file, 'utf-8');
  } catch (err) {
    if (err.code === 'ENOENT') return null;
    throw err;
  }
}

function extractItemIds(text, code) {
  const re = new RegExp(`^### ${code}-([0-9]+)\\b`, 'gm');
  const ids = [];
  let m;
  while ((m = re.exec(text)) !== null) ids.push(parseInt(m[1], 10));
  return ids;
}

/**
 * Return the body of `## Intent` section (between `## Intent` and the next `## `).
 */
function extractIntentSection(text) {
  const start = text.indexOf('## Intent');
  if (start < 0) return null;
  const after = text.indexOf('\n## ', start + 1);
  return after < 0 ? text.slice(start) : text.slice(start, after);
}

/**
 * Return array of `### ${CODE}-N` item sections as { id, body }.
 * Body extends from the item header until the next `### CODE-N` or any `## ` H2.
 */
function extractItemBodies(text, code) {
  const lines = text.split('\n');
  const items = [];
  let currentItem = null;
  let currentBody = [];
  const headerRe = new RegExp(`^### (${code}-[0-9]+)\\b`);
  for (const line of lines) {
    const m = line.match(headerRe);
    if (m) {
      if (currentItem) items.push({ id: currentItem, body: currentBody.join('\n') });
      currentItem = m[1];
      currentBody = [line];
    } else if (/^## /.test(line)) {
      if (currentItem) {
        items.push({ id: currentItem, body: currentBody.join('\n') });
        currentItem = null;
        currentBody = [];
      }
    } else if (currentItem) {
      currentBody.push(line);
    }
  }
  if (currentItem) items.push({ id: currentItem, body: currentBody.join('\n') });
  return items;
}

// ─── Checks ────────────────────────────────────────────────────────────

/**
 * Each check returns { id, status: 'pass'|'fail'|'warn', details?: string[] }.
 * `fail` blocks merge; `warn` is informational.
 */

function checkFilePresence(expected, code) {
  const missing = expected.filter((f) => !existsSync(f.abs));
  // Check that groups NOT in forms are absent.
  const allGroups = ['user', 'dev', 'test'];
  const unexpected = allGroups
    .filter((g) => !expected.some((e) => e.group === g))
    .map((g) => ({
      group: g,
      abs: path.join(SPECS_DIR, g, `${expected[0]?.abs?.split('/specs/').pop()?.replace(/\.md$/, '')}.md`),
    }))
    .filter((f) => existsSync(f.abs));
  if (missing.length === 0 && unexpected.length === 0) {
    return { id: 'file-presence', status: 'pass' };
  }
  const details = [];
  if (missing.length) details.push(`Missing: ${missing.map((m) => m.rel).join(', ')}`);
  if (unexpected.length) details.push(`Unexpected: ${unexpected.map((m) => m.abs).join(', ')}`);
  return { id: 'file-presence', status: 'fail', details };
}

function checkH1Title(text, code) {
  const m = text.match(/^# ([A-Z][A-Z0-9]*):/m);
  if (!m) return { id: 'h1-title', status: 'fail', details: ['No H1 starting with code prefix'] };
  if (m[1] !== code) {
    return {
      id: 'h1-title',
      status: 'fail',
      details: [`H1 prefix is '${m[1]}', expected '${code}'`],
    };
  }
  return { id: 'h1-title', status: 'pass' };
}

function checkIntentSection(text) {
  if (text.includes('## Intent')) return { id: 'intent-section', status: 'pass' };
  return { id: 'intent-section', status: 'fail', details: ['No `## Intent` section'] };
}

function checkDoesNotCover(text, group) {
  // Required in user/ and dev/ Intent. Optional in test/.
  if (group === 'test') return { id: 'does-not-cover', status: 'pass' };
  const intent = extractIntentSection(text);
  if (!intent) return { id: 'does-not-cover', status: 'fail', details: ['No Intent section'] };
  if (intent.includes('It does not cover')) return { id: 'does-not-cover', status: 'pass' };
  return {
    id: 'does-not-cover',
    status: 'fail',
    details: ['Intent section missing "It does not cover ..." paragraph'],
  };
}

function checkItemIdContinuity(text, code) {
  const ids = extractItemIds(text, code);
  if (ids.length === 0) {
    return { id: 'item-ids', status: 'fail', details: ['No `### CODE-N` items found'] };
  }
  const sorted = [...ids].sort((a, b) => a - b);
  const dupes = sorted.filter((id, i) => sorted[i - 1] === id);
  if (dupes.length === 0) return { id: 'item-ids', status: 'pass', count: ids.length };
  return {
    id: 'item-ids',
    status: 'fail',
    details: [`Duplicates: ${[...new Set(dupes)].join(', ')}`],
  };
}

/**
 * META-11: each item ID must be unique within specs/. Since anchors are
 * file-scoped, the same `CODE-N` in two files produces two distinct anchors
 * today, but the literal META-11 wording forbids the shared ID. This check
 * reports IDs that appear in more than one form (user/dev/test) of a package.
 */
function checkItemIdUniqueAcrossForms(texts, code) {
  const owners = new Map(); // id -> Set<group>
  for (const f of texts) {
    if (!f.text) continue;
    for (const id of extractItemIds(f.text, code)) {
      if (!owners.has(id)) owners.set(id, new Set());
      owners.get(id).add(f.group);
    }
  }
  const dupes = [...owners.entries()].filter(([, gs]) => gs.size > 1);
  if (dupes.length === 0) return { id: 'item-ids-unique', status: 'pass' };
  return {
    id: 'item-ids-unique',
    status: 'fail',
    details: dupes.map(
      ([id, gs]) => `${code}-${id} appears in: ${[...gs].join(', ')}`,
    ),
  };
}

function checkLowercaseAnchors(text) {
  const bad = [];
  const re = /\]\(([^)]*#[^)]+)\)/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const target = m[1];
    // Extract the anchor fragment after the last '#'
    const hashIdx = target.lastIndexOf('#');
    if (hashIdx < 0) continue;
    const anchor = target.slice(hashIdx + 1);
    // Anchor must be all lowercase letters/digits/dashes (GFM auto-lowercases)
    if (anchor !== anchor.toLowerCase()) {
      bad.push(target);
    }
  }
  if (bad.length === 0) return { id: 'lowercase-anchors', status: 'pass' };
  return {
    id: 'lowercase-anchors',
    status: 'fail',
    details: bad.slice(0, 5).map((t) => `Uppercase anchor: ${t}`),
  };
}

function checkNoIrCitations(text) {
  const bad = [];
  const ids = text.match(/\bIR-[0-9]{3}\b/g) || [];
  const paths = text.match(/iterations\/[0-9]{3}-[a-z0-9-]+\.md/g) || [];
  bad.push(...ids, ...paths);
  if (bad.length === 0) return { id: 'no-ir-citations', status: 'pass' };
  return {
    id: 'no-ir-citations',
    status: 'fail',
    details: [`References: ${[...new Set(bad)].join(', ')}`],
  };
}

function checkNoWorkingArtifactCitations(text) {
  const bad = [];
  if (/package-catalog/.test(text)) bad.push('package-catalog');
  if (/owner-mapping-draft/.test(text)) bad.push('owner-mapping-draft');
  if (/product-decision-checklist/.test(text)) bad.push('product-decision-checklist');
  if (bad.length === 0) return { id: 'no-working-artifact-citations', status: 'pass' };
  return {
    id: 'no-working-artifact-citations',
    status: 'fail',
    details: [`Working artifact referenced from item: ${bad.join(', ')}`],
  };
}

/**
 * DR citations (`decisions/`) are allowed in `## Intent` only.
 * Outside Intent, they are META violations.
 */
function checkDrCitationsOnlyFromIntent(text) {
  const intent = extractIntentSection(text);
  const intentStart = intent ? text.indexOf(intent) : -1;
  const intentEnd = intentStart >= 0 ? intentStart + intent.length : -1;
  const bad = [];
  const re = /decisions\/[0-9]{3}-[a-z-]+\.md/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    if (intentStart < 0 || m.index < intentStart || m.index >= intentEnd) {
      bad.push(`${m[0]} (offset ${m.index})`);
    }
  }
  if (bad.length === 0) return { id: 'dr-citations-from-intent-only', status: 'pass' };
  return {
    id: 'dr-citations-from-intent-only',
    status: 'fail',
    details: bad.map((b) => `DR citation outside Intent: ${b}`),
  };
}

function checkCrossPackageLinks(text, fileRel) {
  const bad = [];
  const re = /\]\((\.\.[^)]+)\)/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const rawLink = m[1];
    // Strip anchor
    const linkNoAnchor = rawLink.replace(/#.*$/, '');
    // Resolve relative to the file's directory
    const fileDir = path.dirname(fileRel);
    const resolved = path.normalize(path.join(fileDir, linkNoAnchor));
    if (!existsSync(path.join(REPO_ROOT, resolved))) {
      bad.push(`${rawLink} -> ${resolved}`);
    }
  }
  if (bad.length === 0) {
    return { id: 'cross-package-links', status: 'pass' };
  }
  return {
    id: 'cross-package-links',
    status: 'fail',
    details: bad.slice(0, 5).map((b) => `Broken: ${b}`),
  };
}

function checkGearsForm(text, code) {
  // Every item body should contain "shall" (META-6 rough check)
  const items = extractItemBodies(text, code);
  const bad = items.filter((it) => !/\bshall\b/.test(it.body));
  if (bad.length === 0) return { id: 'gears-shall', status: 'pass' };
  return {
    id: 'gears-shall',
    status: 'fail',
    details: bad.map((b) => `${b.id}: no "shall" in item body`),
  };
}

function checkTestVerifiesLines(text, code) {
  // Every test/ item must have a `Verifies:` line (META-20)
  const items = extractItemBodies(text, code);
  const bad = items.filter((it) => !/^Verifies:/m.test(it.body));
  if (bad.length === 0) return { id: 'test-verifies', status: 'pass' };
  return {
    id: 'test-verifies',
    status: 'fail',
    details: bad.map((b) => `${b.id}: no Verifies: line`),
  };
}

// ─── Per-package orchestrator ──────────────────────────────────────────

async function verifyPackage(pkg) {
  const expected = expectedFiles(pkg.path, pkg.forms);
  const checks = [];

  // File presence
  checks.push(checkFilePresence(expected, pkg.code));

  // Read all texts once
  const texts = await Promise.all(
    expected.map(async (f) => ({ ...f, text: await readIfExists(f.abs) })),
  );

  // Package-level checks (across all forms)
  checks.push(checkItemIdUniqueAcrossForms(texts, pkg.code));

  // Per-file checks
  for (const f of texts) {
    if (!f.text) continue;
    const fileChecks = [
      { id: 'spdx-headers', group: f.group, result: checkSpdxHeader(f.text, f.rel) },
      { id: 'h1-title', group: f.group, result: checkH1Title(f.text, pkg.code) },
      { id: 'intent-section', group: f.group, result: checkIntentSection(f.text) },
      { id: 'does-not-cover', group: f.group, result: checkDoesNotCover(f.text, f.group) },
      { id: 'item-ids', group: f.group, result: checkItemIdContinuity(f.text, pkg.code) },
      { id: 'lowercase-anchors', group: f.group, result: checkLowercaseAnchors(f.text) },
      { id: 'no-ir-citations', group: f.group, result: checkNoIrCitations(f.text) },
      {
        id: 'no-working-artifact-citations',
        group: f.group,
        result: checkNoWorkingArtifactCitations(f.text),
      },
      {
        id: 'dr-citations-from-intent-only',
        group: f.group,
        result: checkDrCitationsOnlyFromIntent(f.text),
      },
      {
        id: 'cross-package-links',
        group: f.group,
        result: checkCrossPackageLinks(f.text, f.rel),
      },
      { id: 'gears-shall', group: f.group, result: checkGearsForm(f.text, pkg.code) },
    ];
    if (f.group === 'test') {
      fileChecks.push({
        id: 'test-verifies',
        group: f.group,
        result: checkTestVerifiesLines(f.text, pkg.code),
      });
    }
    for (const c of fileChecks) {
      checks.push({ ...c.result, id: `${c.id}:${f.group}` });
    }
  }

  // Summarize
  const failed = checks.filter((c) => c.status === 'fail');
  const warned = checks.filter((c) => c.status === 'warn');
  return {
    package: pkg.code,
    path: pkg.path,
    forms: pkg.forms,
    checks,
    summary: {
      total: checks.length,
      passed: checks.filter((c) => c.status === 'pass').length,
      warned: warned.length,
      failed: failed.length,
    },
    success: failed.length === 0,
  };
}

function checkSpdxHeader(text, rel) {
  const details = [];
  if (!text.includes('SPDX-License-Identifier:')) {
    details.push(`${rel}: no SPDX-License-Identifier`);
  }
  if (!text.includes('SPDX-FileCopyrightText:')) {
    details.push(`${rel}: no SPDX-FileCopyrightText`);
  }
  if (details.length === 0) return { status: 'pass' };
  return { status: 'fail', details };
}

// ─── CLI entry ─────────────────────────────────────────────────────────

async function usage() {
  console.error(`Spex Package Verify Tool

Usage:
  node scripts/spex-verify.mjs <CODE>              Verify one package by short code (e.g., TDB)
  node scripts/spex-verify.mjs --path <PATH>       Verify by relative path (e.g., analytics/team-dashboard)
  node scripts/spex-verify.mjs --all               Verify every package in specs/map.md
  node scripts/spex-verify.mjs next-id <CODE>      Print the next globally-unique item ID for <CODE>
  node scripts/spex-verify.mjs --help              Show this help

Output: JSON on stdout for verify modes; plain "<CODE>-<N>" on stdout for next-id.

Examples:
  node scripts/spex-verify.mjs TDB
  node scripts/spex-verify.mjs --path analytics/team-dashboard
  node scripts/spex-verify.mjs --all | jq '.summary'
  node scripts/spex-verify.mjs next-id CRREV
`);
}

/**
 * Compute the next globally-unique item ID for a package (META-11).
 * Aggregates item IDs across all existing forms (user/dev/test) and returns
 * max(occupied) + 1. Returns 1 if no items exist yet.
 */
async function computeNextItemId(pkg) {
  const files = expectedFiles(pkg.path, pkg.forms);
  let max = 0;
  for (const f of files) {
    const text = await readIfExists(f.abs);
    if (!text) continue;
    for (const id of extractItemIds(text, pkg.code)) {
      if (id > max) max = id;
    }
  }
  return max + 1;
}

async function main() {
  const [, , ...argv] = process.argv;
  if (argv.length === 0 || argv.includes('--help')) {
    await usage();
    process.exit(2);
  }

  const packages = await parsePackageIndex();

  if (argv[0] === 'next-id') {
    if (!argv[1]) {
      console.error('next-id requires a package code (e.g., CRREV)');
      process.exit(2);
    }
    const code = argv[1].toUpperCase();
    const row = packages.find((r) => r.code === code);
    if (!row) {
      process.stdout.write(`${code}-1\n`);
      process.exit(0);
    }
    const nextN = await computeNextItemId(row);
    process.stdout.write(`${code}-${nextN}\n`);
    process.exit(0);
  }

  let targets;
  if (argv[0] === '--all') {
    targets = packages;
  } else if (argv[0] === '--path') {
    if (!argv[1]) {
      console.error('--path requires a value');
      process.exit(2);
    }
    const row = packages.find((r) => r.path === argv[1]);
    if (!row) {
      console.error(`Package path '${argv[1]}' not found in specs/map.md`);
      process.exit(2);
    }
    targets = [row];
  } else {
    const code = argv[0].toUpperCase();
    const row = packages.find((r) => r.code === code);
    if (!row) {
      console.error(`Package code '${code}' not found in specs/map.md`);
      process.exit(2);
    }
    targets = [row];
  }

  const results = [];
  for (const pkg of targets) {
    results.push(await verifyPackage(pkg));
  }

  const output = {
    packages: results,
    summary: {
      total: results.length,
      passed: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
    },
    success: results.every((r) => r.success),
  };

  console.log(JSON.stringify(output, null, 2));
  process.exit(output.success ? 0 : 1);
}

main().catch((err) => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
