<!-- SPDX-License-Identifier: Apache-2.0 -->
<!-- SPDX-FileCopyrightText: 2026 SubLang International <https://sublang.ai> -->

# IR-002 profile calibration

## Context

This note records the repository-profile calibration disposition for
[IR-002](002-repository-profile-labels.md) and
[DR-001](../decisions/001-repository-profile-labels.md).

The checked-in calibration corpus is a redacted synthetic pre-release fixture:

- manifest:
  [`tests/fixtures/profile-corpus/repository-profile-corpus.manifest.json`](../../tests/fixtures/profile-corpus/repository-profile-corpus.manifest.json)
- expected result:
  [`tests/fixtures/profile-corpus/repository-profile-corpus.result.json`](../../tests/fixtures/profile-corpus/repository-profile-corpus.result.json)

Run it with:

```sh
npm run --silent audit:profiles
```

The fixture deliberately carries only aggregate raw metrics and scenario IDs.
It contains no repository paths, source text, or file inventories. It covers
every primary label, the two structural traits, and the AI-operating-system
integration-floor diagnostic.

## Counterfactual definition

For the historical direct-score comparison, `tool-connected` is eligible at
`mcpCount >= 2` and `cross-project` at `subprojectCoverage >= 3`. Its direct
strength is the identity transform of the corresponding existing normalized
metric, rounded to two decimals.

The hypothetical candidate is compared against the current eligible specialized
candidates. Equal rounded strengths use this stable order: AI operating system,
skill workshop, agent troupe, command center, knowledge library, tool connected,
cross project.

## Disposition

Retain DR-001's fixed rules for this release. In the fixture, both hypothetical
single-signal labels would win all three eligible cases, while the actual
distribution retains early, skill-workshop, and AI-operating-system primaries
and surfaces the signals as traits.

The AI-operating-system case at the integration floor is recorded explicitly
(`zeroStrengthAtIntegrationFloor: 1`), as required. This synthetic calibration is
a pre-release safeguard rather than a claim about a production population; a
future representative external corpus should use the same manifest shape and
command before changing thresholds.
