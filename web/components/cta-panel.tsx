import Link from "next/link";
import type { Locale } from "../lib/i18n";
import { localizePath, messages, vibeinsightUrl } from "../lib/i18n";

type CtaPanelProps = {
  locale: Locale;
};

export function CtaPanel({ locale }: CtaPanelProps) {
  const cta = messages[locale].cta;

  return (
    <section className="rounded-lg border border-line bg-ink p-5 text-white shadow-soft sm:p-6">
      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-200">{cta.eyebrow}</p>
          <h2 className="mt-2 text-2xl font-bold sm:text-3xl">{cta.title}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200 sm:text-base">
            {cta.description}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
          <Link
            className="rounded-lg bg-white px-4 py-3 text-center text-sm font-bold text-ink transition hover:bg-slate-100"
            href={localizePath("/quick-start", locale)}
          >
            {cta.quickStart}
          </Link>
          <a
            className="rounded-lg border border-white/35 px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-white/10"
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
