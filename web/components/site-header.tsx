"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { assetPath, localeFromPathname, localizePath, messages } from "../lib/i18n";
import { LanguageSwitch } from "./language-switch";
import { TabNav } from "./tab-nav";

export function SiteHeader() {
  const pathname = usePathname();
  const locale = localeFromPathname(pathname);
  const header = messages[locale].header;

  return (
    <header className="z-20 border-b border-line bg-canvas lg:sticky lg:top-0">
      <div className="page-shell relative flex flex-row items-center justify-between gap-2 py-2.5 sm:py-3">
        <Link className="flex min-w-0 items-center gap-3" href={localizePath("/", locale)}>
          <Image
            alt=""
            aria-hidden="true"
            className="h-8 w-8 shrink-0 rounded-md sm:h-9 sm:w-9"
            height={36}
            src={assetPath("/icon.png")}
            width={36}
          />
          <span className="min-w-0">
            <span className="block truncate font-mono text-sm font-bold text-ink sm:text-base">
              AI Maturity Scanner
            </span>
            <span className="block truncate text-xs font-medium text-muted">{header.subtitle}</span>
          </span>
        </Link>
        <div className="flex shrink-0 items-center gap-2">
          <TabNav />
          <LanguageSwitch />
        </div>
      </div>
    </header>
  );
}
