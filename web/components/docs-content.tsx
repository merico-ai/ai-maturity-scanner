import type { Locale } from "../lib/i18n";
import { messages } from "../lib/i18n";

const flags = [
  ["[path]", "Repository path", "."],
  ["-f, --format", "terminal | md | json", "terminal"],
  ["-o, --out", "Write report to file", "stdout"],
  ["--lang", "zh | en", "zh"],
];

type DocsContentProps = {
  locale: Locale;
};

export function DocsContent({ locale }: DocsContentProps) {
  const docs = messages[locale].docs;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <section className="max-w-3xl">
        <p className="text-sm font-bold uppercase tracking-wide text-brand">{docs.eyebrow}</p>
        <h1 className="mt-3 text-4xl font-black text-ink sm:text-5xl">{docs.title}</h1>
        <p className="mt-4 text-base leading-7 text-muted">{docs.description}</p>
      </section>

      <section className="mt-8 grid gap-4">
        <article className="rounded-lg border border-line bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-ink">{docs.install}</h2>
          <pre className="code-scroll mt-4 rounded-md bg-slate-950 p-4 text-sm text-slate-100">
            <code>{"npm install -g @merico-ai/maturity-scanner"}</code>
          </pre>
        </article>
        <article className="rounded-lg border border-line bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-ink">{docs.usage}</h2>
          <pre className="code-scroll mt-4 rounded-md bg-slate-950 p-4 text-sm text-slate-100">
            <code>{`ai-maturity-scanner
ai-maturity-scanner ./my-repo
ai-maturity-scanner --format md
ai-maturity-scanner --format json --out report.json
ai-maturity-scanner --lang en`}</code>
          </pre>
        </article>
      </section>

      <section className="mt-8 overflow-hidden rounded-lg border border-line bg-white shadow-sm">
        <div className="grid grid-cols-[1fr_1fr_0.8fr] gap-0 border-b border-line bg-paper px-4 py-3 text-xs font-bold uppercase tracking-wide text-muted">
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
    </main>
  );
}
