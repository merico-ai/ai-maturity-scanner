"use client";

import { useEffect, useState } from "react";

export type TocItem = { id: string; label: string };

type DocsTocProps = {
  items: TocItem[];
  label: string;
  variant: "aside" | "inline";
};

// Matches the `scroll-mt-24` on each section so the active section flips
// just as its heading slides under the sticky header.
const HEADER_OFFSET = 96;

function ListIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
    </svg>
  );
}

function TocList({
  items,
  activeId,
  onNavigate,
}: {
  items: TocItem[];
  activeId: string | null;
  onNavigate?: () => void;
}) {
  return (
    <ul className="mt-3 grid gap-1 border-l border-line">
      {items.map((item) => {
        const active = item.id === activeId;

        return (
          <li className="-ml-px" key={item.id}>
            <a
              aria-current={active ? "true" : undefined}
              className={[
                "block border-l-2 px-3 py-1.5 text-sm transition",
                active
                  ? "border-brand font-semibold text-ink"
                  : "border-transparent text-muted hover:border-line hover:text-ink",
              ].join(" ")}
              href={`#${item.id}`}
              onClick={onNavigate}
            >
              {item.label}
            </a>
          </li>
        );
      })}
    </ul>
  );
}

export function DocsToc({ items, label, variant }: DocsTocProps) {
  const [activeId, setActiveId] = useState<string | null>(items[0]?.id ?? null);
  const [open, setOpen] = useState(false);

  // scroll-spy only for the sticky aside (desktop); the mobile popover stays closed.
  useEffect(() => {
    if (variant !== "aside") {
      return;
    }

    const sections = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) {
      return;
    }

    const updateActive = () => {
      let current: string | null = null;
      for (const section of sections) {
        if (section.getBoundingClientRect().top - HEADER_OFFSET <= 0) {
          current = section.id;
        }
      }
      setActiveId(current ?? sections[0]?.id ?? null);
    };

    updateActive();
    const observer = new IntersectionObserver(updateActive, {
      rootMargin: "0px 0px -70% 0px",
      threshold: 0,
    });
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [items, variant]);

  if (variant === "aside") {
    return (
      <aside
        aria-label={label}
        className="hidden w-48 shrink-0 self-start overflow-y-auto lg:sticky lg:top-24 lg:block lg:max-h-[calc(100vh-7rem)]"
      >
        <p className="font-mono text-xs font-bold uppercase tracking-wide text-muted">{label}</p>
        <TocList activeId={activeId} items={items} />
      </aside>
    );
  }

  // Mobile: floating button bottom-left (keeps clear of BackToTop at bottom-right)
  // with a click-away backdrop + popover, so it stays reachable while scrolling.
  return (
    <div className="lg:hidden">
      {open && (
        <button
          aria-hidden="true"
          className="fixed inset-0 cursor-default bg-slate-950/50"
          tabIndex={-1}
          type="button"
          onClick={() => setOpen(false)}
        />
      )}
      {open && (
        <div className="fixed bottom-20 left-5 z-40 w-60 max-w-[calc(100vw-2.5rem)] rounded-md border border-line bg-surface p-3 shadow-soft">
          <p className="font-mono text-xs font-bold uppercase tracking-wide text-muted">{label}</p>
          <TocList activeId={null} items={items} onNavigate={() => setOpen(false)} />
        </div>
      )}
      <button
        aria-controls="docs-toc-inline"
        aria-expanded={open}
        aria-label={label}
        className="fixed bottom-5 left-5 z-40 grid h-11 w-11 place-items-center rounded-md border border-brand/40 bg-surface text-brand shadow-soft transition hover:bg-slate-700"
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        <ListIcon />
      </button>
    </div>
  );
}
