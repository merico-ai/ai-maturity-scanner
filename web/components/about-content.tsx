import type { Locale } from "../lib/i18n";
import { messages, vibeinsightUrl } from "../lib/i18n";

type AboutContentProps = {
  locale: Locale;
};

export function AboutContent({ locale }: AboutContentProps) {
  const about = messages[locale].about;

  return (
    <main className="page-shell py-8 sm:py-12">
      <section className="max-w-3xl">
        <p className="eyebrow">{about.eyebrow}</p>
        <h1 className="page-title mt-3 sm:text-5xl">{about.title}</h1>
        <p className="body-copy mt-4 text-base">{about.description}</p>
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-3">
        {about.cards.map(([title, description]) => (
          <article className="surface-card" key={title}>
            <h2 className="font-mono text-xl font-semibold text-ink">{title}</h2>
            <p className="mt-3 text-sm leading-6 text-muted">{description}</p>
          </article>
        ))}
      </section>

      <section className="surface-card mt-8 sm:p-6">
        <h2 className="font-mono text-2xl font-semibold text-ink">{about.vibeTitle}</h2>
        <p className="mt-3 text-sm leading-6 text-muted sm:text-base">{about.vibeDescription}</p>
        <a
          className="primary-button mt-5"
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
