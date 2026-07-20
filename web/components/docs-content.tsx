import Link from "next/link";
import { Fragment } from "react";

import type { Locale } from "../lib/i18n";
import { codeActions, localizePath, messages } from "../lib/i18n";
import { CodeBlock } from "./code-block";
import { DocsToc, type TocItem } from "./docs-toc";
import { ProfileTaxonomyGuide } from "./profile-taxonomy-guide";
import { SectionHeading } from "./section-heading";

type DocsContentProps = {
  locale: Locale;
};

function ReferenceDetails({
  children,
  summary,
}: {
  children: React.ReactNode;
  summary: string;
}) {
  return (
    <details className="rounded-md border border-line bg-canvas px-4 py-3">
      <summary className="cursor-pointer font-mono text-sm font-bold text-ink">{summary}</summary>
      <div className="mt-4">{children}</div>
    </details>
  );
}

export function DocsContent({ locale }: DocsContentProps) {
  const docs = messages[locale].docs;
  const tocItems: TocItem[] = [
    { id: "install", label: docs.quickCommand.title },
    { id: "usage", label: docs.workflowsTitle },
    { id: "spec-config", label: docs.config.title },
    { id: "mcp", label: docs.mcpSupport.title },
    { id: "scoring-reference", label: docs.scoringReference.title },
    { id: "repository-profile", label: docs.profileGuideTitle },
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
            <article className="surface-card min-w-0 scroll-mt-24 sm:p-6" id="install">
              <SectionHeading href="#install">{docs.quickCommand.title}</SectionHeading>
              <p className="body-copy mt-4 text-sm">{docs.quickCommand.description}</p>
              <CodeBlock
                code="npx @merico-ai/maturity-scanner ./my-repo"
                copiedLabel={codeActions[locale].copied}
                copyLabel={codeActions[locale].copy}
                preClassName="mt-4 p-4 text-sm"
              />
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Link className="primary-button" href={localizePath("/quick-start", locale)}>
                  {docs.quickCommand.quickStartCta}
                </Link>
                <Link className="secondary-button" href={localizePath("/metrics", locale)}>
                  {docs.quickCommand.metricsCta}
                </Link>
              </div>
            </article>

            <article className="surface-card min-w-0 scroll-mt-24 sm:p-6" id="usage">
              <SectionHeading href="#usage">{docs.workflowsTitle}</SectionHeading>
              <p className="body-copy mt-4 text-sm">{docs.workflowsDescription}</p>
              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                {docs.usageExamples.map((example) => (
                  <section
                    className="min-w-0 border-t border-line pt-4 first:border-t-0 first:pt-0 lg:first:border-t lg:first:pt-4"
                    key={example.title}
                  >
                    <h3 className="font-mono text-base font-semibold text-ink">{example.title}</h3>
                    <CodeBlock
                      code={example.code}
                      copiedLabel={codeActions[locale].copied}
                      copyLabel={codeActions[locale].copy}
                      preClassName="mt-3 p-4 text-sm"
                    />
                  </section>
                ))}
              </div>
            </article>

            <article className="surface-card min-w-0 scroll-mt-24 sm:p-6" id="spec-config">
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

            <article className="surface-card min-w-0 scroll-mt-24 sm:p-6" id="mcp">
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

            <article className="surface-card min-w-0 scroll-mt-24 sm:p-6" id="scoring-reference">
              <SectionHeading href="#scoring-reference">
                {docs.scoringReference.title}
              </SectionHeading>
              <p className="body-copy mt-4 text-sm">{docs.scoringReference.description}</p>
              <div className="mt-5 grid gap-3">
                <ReferenceDetails summary={docs.normalization.title}>
                  <p className="body-copy text-sm">{docs.normalization.intro}</p>
                  <code className="mt-4 block overflow-x-auto rounded bg-surface px-3 py-2 font-mono text-sm text-brand">
                    {docs.normalization.rule}
                  </code>
                  <h3 className="mt-6 font-mono text-base font-semibold text-ink">
                    {docs.normalization.capsTitle}
                  </h3>
                  <div className="mt-3 overflow-hidden rounded-lg border border-line">
                    <div className="grid grid-cols-[1fr_auto] gap-2 border-b border-line bg-surface px-4 py-3 text-xs font-bold uppercase tracking-wide text-muted">
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
                      <div
                        className="border-t border-line pt-3 first:border-t-0 first:pt-0"
                        key={item.name}
                      >
                        <code className="font-bold text-ink">{item.name}</code>
                        <p className="body-copy mt-2 text-sm">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </ReferenceDetails>

                <ReferenceDetails summary={docs.ami.title}>
                  <p className="body-copy text-sm">{docs.ami.intro}</p>
                  <h3 className="mt-6 font-mono text-base font-semibold text-ink">
                    {docs.ami.rollupTitle}
                  </h3>
                  <div className="mt-3 grid gap-3">
                    {docs.ami.rows.map((row) => (
                      <div
                        className="border-t border-line pt-3 first:border-t-0 first:pt-0"
                        key={row.dimension}
                      >
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
                  <h3 className="mt-6 font-mono text-base font-semibold text-ink">
                    {docs.ami.subscoreTitle}
                  </h3>
                  <ul className="mt-3 grid gap-2">
                    {docs.ami.subscores.map((item) => (
                      <li className="text-sm" key={item.name}>
                        <code className="font-bold text-ink">{item.name}</code>
                        <span className="text-muted"> = {item.members}</span>
                      </li>
                    ))}
                  </ul>
                  <h3 className="mt-6 font-mono text-base font-semibold text-ink">
                    {docs.ami.formulaTitle}
                  </h3>
                  <code className="mt-3 block overflow-x-auto rounded bg-surface px-3 py-2 font-mono text-sm text-brand">
                    {docs.ami.formula}
                  </code>
                </ReferenceDetails>

                <ReferenceDetails summary={docs.levels.title}>
                  <p className="body-copy text-sm">{docs.levelMetrics.intro}</p>
                  <h3 className="mt-6 font-mono text-base font-semibold text-ink">
                    {docs.levelMetrics.derivedTitle}
                  </h3>
                  <div className="mt-3 grid gap-3">
                    {docs.levelMetrics.derived.map((item) => (
                      <div
                        className="border-t border-line pt-3 first:border-t-0 first:pt-0"
                        key={item.name}
                      >
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
                      <div
                        className="rounded-md border border-line bg-surface px-3 py-2"
                        key={item.name}
                      >
                        <code className="font-bold text-ink">{item.name}</code>
                        <p className="mt-0.5 text-xs text-muted">{item.desc}</p>
                      </div>
                    ))}
                  </dl>
                  <p className="body-copy mt-6 text-sm">{docs.levels.intro}</p>
                  <div className="mt-4 overflow-hidden rounded-lg border border-line">
                    <div className="flex gap-3 border-b border-line bg-surface px-4 py-3 text-xs font-bold uppercase tracking-wide text-muted">
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
                                {idx > 0 && (
                                  <span className="px-0.5 text-muted">
                                    {docs.levels.clauseJoin}
                                  </span>
                                )}
                                <code className="rounded bg-surface px-1.5 py-0.5 text-ink">
                                  {clause[0]}
                                </code>
                                <span className="text-muted">{clause[1]}</span>
                                <code className="rounded bg-surface px-1.5 py-0.5 font-bold text-ink">
                                  {clause[2]}
                                </code>
                              </Fragment>
                            ))
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ReferenceDetails>
              </div>
            </article>

            <ProfileTaxonomyGuide locale={locale} />
          </section>

          <section
            className="mt-8 scroll-mt-24 overflow-hidden rounded-lg border border-line bg-surface shadow-sm"
            id="flags"
          >
            <div className="border-b border-line px-4 py-4 sm:px-5">
              <SectionHeading href="#flags">{docs.table.title}</SectionHeading>
              <p className="body-copy mt-3 text-sm">{docs.table.description}</p>
            </div>
            <div className="grid gap-3 border-b border-line bg-canvas px-4 py-3 text-xs font-bold uppercase tracking-wide text-muted sm:grid-cols-[1fr_1fr_1fr_1.4fr]">
              <span>{docs.table.flag}</span>
              <span>{docs.table.values}</span>
              <span>{docs.table.default}</span>
              <span>{docs.table.descriptionHeader}</span>
            </div>
            {docs.table.rows.map((row) => (
              <div
                className="grid gap-2 border-b border-line px-4 py-3 text-sm last:border-b-0 sm:grid-cols-[1fr_1fr_1fr_1.4fr]"
                key={row.flag}
              >
                <code className="break-words font-bold text-ink">{row.flag}</code>
                <span className="text-muted">{row.values}</span>
                <span className="text-muted">{row.defaultValue}</span>
                <span className="text-muted">{row.description}</span>
              </div>
            ))}
            <div className="border-t border-line px-4 py-4 sm:px-5">
              <h3 className="font-mono text-base font-semibold text-ink">
                {docs.table.commandsTitle}
              </h3>
              <div className="mt-3 grid gap-3">
                {docs.table.commands.map((command) => (
                  <div
                    className="rounded-md border border-line bg-canvas px-3 py-3"
                    key={command.name}
                  >
                    <code className="font-bold text-brand">{command.name}</code>
                    <p className="mt-2 text-sm leading-6 text-muted">{command.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        <DocsToc items={tocItems} label={docs.tocLabel} variant="aside" />
      </div>
    </main>
  );
}
