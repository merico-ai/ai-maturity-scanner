import { MetricCard } from "./metric-card";
import type { Locale } from "../lib/i18n";
import { messages } from "../lib/i18n";

type MetricsContentProps = {
  locale: Locale;
};

export function MetricsContent({ locale }: MetricsContentProps) {
  const metrics = messages[locale].metrics;

  return (
    <main className="page-shell py-8 sm:py-12">
      <section className="max-w-3xl">
        <p className="eyebrow">{metrics.eyebrow}</p>
        <h1 className="page-title mt-3 sm:text-5xl">{metrics.title}</h1>
        <p className="body-copy mt-4 text-base">{metrics.description}</p>
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-3">
        {metrics.overview.map((metric) => (
          <MetricCard
            description={metric.description}
            key={metric.title}
            title={metric.title}
            weight={metric.weight}
          />
        ))}
      </section>

      <section className="surface-card mt-8 sm:p-6">
        <h2 className="font-mono text-2xl font-semibold text-ink">{metrics.levelTitle}</h2>
        <div className="mt-5 grid gap-3">
          {metrics.levels.map(([level, description]) => (
            <div
              className="grid gap-2 rounded-md border border-line bg-canvas p-4 sm:grid-cols-[5rem_1fr] sm:items-center"
              key={level}
            >
              <strong className="font-mono text-xl text-brand">{level}</strong>
              <span className="text-sm leading-6 text-muted">{description}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
