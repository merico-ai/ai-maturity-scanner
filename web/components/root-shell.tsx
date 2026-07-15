import { BackToTop } from "./back-to-top";
import { SiteHeader } from "./site-header";

type RootShellProps = Readonly<{
  children: React.ReactNode;
  lang: string;
}>;

export function RootShell({ children, lang }: RootShellProps) {
  return (
    <html lang={lang}>
      <body>
        <SiteHeader />
        {children}
        <BackToTop />
      </body>
    </html>
  );
}
