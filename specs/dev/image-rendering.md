<!-- SPDX-License-Identifier: Apache-2.0 -->
<!-- SPDX-FileCopyrightText: 2026 SubLang International <https://sublang.ai> -->

# IMGR: Image Rendering

## Intent

This spec defines implementation requirements for rendering shareable image reports from scanner report data.
It does not cover report score calculation, terminal, Markdown, JSON report rendering, website implementation, online scanning, or npm release automation.

## Backend Comparison

| Backend | Fit | Tradeoffs | Decision |
| --- | --- | --- | --- |
| `sharp` + SVG | Strong fit for deterministic report cards: compose a static SVG template, embed text and QR SVG, then rasterize to PNG/WebP. `sharp` supports SVG input and PNG output and avoids launching child browser processes. [[1]] [[2]] | Latest `sharp` requires Node.js >= 20.9.0, which is covered by this package's Node.js >= 22 baseline. [[3]] | Selected backend. |
| `puppeteer` | Strong browser fidelity for HTML/CSS screenshots. Page screenshots and element screenshots are first-class APIs. [[4]] | Installs a Chrome for Testing binary by default, adding roughly 170-282 MB per platform and introducing postinstall/download failure modes. [[5]] | Reject for the CLI path unless future image layouts require browser-only CSS fidelity. |
| `@napi-rs/canvas` | Useful immediate-mode canvas API backed by Skia, with prebuilt native bindings and PNG encoding. [[6]] | Lower-level drawing model than SVG templates, more manual text measurement/layout work, and less natural for report-card markup. Lambda usage also needs a layer. [[6]] | Reject for the first implementation; revisit only if `sharp` cannot meet a future deployment target. |

## Rendering Backend

### IMGR-1

When image report rendering is implemented, the implementation documentation shall compare `sharp` plus SVG, `puppeteer`, and `@napi-rs/canvas` by CLI distribution footprint, deterministic layout, install reliability, and supported Node runtime, and shall identify `sharp` plus SVG as the selected backend for the first implementation.

### IMGR-2

When image report rendering is implemented, the scanner shall render the report image from a deterministic SVG template and rasterize it with `sharp`.

### IMGR-3

When rasterizing an image report, the scanner shall use the same `MaturityReport` data contract used by existing report renderers and shall not rescan or recompute metrics inside the image renderer.

## QR Codes

### IMGR-4

When a QR code is included in an image report, the scanner shall generate it with the `qrcode` package and shall prefer SVG output for embedding in the SVG template. [[7]]

### IMGR-5

Where the configured QR target URL is unavailable, when an image report is rendered, the scanner shall reserve the QR slot with a placeholder instead of failing the report generation.

## Sensitive Output

### IMGR-6

When a public image variant is requested, the scanner shall include the repository address, using `repo.url` when available and otherwise using the existing `repo.root` display value.

### IMGR-7

When a redacted image variant is requested, the scanner shall redact only the repository address and shall not redact HEAD SHA, score, level, metrics, file classifications, algorithm version, or scan timestamp.

### IMGR-8

When rendering both full and redacted image variants, the scanner shall derive both variants from the same report payload and shall apply redaction only to a presentation copy so that JSON, Markdown, and terminal report data remain unchanged.

## Follow-up Implementation Outline

1. Promote the `scripts/render-image-demo.mjs` prototype into a typed image renderer module after the report i18n work settles.
2. Add image output options to the CLI using a format name such as `png` or a separate `--image` flag.
3. Keep `qrcode` and `sharp` as runtime dependencies and verify the latest `sharp` release against the Node 22 CI baseline.
4. Convert `MaturityReport` into a fixed-size SVG string with explicit typography, spacing, and color tokens.
5. Implement QR generation as a small helper that returns either QR SVG markup or a placeholder SVG group.
6. Implement redaction as a pure function over the renderer view model, limited to the repository URL/root display field.
7. Add tests that verify SVG generation, redacted-field scope, QR placeholder behavior, and PNG smoke rendering on the supported CI platforms.

## References

[1]: https://sharp.pixelplumbing.com/ "sharp documentation"
[2]: https://sharp.pixelplumbing.com/api-output/ "sharp output options"
[3]: https://sharp.pixelplumbing.com/install/ "sharp installation"
[4]: https://pptr.dev/guides/screenshots "Puppeteer screenshots"
[5]: https://pptr.dev/guides/installation "Puppeteer installation"
[6]: https://github.com/Brooooooklyn/canvas "@napi-rs/canvas README"
[7]: https://github.com/soldair/node-qrcode "node-qrcode README"
