"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { localeFromPathname, localizePath, messages } from "../lib/i18n";
import { LanguageSwitch } from "./language-switch";
import { TabNav } from "./tab-nav";

export function SiteHeader() {
  const pathname = usePathname();
  const locale = localeFromPathname(pathname);
  const header = messages[locale].header;

  return (
    <header className="sticky top-0 z-20 overflow-hidden border-b border-line/70 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-3 py-2.5 sm:px-6 sm:py-3 lg:flex-row lg:items-center lg:justify-between">
        <Link className="flex min-w-0 items-center gap-3" href={localizePath("/", locale)}>
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-ink text-xs font-black text-white sm:h-9 sm:w-9 sm:text-sm">
            AMI
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-bold text-ink sm:text-base">
              AI Maturity Scanner
            </span>
            <span className="block truncate text-xs font-medium text-muted">{header.subtitle}</span>
          </span>
        </Link>
        <div className="flex w-full min-w-0 items-center justify-between gap-2 overflow-hidden lg:w-auto">
          <TabNav />
          <LanguageSwitch />
        </div>
      </div>
    </header>
  );
}
