type MetricCardProps = {
  title: string;
  weight: string;
  description: string;
};

export function MetricCard({ title, weight, description }: MetricCardProps) {
  return (
    <article className="rounded-lg border border-line bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-lg font-bold text-ink">{title}</h3>
        <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-brand">{weight}</span>
      </div>
      <p className="mt-3 text-sm leading-6 text-muted">{description}</p>
    </article>
  );
}
