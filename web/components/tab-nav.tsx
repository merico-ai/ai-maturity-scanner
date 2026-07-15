"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { localeFromPathname, localizePath, messages } from "../lib/i18n";

const tabRoutes = [
  { href: "/", labelKey: "home" },
  { href: "/quick-start", labelKey: "quickStart" },
  { href: "/about", labelKey: "about" },
] as const;

export function TabNav() {
  const pathname = usePathname();
  const locale = localeFromPathname(pathname);
  const nav = messages[locale].nav;

  return (
    <nav className="flex min-w-0 flex-1 gap-1 rounded-md border border-line bg-surface p-1 shadow-sm lg:flex-none">
      {tabRoutes.map((tab) => {
        const href = localizePath(tab.href, locale);
        const active = pathname === href;

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
  );
}
