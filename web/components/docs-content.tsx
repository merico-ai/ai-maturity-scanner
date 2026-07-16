import type { Locale } from "../lib/i18n";
import { messages } from "../lib/i18n";

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

  return (
    <main className="page-shell py-8 sm:py-12">
      <section className="max-w-3xl">
        <p className="eyebrow">{docs.eyebrow}</p>
        <h1 className="page-title mt-3 sm:text-5xl">{docs.title}</h1>
        <p className="body-copy mt-4 text-base">{docs.description}</p>
      </section>

      <section className="mt-8 grid gap-4">
        <article className="surface-card">
          <h2 className="font-mono text-xl font-semibold text-ink">{docs.install}</h2>
          <pre className="code-scroll code-panel mt-4 p-4 text-sm">
            <code>{"npm install -g @merico-ai/maturity-scanner"}</code>
          </pre>
        </article>
        <article className="surface-card">
          <h2 className="font-mono text-xl font-semibold text-ink">{docs.usage}</h2>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {docs.usageExamples.map((example) => (
              <div className="min-w-0" key={example.title}>
                <h3 className="font-mono text-base font-semibold text-ink">{example.title}</h3>
                <pre className="code-scroll code-panel mt-3 p-4 text-sm">
                  <code>{example.code}</code>
                </pre>
              </div>
            ))}
          </div>
        </article>
        <article className="surface-card">
          <h2 className="font-mono text-xl font-semibold text-ink">{docs.config.title}</h2>
          <p className="body-copy mt-4 text-sm">{docs.config.description}</p>
          <p className="body-copy mt-6 text-sm">{docs.config.configFile}</p>
          <pre className="code-scroll code-panel mt-3 p-4 text-sm">
            <code>{docs.config.configFileCode}</code>
          </pre>
          <p className="body-copy mt-6 text-sm">{docs.config.flag}</p>
          <pre className="code-scroll code-panel mt-3 p-4 text-sm">
            <code>{docs.config.flagCode}</code>
          </pre>
          <p className="body-copy mt-6 text-sm">{docs.config.default}</p>
          <ul className="mt-4 grid gap-2 text-sm text-muted">
            {docs.config.notes.map((note) => (
              <li className="rounded-md border border-line bg-canvas px-3 py-2" key={note}>
                {note}
              </li>
            ))}
          </ul>
        </article>
        <article className="surface-card">
          <h2 className="font-mono text-xl font-semibold text-ink">{docs.mcpSupport.title}</h2>
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

      <section className="mt-8 overflow-hidden rounded-lg border border-line bg-surface shadow-sm">
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
    </main>
  );
}
