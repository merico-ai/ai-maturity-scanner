import type { Metadata } from "next";
import "../globals.css";
import { RootShell } from "../../components/root-shell";

export const metadata: Metadata = {
  title: "AI Maturity Scanner",
  description:
    "Scan a repository and understand its AI coding maturity with a local CLI report.",
};

export default function EnglishLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <RootShell lang="en">{children}</RootShell>;
}
