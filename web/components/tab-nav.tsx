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
    <nav className="flex min-w-0 gap-1 rounded-full border border-line bg-white/80 p-1 shadow-sm">
      {tabRoutes.map((tab) => {
        const href = localizePath(tab.href, locale);
        const active = pathname === href;

        return (
          <Link
            aria-current={active ? "page" : undefined}
            className={[
              "min-w-fit rounded-full px-3 py-2 text-sm font-semibold transition sm:px-4",
              active ? "bg-ink text-white" : "text-muted hover:bg-paper hover:text-ink",
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
