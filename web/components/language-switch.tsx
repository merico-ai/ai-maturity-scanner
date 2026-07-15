"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { alternateLocalePath, localeFromPathname, messages } from "../lib/i18n";

export function LanguageSwitch() {
  const pathname = usePathname();
  const locale = localeFromPathname(pathname);
  const nav = messages[locale].nav;

  return (
    <div
      aria-label={nav.languageLabel}
      className="flex shrink-0 items-center gap-1 rounded-full border border-line bg-white/80 p-1 text-xs font-bold shadow-sm"
    >
      <Link
        aria-current={locale === "zh" ? "true" : undefined}
        className={[
          "whitespace-nowrap rounded-full px-2.5 py-2 transition",
          locale === "zh" ? "bg-ink text-white" : "text-muted hover:bg-paper hover:text-ink",
        ].join(" ")}
        href={alternateLocalePath(pathname, "zh")}
      >
        {nav.zh}
      </Link>
      <Link
        aria-current={locale === "en" ? "true" : undefined}
        className={[
          "whitespace-nowrap rounded-full px-2.5 py-2 transition",
          locale === "en" ? "bg-ink text-white" : "text-muted hover:bg-paper hover:text-ink",
        ].join(" ")}
        href={alternateLocalePath(pathname, "en")}
      >
        {nav.en}
      </Link>
    </div>
  );
}
