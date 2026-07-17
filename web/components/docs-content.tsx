import { Fragment } from "react";

import { CodeBlock } from "./code-block";
import { DocsToc, type TocItem } from "./docs-toc";
import { SectionHeading } from "./section-heading";
import type { Locale } from "../lib/i18n";
import { codeActions, messages } from "../lib/i18n";

const flags = [
  ["[path]", "Repository path", "."],
  ["-f, --format", "png | terminal | md | json", "png"],
  ["-o, --out", "Write report to file", "ai-maturity-report.png for PNG; stdout for text"],
  ["--lang", "zh | en", "zh"],
  ["--spec-glob", "glob (repeatable)", "**/specs/**/*.md"],
];

type DocsContentProps = {
  locale: Locale;
};

export function DocsContent({ locale }: DocsContentProps) {
  const docs = messages[locale].docs;
  const tocItems: TocItem[] = [
    { id: "install", label: docs.install },
    { id: "usage", label: docs.usage },
    { id: "normalization", label: docs.normalization.title },
    { id: "ami", label: docs.ami.title },
    { id: "level-metrics", label: docs.levelMetrics.title },
    { id: "levels", label: docs.levels.title },
    { id: "spec-config", label: docs.config.title },
    { id: "mcp", label: docs.mcpSupport.title },
    { id: "flags", label: docs.table.title },
  ];

  return (
    <main className="page-shell py-8 sm:py-12">
      <div className="lg:flex lg:justify-center lg:gap-10 lg:items-start">
        <div className="min-w-0 flex-1 lg:max-w-4xl">
          <section className="max-w-4xl">
            <p className="eyebrow">{docs.eyebrow}</p>
            <h1 className="page-title mt-3 sm:text-5xl">{docs.title}</h1>
            <p className="body-copy mt-4 text-base">{docs.description}</p>
          </section>

          <DocsToc items={tocItems} label={docs.tocLabel} variant="inline" />

          <section className="mt-8 grid gap-4">
            <article className="surface-card min-w-0 scroll-mt-24" id="install">
              <SectionHeading href="#install">{docs.install}</SectionHeading>
              <CodeBlock
                code="npm install -g @merico-ai/maturity-scanner"
                copiedLabel={codeActions[locale].copied}
                copyLabel={codeActions[locale].copy}
                preClassName="mt-4 p-4 text-sm"
              />
            </article>
            <article className="surface-card min-w-0 scroll-mt-24" id="usage">
              <SectionHeading href="#usage">{docs.usage}</SectionHeading>
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                {docs.usageExamples.map((example) => (
                  <div className="min-w-0" key={example.title}>
                    <h3 className="font-mono text-base font-semibold text-ink">{example.title}</h3>
                    <CodeBlock
                      code={example.code}
                      copiedLabel={codeActions[locale].copied}
                      copyLabel={codeActions[locale].copy}
                      preClassName="mt-3 p-4 text-sm"
                    />
                  </div>
                ))}
              </div>
            </article>
            <article className="surface-card min-w-0 scroll-mt-24" id="normalization">
              <SectionHeading href="#normalization">{docs.normalization.title}</SectionHeading>
              <p className="body-copy mt-4 text-sm">{docs.normalization.intro}</p>
              <code className="mt-4 block overflow-x-auto rounded bg-canvas px-3 py-2 font-mono text-sm text-brand">
                {docs.normalization.rule}
              </code>
              <h3 className="mt-6 font-mono text-base font-semibold text-ink">
                {docs.normalization.capsTitle}
              </h3>
              <div className="mt-3 overflow-hidden rounded-lg border border-line">
                <div className="grid grid-cols-[1fr_auto] gap-2 border-b border-line bg-canvas px-4 py-3 text-xs font-bold uppercase tracking-wide text-muted">
                  <span>{docs.normalization.tableHeaders.metric}</span>
                  <span>{docs.normalization.tableHeaders.cap}</span>
                </div>
                {docs.normalization.caps.map(([metric, cap]) => (
                  <div
                    className="grid grid-cols-[1fr_auto] items-center gap-2 border-b border-line px-4 py-2 text-sm last:border-b-0"
                    key={metric}
                  >
                    <code className="break-all text-ink">{metric}</code>
                    <code className="font-bold text-brand">{cap}</code>
                  </div>
                ))}
              </div>
              <h3 className="mt-6 font-mono text-base font-semibold text-ink">
                {docs.normalization.specialTitle}
              </h3>
              <div className="mt-3 grid gap-3">
                {docs.normalization.special.map((item) => (
                  <div className="rounded-md border border-line bg-canvas px-4 py-3" key={item.name}>
                    <code className="font-bold text-ink">{item.name}</code>
                    <p className="body-copy mt-2 text-sm">{item.desc}</p>
                  </div>
                ))}
              </div>
            </article>
            <article className="surface-card min-w-0 scroll-mt-24" id="ami">
              <SectionHeading href="#ami">{docs.ami.title}</SectionHeading>
              <p className="body-copy mt-4 text-sm">{docs.ami.intro}</p>
              <h3 className="mt-6 font-mono text-base font-semibold text-ink">{docs.ami.rollupTitle}</h3>
              <div className="mt-3 grid gap-3">
                {docs.ami.rows.map((row) => (
                  <div className="rounded-md border border-line bg-canvas px-4 py-3" key={row.dimension}>
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                      <code className="font-bold text-ink">{row.dimension}</code>
                      <span className="rounded bg-brand/10 px-1.5 py-0.5 font-mono text-xs font-bold text-brand">
                        {row.weight}
                      </span>
                    </div>
                    <p className="body-copy mt-2 text-sm text-muted">{row.composed}</p>
                  </div>
                ))}
              </div>
              <h3 className="mt-6 font-mono text-base font-semibold text-ink">{docs.ami.subscoreTitle}</h3>
              <ul className="mt-3 grid gap-2">
                {docs.ami.subscores.map((item) => (
                  <li className="rounded-md border border-line bg-canvas px-4 py-2 text-sm" key={item.name}>
                    <code className="font-bold text-ink">{item.name}</code>
                    <span className="text-muted"> = {item.members}</span>
                  </li>
                ))}
              </ul>
              <h3 className="mt-6 font-mono text-base font-semibold text-ink">{docs.ami.formulaTitle}</h3>
              <code className="mt-3 block overflow-x-auto rounded bg-canvas px-3 py-2 font-mono text-sm text-brand">
                {docs.ami.formula}
              </code>
            </article>
            <article className="surface-card min-w-0 scroll-mt-24" id="level-metrics">
              <SectionHeading href="#level-metrics">{docs.levelMetrics.title}</SectionHeading>
              <p className="body-copy mt-4 text-sm">{docs.levelMetrics.intro}</p>
              <h3 className="mt-6 font-mono text-base font-semibold text-ink">
                {docs.levelMetrics.derivedTitle}
              </h3>
              <div className="mt-3 grid gap-3">
                {docs.levelMetrics.derived.map((item) => (
                  <div className="rounded-md border border-line bg-canvas px-4 py-3" key={item.name}>
                    <code className="font-bold text-ink">{item.name}</code>
                    <code className="mt-2 block overflow-x-auto rounded bg-surface px-3 py-2 font-mono text-sm text-ink">
                      = {item.formula}
                    </code>
                    <p className="body-copy mt-2 text-sm">{item.desc}</p>
                    <p className="mt-1.5 text-xs text-muted">
                      <span className="font-semibold">{item.exampleLabel}:</span> {item.example}
                    </p>
                  </div>
                ))}
              </div>
              <h3 className="mt-6 font-mono text-base font-semibold text-ink">
                {docs.levelMetrics.rawTitle}
              </h3>
              <dl className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {docs.levelMetrics.raw.map((item) => (
                  <div className="rounded-md border border-line bg-canvas px-3 py-2" key={item.name}>
                    <code className="font-bold text-ink">{item.name}</code>
                    <p className="mt-0.5 text-xs text-muted">{item.desc}</p>
                  </div>
                ))}
              </dl>
            </article>
            <article className="surface-card min-w-0 scroll-mt-24" id="levels">
              <SectionHeading href="#levels">{docs.levels.title}</SectionHeading>
              <p className="body-copy mt-4 text-sm">{docs.levels.intro}</p>
              <div className="mt-4 overflow-hidden rounded-lg border border-line">
                <div className="flex gap-3 border-b border-line bg-canvas px-4 py-3 text-xs font-bold uppercase tracking-wide text-muted">
                  <span className="w-12 shrink-0">{docs.levels.tableHeaders.level}</span>
                  <span className="min-w-0">{docs.levels.tableHeaders.condition}</span>
                </div>
                {docs.levels.rows.map((row) => (
                  <div
                    className="flex items-start gap-3 border-b border-line px-4 py-3 text-sm last:border-b-0"
                    key={row.level}
                  >
                    <span className="inline-flex h-7 w-12 shrink-0 items-center justify-center rounded-md bg-brand/10 font-mono font-bold text-brand">
                      {row.level}
                    </span>
                    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-1.5 gap-y-1.5">
                      {row.clauses.length === 0 ? (
                        <span className="text-muted">{row.note}</span>
                      ) : (
                        row.clauses.map((clause, idx) => (
                          <Fragment key={`${row.level}-${idx}`}>
                            {idx > 0 && <span className="px-0.5 text-muted">{docs.levels.clauseJoin}</span>}
                            <code className="rounded bg-canvas px-1.5 py-0.5 text-ink">{clause[0]}</code>
                            <span className="text-muted">{clause[1]}</span>
                            <code className="rounded bg-canvas px-1.5 py-0.5 font-bold text-ink">{clause[2]}</code>
                          </Fragment>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </article>
            <article className="surface-card min-w-0 scroll-mt-24" id="spec-config">
              <SectionHeading href="#spec-config">{docs.config.title}</SectionHeading>
              <p className="body-copy mt-4 text-sm">{docs.config.description}</p>
              <p className="body-copy mt-6 text-sm">{docs.config.configFile}</p>
              <CodeBlock
                code={docs.config.configFileCode}
                copiedLabel={codeActions[locale].copied}
                copyLabel={codeActions[locale].copy}
                preClassName="mt-3 p-4 text-sm"
              />
              <p className="body-copy mt-6 text-sm">{docs.config.flag}</p>
              <CodeBlock
                code={docs.config.flagCode}
                copiedLabel={codeActions[locale].copied}
                copyLabel={codeActions[locale].copy}
                preClassName="mt-3 p-4 text-sm"
              />
              <p className="body-copy mt-6 text-sm">{docs.config.default}</p>
              <ul className="mt-4 grid gap-2 text-sm text-muted">
                {docs.config.notes.map((note) => (
                  <li className="rounded-md border border-line bg-canvas px-3 py-2" key={note}>
                    {note}
                  </li>
                ))}
              </ul>
            </article>
            <article className="surface-card min-w-0 scroll-mt-24" id="mcp">
              <SectionHeading href="#mcp">{docs.mcpSupport.title}</SectionHeading>
              <p className="body-copy mt-4 text-sm">{docs.mcpSupport.description}</p>
              <ul className="mt-4 grid gap-2 text-sm text-muted sm:grid-cols-2">
                {docs.mcpSupport.supported.map((item) => (
                  <li className="rounded-md border border-line bg-canvas px-3 py-2" key={item}>
                    {item}
                  </li>
                ))}
              </ul>
              <p className="body-copy mt-4 text-sm">{docs.mcpSupport.note}</p>
            </article>
          </section>

          <section
            className="mt-8 scroll-mt-24 overflow-hidden rounded-lg border border-line bg-surface shadow-sm"
            id="flags"
          >
            <div className="border-b border-line px-4 py-4 sm:px-5">
              <SectionHeading href="#flags">{docs.table.title}</SectionHeading>
            </div>
            <div className="grid grid-cols-[1fr_1fr_0.8fr] gap-0 border-b border-line bg-canvas px-4 py-3 text-xs font-bold uppercase tracking-wide text-muted">
              <span>{docs.table.flag}</span>
              <span>{docs.table.values}</span>
              <span>{docs.table.default}</span>
            </div>
            {flags.map(([flag, values, defaultValue]) => (
              <div
                className="grid grid-cols-[1fr_1fr_0.8fr] gap-0 border-b border-line px-4 py-3 text-sm last:border-b-0"
                key={flag}
              >
                <code className="break-words font-bold text-ink">{flag}</code>
                <span className="text-muted">{values}</span>
                <span className="text-muted">{defaultValue}</span>
              </div>
            ))}
          </section>
        </div>

        <DocsToc items={tocItems} label={docs.tocLabel} variant="aside" />
      </div>
    </main>
  );
}
