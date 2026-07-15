import Link from "next/link";
import type { Locale } from "../lib/i18n";
import { localizePath, messages, vibeinsightUrl } from "../lib/i18n";

type CtaPanelProps = {
  locale: Locale;
};

export function CtaPanel({ locale }: CtaPanelProps) {
  const cta = messages[locale].cta;

  return (
    <section className="surface-card border-brand/40 bg-slate-900 p-5 text-white sm:p-6">
      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div>
          <p className="eyebrow">{cta.eyebrow}</p>
          <h2 className="mt-2 font-mono text-2xl font-semibold sm:text-3xl">{cta.title}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200 sm:text-base">
            {cta.description}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
          <Link
            className="primary-button"
            href={localizePath("/quick-start", locale)}
          >
            {cta.quickStart}
          </Link>
          <a
            className="secondary-button"
            href={vibeinsightUrl}
            rel="noreferrer"
            target="_blank"
          >
            {cta.vibeinsight}
          </a>
        </div>
      </div>
    </section>
  );
}
