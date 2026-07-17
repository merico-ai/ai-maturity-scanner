import Link from "next/link";
import { CodeBlock } from "./code-block";
import type { Locale } from "../lib/i18n";
import { codeActions, localizePath, messages } from "../lib/i18n";

type QuickStartContentProps = {
  locale: Locale;
};

export function QuickStartContent({ locale }: QuickStartContentProps) {
  const quickStart = messages[locale].quickStart;

  return (
    <main className="page-shell py-8 sm:py-12">
      <section className="max-w-3xl">
        <p className="eyebrow">{quickStart.eyebrow}</p>
        <h1 className="page-title mt-3 sm:text-5xl">{quickStart.title}</h1>
        <p className="body-copy mt-4 text-base">{quickStart.description}</p>
      </section>

      <section className="surface-card mt-8 min-w-0 sm:p-6">
        <h2 className="font-mono text-2xl font-semibold text-ink">{quickStart.requirementsTitle}</h2>
        <div className="mt-5 grid min-w-0 gap-3 sm:grid-cols-2">
          {quickStart.requirements.map(([name, description]) => (
            <div className="min-w-0 rounded-md border border-line bg-canvas p-4" key={name}>
              <h3 className="font-mono text-lg font-semibold text-ink">{name}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 grid min-w-0 gap-4 lg:grid-cols-2">
        {quickStart.usageModes.map((mode) => (
          <article className="surface-card flex min-w-0 flex-col" key={mode.title}>
            <div className="mb-4 flex min-w-0 items-start gap-3">
              <span className="whitespace-nowrap rounded-md bg-brand/10 px-2.5 py-1 font-mono text-xs font-bold uppercase text-brand">
                {mode.label}
              </span>
              <div className="min-w-0">
                <h2 className="font-mono text-lg font-semibold text-ink">{mode.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted">{mode.description}</p>
              </div>
            </div>
            <div className="mt-auto grid gap-3">
              {mode.steps.map((step) => (
                <CodeBlock
                  code={step}
                  copiedLabel={codeActions[locale].copied}
                  copyLabel={codeActions[locale].copy}
                  key={step}
                  preClassName="max-w-full p-4 text-sm"
                />
              ))}
            </div>
          </article>
        ))}
      </section>

      <section className="surface-card mt-8 min-w-0 sm:p-6">
        <h2 className="font-mono text-2xl font-semibold text-ink">{quickStart.resultTitle}</h2>
        <p className="mt-3 text-sm leading-6 text-muted sm:text-base">
          {quickStart.resultDescription}
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Link
            className="primary-button"
            href={localizePath("/docs", locale)}
          >
            {quickStart.docsCta}
          </Link>
          <Link
            className="secondary-button"
            href={localizePath("/metrics", locale)}
          >
            {quickStart.metricsCta}
          </Link>
        </div>
      </section>
    </main>
  );
}
