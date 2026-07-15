import { MetricCard } from "./metric-card";
import type { Locale } from "../lib/i18n";
import { messages } from "../lib/i18n";

type MetricsContentProps = {
  locale: Locale;
};

export function MetricsContent({ locale }: MetricsContentProps) {
  const metrics = messages[locale].metrics;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <section className="max-w-3xl">
        <p className="text-sm font-bold uppercase tracking-wide text-brand">{metrics.eyebrow}</p>
        <h1 className="mt-3 text-4xl font-black text-ink sm:text-5xl">{metrics.title}</h1>
        <p className="mt-4 text-base leading-7 text-muted">{metrics.description}</p>
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

      <section className="mt-8 rounded-lg border border-line bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-2xl font-black text-ink">{metrics.levelTitle}</h2>
        <div className="mt-5 grid gap-3">
          {metrics.levels.map(([level, description]) => (
            <div
              className="grid gap-2 rounded-md bg-paper p-4 sm:grid-cols-[5rem_1fr] sm:items-center"
              key={level}
            >
              <strong className="text-xl text-ink">{level}</strong>
              <span className="text-sm leading-6 text-muted">{description}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
