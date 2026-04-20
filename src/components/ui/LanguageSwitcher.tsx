"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useState, useTransition, useRef, useEffect } from "react";
import { routing } from "@/i18n/routing";

// Hide entirely while only one locale is active.
const ENABLED = routing.locales.length > 1;

const LANG_LABELS: Record<string, { name: string; flag: string }> = {
  fr: { name: "Français", flag: "FR" },
  en: { name: "English", flag: "EN" },
  de: { name: "Deutsch", flag: "DE" },
  es: { name: "Español", flag: "ES" },
  it: { name: "Italiano", flag: "IT" },
  pt: { name: "Português", flag: "PT" },
  nl: { name: "Nederlands", flag: "NL" },
};

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const switchTo = (next: string) => {
    setOpen(false);
    startTransition(() => {
      router.replace(pathname, { locale: next as (typeof routing.locales)[number] });
    });
  };

  const current = LANG_LABELS[locale] ?? LANG_LABELS.fr;

  if (!ENABLED) return null;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={isPending}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 rounded-lg border border-surface-300 bg-white px-3 h-9 text-sm font-medium text-ink-700 hover:border-brand-300 hover:text-brand-700 focus-ring transition-colors"
      >
        <span className="font-mono text-[0.72rem] tracking-wider rounded bg-surface-100 text-ink-700 px-1.5 py-0.5">
          {current.flag}
        </span>
        <span className="hidden sm:inline">{current.name}</span>
        <svg
          aria-hidden
          width="10"
          height="6"
          viewBox="0 0 10 6"
          className="text-ink-500"
        >
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div
          role="listbox"
          className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-surface-300 bg-white py-1 shadow-lg z-50"
        >
          {routing.locales.map((l) => {
            const info = LANG_LABELS[l];
            const active = l === locale;
            return (
              <button
                key={l}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => switchTo(l)}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-surface-100 transition-colors ${active ? "text-brand-700 font-semibold" : "text-ink-700"}`}
              >
                <span className="font-mono text-[0.7rem] tracking-wider rounded bg-surface-100 text-ink-700 px-1.5 py-0.5">
                  {info.flag}
                </span>
                {info.name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
