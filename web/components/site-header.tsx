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
    <header className="sticky top-0 z-20 border-b border-line/70 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <Link className="flex min-w-0 items-center gap-3" href={localizePath("/", locale)}>
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-ink text-sm font-black text-white">
            AMI
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-bold text-ink sm:text-base">
              AI Maturity Scanner
            </span>
            <span className="block text-xs font-medium text-muted">{header.subtitle}</span>
          </span>
        </Link>
        <div className="flex min-w-0 items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
          <TabNav />
          <LanguageSwitch />
        </div>
      </div>
    </header>
  );
}
