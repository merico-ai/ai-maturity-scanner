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
      <section className="page-shell grid gap-8 pb-10 pt-8 sm:pt-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pb-16">
        <div>
          <p className="eyebrow">{home.eyebrow}</p>
          <h1 className="page-title mt-4 sm:text-5xl lg:text-6xl">
            {home.title}
          </h1>
          <p className="body-copy mt-5 max-w-2xl text-base sm:text-lg">
            {home.description}
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              className="primary-button"
              href={localizePath("/quick-start", locale)}
            >
              {home.primaryCta}
            </Link>
            <Link
              className="secondary-button"
              href={localizePath("/metrics", locale)}
            >
              {home.secondaryCta}
            </Link>
          </div>
        </div>
        <div className="surface-card min-w-0">
          <div className="mb-3 flex items-center justify-between border-b border-line pb-3">
            <span className="font-mono text-sm font-semibold text-ink">scan-preview</span>
            <span className="rounded-md bg-brand/10 px-2.5 py-1 text-xs font-bold text-brand">
              L3
            </span>
          </div>
          <div className="code-panel min-w-0 p-4 text-sm">
            <pre className="code-scroll max-w-full">
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
              <div className="rounded-md border border-line bg-canvas px-2 py-3 text-xs font-bold text-ink" key={item}>
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="page-shell py-8">
        <div className="content-grid">
          {home.features.map((feature) => (
            <div className="surface-card" key={feature}>
              <p className="text-sm leading-6 text-muted">{feature}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="page-shell py-8">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow text-accent">
              {home.metricEyebrow}
            </p>
            <h2 className="mt-2 font-mono text-3xl font-semibold text-ink">{home.metricTitle}</h2>
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

      <section className="page-shell py-10">
        <CtaPanel locale={locale} />
      </section>
    </main>
  );
}
