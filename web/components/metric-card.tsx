type MetricCardProps = {
  title: string;
  weight: string;
  description: string;
};

export function MetricCard({ title, weight, description }: MetricCardProps) {
  return (
    <article className="surface-card">
      <div className="flex items-start justify-between gap-4">
        <h3 className="font-mono text-lg font-semibold text-ink">{title}</h3>
        <span className="rounded-md border border-brand/30 bg-brand/10 px-3 py-1 text-xs font-bold text-brand">
          {weight}
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-muted">{description}</p>
    </article>
  );
}
