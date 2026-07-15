import type { Metadata } from "next";
import "../globals.css";
import { RootShell } from "../../components/root-shell";

export const metadata: Metadata = {
  title: "AI Maturity Scanner",
  description: "扫描仓库并通过本地 CLI 报告理解 AI 编程成熟度。",
};

export default function ChineseLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <RootShell lang="zh-CN">{children}</RootShell>;
}
