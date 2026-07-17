"use client";

import { useCallback, useRef, useState } from "react";

type CodeBlockProps = {
  code: string;
  /** 透传给内部 <pre>,保留各调用点原有的 code-scroll/code-panel/间距/尺寸类 */
  preClassName?: string;
  copyLabel: string;
  copiedLabel: string;
};

export function CodeBlock({ code, preClassName, copyLabel, copiedLabel }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCopy = useCallback(async () => {
    const writeFallback = () => {
      const textarea = document.createElement("textarea");
      textarea.value = code;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.top = "0";
      textarea.style.left = "0";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand("copy");
      } catch {
        // 回退仍失败时静默处理,按钮依旧给出视觉反馈
      }
      document.body.removeChild(textarea);
    };

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(code);
      } else {
        writeFallback();
      }
    } catch {
      writeFallback();
    }

    setCopied(true);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => setCopied(false), 2000);
  }, [code]);

  return (
    <div className="relative">
      <pre className={`code-scroll code-panel ${preClassName ?? ""}`}>
        <code>{code}</code>
      </pre>
      <button
        type="button"
        onClick={handleCopy}
        aria-label={copied ? copiedLabel : copyLabel}
        className={`absolute right-2 top-1/2 inline-flex -translate-y-1/2 items-center gap-1 rounded-md border px-2 py-1 text-xs font-semibold backdrop-blur-sm transition ${
          copied
            ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
            : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
        }`}
      >
        {copied ? (
          <CheckIcon className="size-3.5" />
        ) : (
          <CopyIcon className="size-3.5" />
        )}
        <span aria-hidden="true">{copied ? copiedLabel : copyLabel}</span>
      </button>
    </div>
  );
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <title>copy</title>
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <title>copied</title>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
