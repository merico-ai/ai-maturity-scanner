import Link from "next/link";
import type { Locale } from "../lib/i18n";
import { localizePath, messages } from "../lib/i18n";

type QuickStartContentProps = {
  locale: Locale;
};

export function QuickStartContent({ locale }: QuickStartContentProps) {
  const quickStart = messages[locale].quickStart;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <section className="max-w-3xl">
        <p className="text-sm font-bold uppercase tracking-wide text-brand">{quickStart.eyebrow}</p>
        <h1 className="mt-3 text-4xl font-black text-ink sm:text-5xl">{quickStart.title}</h1>
        <p className="mt-4 text-base leading-7 text-muted">{quickStart.description}</p>
      </section>

      <section className="mt-8 min-w-0 rounded-lg border border-line bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-2xl font-black text-ink">{quickStart.requirementsTitle}</h2>
        <div className="mt-5 grid min-w-0 gap-3 sm:grid-cols-2">
          {quickStart.requirements.map(([name, description]) => (
            <div className="min-w-0 rounded-md bg-paper p-4" key={name}>
              <h3 className="text-lg font-bold text-ink">{name}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 grid min-w-0 gap-4">
        {quickStart.commands.map(([title, code], index) => (
          <article className="min-w-0 rounded-lg border border-line bg-white p-5 shadow-sm" key={title}>
            <div className="mb-3 flex min-w-0 items-center gap-3">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-ink text-sm font-bold text-white">
                {index + 1}
              </span>
              <h2 className="min-w-0 text-lg font-bold text-ink">{title}</h2>
            </div>
            <pre className="code-scroll max-w-full rounded-md bg-slate-950 p-4 text-sm text-slate-100">
              <code>{code}</code>
            </pre>
          </article>
        ))}
      </section>

      <section className="mt-8 grid min-w-0 gap-4 lg:grid-cols-3">
        {quickStart.formats.map(([format, description]) => (
          <div className="min-w-0 rounded-lg border border-line bg-white p-5 shadow-sm" key={format}>
            <h3 className="text-lg font-bold text-ink">--format {format}</h3>
            <p className="mt-3 text-sm leading-6 text-muted">{description}</p>
          </div>
        ))}
      </section>

      <section className="mt-8 min-w-0 rounded-lg border border-line bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-2xl font-black text-ink">{quickStart.resultTitle}</h2>
        <p className="mt-3 text-sm leading-6 text-muted sm:text-base">
          {quickStart.resultDescription}
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Link
            className="rounded-lg bg-ink px-5 py-3 text-center text-sm font-bold text-white"
            href={localizePath("/docs", locale)}
          >
            {quickStart.docsCta}
          </Link>
          <Link
            className="rounded-lg border border-line px-5 py-3 text-center text-sm font-bold text-ink"
            href={localizePath("/metrics", locale)}
          >
            {quickStart.metricsCta}
          </Link>
        </div>
      </section>
    </main>
  );
}
