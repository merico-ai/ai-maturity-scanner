type SectionHeadingProps = Readonly<{
  children: React.ReactNode;
  href: string;
}>;

// Turns each docs section heading into a permalink: the heading text links to
// the section's own anchor, and a `#` fades in on hover so the link is
// discoverable (same pattern as GitHub/Docusaurus). The `#` is purely visual —
// the text link is the single keyboard/screen-reader focusable target.
export function SectionHeading({ children, href }: SectionHeadingProps) {
  return (
    <h2 className="group flex items-center gap-2 font-mono text-xl font-semibold text-ink">
      <a className="rounded transition hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60" href={href}>
        {children}
      </a>
      <a
        aria-hidden="true"
        className="select-none text-muted opacity-0 transition hover:text-brand group-hover:opacity-100"
        href={href}
        tabIndex={-1}
      >
        #
      </a>
    </h2>
  );
}
