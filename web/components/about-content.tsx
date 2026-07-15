import type { Locale } from "../lib/i18n";
import { messages, vibeinsightUrl } from "../lib/i18n";

type AboutContentProps = {
  locale: Locale;
};

export function AboutContent({ locale }: AboutContentProps) {
  const about = messages[locale].about;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <section className="max-w-3xl">
        <p className="text-sm font-bold uppercase tracking-wide text-brand">{about.eyebrow}</p>
        <h1 className="mt-3 text-4xl font-black text-ink sm:text-5xl">{about.title}</h1>
        <p className="mt-4 text-base leading-7 text-muted">{about.description}</p>
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-3">
        {about.cards.map(([title, description]) => (
          <article className="rounded-lg border border-line bg-white p-5 shadow-sm" key={title}>
            <h2 className="text-xl font-bold text-ink">{title}</h2>
            <p className="mt-3 text-sm leading-6 text-muted">{description}</p>
          </article>
        ))}
      </section>

      <section className="mt-8 rounded-lg border border-line bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-2xl font-black text-ink">{about.vibeTitle}</h2>
        <p className="mt-3 text-sm leading-6 text-muted sm:text-base">{about.vibeDescription}</p>
        <a
          className="mt-5 inline-flex rounded-lg bg-ink px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
          href={vibeinsightUrl}
          rel="noreferrer"
          target="_blank"
        >
          {about.vibeCta}
        </a>
      </section>
    </main>
  );
}
