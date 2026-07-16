"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { localeFromPathname, localizePath, messages, normalizePathname } from "../lib/i18n";

const tabRoutes = [
  { href: "/", labelKey: "home" },
  { href: "/quick-start", labelKey: "quickStart" },
  { href: "/docs", labelKey: "docs" },
  { href: "/metrics", labelKey: "metrics" },
  { href: "/about", labelKey: "about" },
] as const;

function MenuIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function TabNav() {
  const pathname = usePathname();
  const normalizedPathname = normalizePathname(pathname);
  const locale = localeFromPathname(pathname);
  const nav = messages[locale].nav;
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop: horizontal tab bar (visually unchanged) */}
      <nav className="hidden min-w-0 gap-1 rounded-md border border-line bg-surface p-1 shadow-sm lg:flex lg:flex-none">
        {tabRoutes.map((tab) => {
          const href = localizePath(tab.href, locale);
          const active = normalizedPathname === normalizePathname(href);

          return (
            <Link
              aria-current={active ? "page" : undefined}
              className={[
                "min-w-0 flex-1 whitespace-nowrap rounded-full px-2 py-2 text-center text-xs font-semibold transition sm:px-4 sm:text-sm lg:flex-none",
                active ? "bg-brand text-white" : "text-muted hover:bg-slate-700 hover:text-ink",
              ].join(" ")}
              href={href}
              key={tab.href}
            >
              {nav[tab.labelKey]}
            </Link>
          );
        })}
      </nav>

      {/* Mobile: hamburger toggle (order-last keeps it right of the language switch) */}
      <button
        type="button"
        aria-controls="mobile-nav"
        aria-expanded={open}
        aria-label={nav.menuLabel}
        className="order-last grid h-9 w-9 shrink-0 place-items-center rounded-md border border-line bg-surface text-ink shadow-sm transition hover:bg-slate-700 lg:hidden"
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <CloseIcon /> : <MenuIcon />}
      </button>

      {/* Mobile: dropdown panel + click-away backdrop */}
      {open && (
        <div className="absolute inset-x-0 top-full z-40 lg:hidden">
          <button
            aria-hidden="true"
            className="fixed inset-0 cursor-default bg-slate-950/50"
            tabIndex={-1}
            type="button"
            onClick={() => setOpen(false)}
          />
          <nav className="page-shell relative border-b border-line bg-canvas py-2 shadow-lg" id="mobile-nav">
            <div className="flex flex-col gap-1">
              {tabRoutes.map((tab) => {
                const href = localizePath(tab.href, locale);
                const active = normalizedPathname === normalizePathname(href);

                return (
                  <Link
                    aria-current={active ? "page" : undefined}
                    className={[
                      "rounded-md px-3 py-2.5 text-sm font-semibold transition",
                      active ? "bg-brand text-white" : "text-muted hover:bg-slate-700 hover:text-ink",
                    ].join(" ")}
                    href={href}
                    key={tab.href}
                    onClick={() => setOpen(false)}
                  >
                    {nav[tab.labelKey]}
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
