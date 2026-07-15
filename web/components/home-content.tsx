import Link from "next/link";
import { CtaPanel } from "./cta-panel";
import { MetricCard } from "./metric-card";
import type { Locale } from "../lib/i18n";
import { localizePath, messages } from "../lib/i18n";

type HomeContentProps = {
  locale: Locale;
};

export function HomeContent({ locale }: HomeContentProps) {
  const home = messages[locale].home;
  const metrics = messages[locale].metrics.homeOverview;

  return (
    <main>
      <section className="mx-auto grid max-w-6xl gap-8 px-4 pb-10 pt-8 sm:px-6 sm:pt-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:pb-16">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-brand">{home.eyebrow}</p>
          <h1 className="mt-4 text-4xl font-black leading-tight text-ink sm:text-5xl lg:text-6xl">
            {home.title}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted sm:text-lg">
            {home.description}
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              className="rounded-lg bg-ink px-5 py-3 text-center text-sm font-bold text-white transition hover:bg-slate-800"
              href={localizePath("/quick-start", locale)}
            >
              {home.primaryCta}
            </Link>
            <Link
              className="rounded-lg border border-line bg-white px-5 py-3 text-center text-sm font-bold text-ink transition hover:border-ink"
              href={localizePath("/metrics", locale)}
            >
              {home.secondaryCta}
            </Link>
          </div>
        </div>
        <div className="rounded-lg border border-line bg-white p-4 shadow-soft">
          <div className="rounded-md bg-slate-950 p-4 text-sm text-slate-100">
            <pre className="code-scroll">
              <code>{`npx @merico-ai/maturity-scanner ./my-repo

AI Maturity Report
Level: L3    AMI: 67.5/100

Configuration depth  75.0
Context richness     60.0
Integration breadth  40.0`}</code>
            </pre>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            {["L0-L4", "AMI 0-100", "3 dimensions"].map((item) => (
              <div className="rounded-md bg-paper px-2 py-3 text-xs font-bold text-ink" key={item}>
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="content-grid">
          {home.features.map((feature) => (
            <div className="rounded-lg border border-line bg-white p-5 shadow-sm" key={feature}>
              <p className="text-sm leading-6 text-muted">{feature}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-accent">
              {home.metricEyebrow}
            </p>
            <h2 className="mt-2 text-3xl font-black text-ink">{home.metricTitle}</h2>
          </div>
          <Link
            className="text-sm font-bold text-brand hover:underline"
            href={localizePath("/metrics", locale)}
          >
            {home.metricLink}
          </Link>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {metrics.map((metric) => (
            <MetricCard
              description={metric.description}
              key={metric.title}
              title={metric.title}
              weight={metric.weight}
            />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <CtaPanel locale={locale} />
      </section>
    </main>
  );
}
