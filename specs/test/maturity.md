<!-- SPDX-License-Identifier: Apache-2.0 -->
<!-- SPDX-FileCopyrightText: 2026 SubLang International <https://sublang.ai> -->

# MAT: Maturity Scoring

## Intent

This spec defines acceptance tests for raw metric aggregation, normalization, and level selection.

## Acceptance

### MAT-11
Verifies: [MAT-1](../user/maturity.md#mat-1), [MAT-2](../user/maturity.md#mat-2)

When representative raw metrics are scored across repositories for each threshold band, the reported level shall follow the `L4` to `L0` cascade and the reported AMI shall remain within `0` to `100`.

### MAT-12
Verifies: [MAT-4](../dev/maturity.md#mat-4), [MAT-5](../dev/maturity.md#mat-5), [MAT-6](../dev/maturity.md#mat-6)

Where collected files include ability fixtures, plain Markdown documents, repeated agent types, nested instruction files, and non-matching nested documents, when raw metrics are aggregated, the output shall include the full raw metric set, shall count specs only from allowed Markdown files, shall use the maximum instruction line count, shall count distinct agent types, and shall count only distinct `apps/<name>/` and `libs/<name>/` instruction prefixes for `subproject_coverage`.

### MAT-13
Verifies: [MAT-7](../dev/maturity.md#mat-7), [MAT-8](../dev/maturity.md#mat-8), [MAT-9](../dev/maturity.md#mat-9)

When raw metrics are normalized at zero, midpoint, cap, and over-cap values, the normalized metrics shall follow the stated saturation caps, piecewise instruction-line curve, and engineering-rate cap at `0.50`.

### MAT-14
Verifies: [MAT-3](../user/maturity.md#mat-3), [MAT-10](../dev/maturity.md#mat-10)

When normalized metrics are scored into dimensions and AMI, the result shall use the declared dimension weights, the declared dimension compositions, and rounding to two decimal places.
