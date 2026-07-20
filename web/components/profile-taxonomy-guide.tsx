import type { Locale } from "../lib/i18n";
import { profileTaxonomy } from "../lib/profile-taxonomy";

type ProfileTaxonomyGuideProps = {
  locale: Locale;
};

export function ProfileTaxonomyGuide({ locale }: ProfileTaxonomyGuideProps) {
  const taxonomy = profileTaxonomy[locale];

  return (
    <article className="surface-card min-w-0 scroll-mt-24 sm:p-6" id="repository-profile">
      <p className="eyebrow">{taxonomy.eyebrow}</p>
      <h2 className="mt-3 font-mono text-2xl font-semibold text-ink">{taxonomy.title}</h2>
      <p className="body-copy mt-3 text-sm">{taxonomy.intro}</p>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <div>
          <h3 className="font-mono text-lg font-semibold text-ink">{taxonomy.primaryTitle}</h3>
          <p className="mt-2 text-sm leading-6 text-muted">{taxonomy.primaryDescription}</p>
          <div className="mt-4 grid gap-3">
            {taxonomy.primary.map((item) => (
              <section className="rounded-md border border-line bg-canvas p-4" key={item.id}>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <h4 className="font-semibold text-ink">{item.title}</h4>
                  <code className="text-xs font-bold text-brand">{item.id}</code>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted">{item.description}</p>
                <p className="mt-2 text-xs leading-5 text-muted">{item.rule}</p>
              </section>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-mono text-lg font-semibold text-ink">{taxonomy.traitTitle}</h3>
          <p className="mt-2 text-sm leading-6 text-muted">{taxonomy.traitDescription}</p>
          <div className="mt-4 grid gap-3">
            {taxonomy.traits.map((item) => (
              <section className="rounded-md border border-line bg-canvas p-4" key={item.id}>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <h4 className="font-semibold text-ink">{item.title}</h4>
                  <code className="text-xs font-bold text-brand">{item.id}</code>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted">{item.description}</p>
                <p className="mt-2 text-xs leading-5 text-muted">{item.rule}</p>
              </section>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className="rounded-md border border-line bg-canvas p-4">
          <h3 className="font-mono text-lg font-semibold text-ink">{taxonomy.selectionTitle}</h3>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-muted">
            {taxonomy.selectionSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>
        <section className="rounded-md border border-line bg-canvas p-4">
          <h3 className="font-mono text-lg font-semibold text-ink">{taxonomy.evidenceTitle}</h3>
          <p className="mt-3 text-sm leading-6 text-muted">{taxonomy.evidenceDescription}</p>
        </section>
      </div>
    </article>
  );
}
