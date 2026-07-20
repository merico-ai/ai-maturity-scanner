import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { profileTaxonomy } from "../lib/profile-taxonomy.ts";

const primaryIds = [
  "unstarted",
  "early-collaboration",
  "ai-operating-system",
  "skill-workshop",
  "agent-troupe",
  "command-center",
  "knowledge-library",
];

const traitIds = [
  "engineered-skills",
  "multi-agent",
  "tool-connected",
  "structured-context",
  "cross-project",
];

test("the Chinese and English profile guides expose every canonical profile ID", () => {
  for (const locale of ["zh", "en"] as const) {
    const taxonomy = profileTaxonomy[locale];

    assert.deepEqual(
      taxonomy.primary.map((item) => item.id),
      primaryIds,
    );
    assert.deepEqual(
      taxonomy.traits.map((item) => item.id),
      traitIds,
    );
    assert.ok(taxonomy.primary.every((item) => item.title && item.rule && item.description));
    assert.ok(taxonomy.traits.every((item) => item.title && item.rule && item.description));
  }
});

test("the profile guide documents primary-versus-trait and selection semantics", () => {
  for (const locale of ["zh", "en"] as const) {
    const taxonomy = profileTaxonomy[locale];

    assert.equal(taxonomy.selectionSteps.length, 4);
    assert.match(taxonomy.primaryDescription, /一个|exactly one/);
    assert.match(taxonomy.traitDescription, /最多|at most/);
    assert.match(taxonomy.evidenceDescription, /AMI/);
    assert.match(taxonomy.evidenceDescription, /L0/);
  }

  const structuralIds = profileTaxonomy.en.traits
    .filter((item) => item.kind === "structural")
    .map((item) => item.id);
  assert.deepEqual(structuralIds, ["tool-connected", "cross-project"]);
});

test("both locale docs pages render the shared profile guide", async () => {
  const [englishPage, chinesePage, docsContent, metricsContent] = await Promise.all([
    readFile(new URL("../app/en/docs/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/(zh)/docs/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/docs-content.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/metrics-content.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(englishPage, /<DocsContent locale="en"/);
  assert.match(chinesePage, /<DocsContent locale="zh"/);
  assert.match(docsContent, /<ProfileTaxonomyGuide locale=\{locale\} \/>/);
  assert.match(docsContent, /repository-profile/);
  assert.doesNotMatch(metricsContent, /ProfileTaxonomyGuide|profileTaxonomy/);
  assert.match(metricsContent, /ReportImageGuide/);
  assert.match(metricsContent, /normalizedMetrics/);
  assert.match(metricsContent, /metrics\.levels/);
});
