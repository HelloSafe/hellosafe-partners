"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { track } from "@/lib/analytics";

type BadgeTone = "success" | "accent" | "muted";

type PerkItem = {
  brand: string;
  category: string;
  headline: string;
  body: string;
  badge: string;
  badgeTone: BadgeTone;
  code: string | null;
  ctaUrl: string | null;
  ctaCopy: string;
};

type Step = { step: string; title: string; body: string };

const BRAND_GLYPH: Record<string, string> = {
  AirHelp: "✈️",
  Saily: "📶",
  Atlys: "🛂",
};

const BADGE_CLASS: Record<BadgeTone, string> = {
  success: "bg-success-50 text-success-600",
  accent: "bg-accent-50 text-accent-700",
  muted: "bg-surface-100 text-ink-500",
};

export function PerksPanel() {
  const t = useTranslations("dashboard.perks");
  const items = t.raw("items") as PerkItem[];
  const steps = t.raw("howItWorks.items") as Step[];
  const [copied, setCopied] = useState<string | null>(null);

  const onCopy = (item: PerkItem) => {
    if (!item.code) return;
    navigator.clipboard?.writeText(item.code);
    setCopied(item.brand);
    track("perk_code_copied", { brand: item.brand });
    setTimeout(() => setCopied(null), 2000);
  };

  const onOpen = (item: PerkItem) => {
    if (!item.ctaUrl) return;
    track("perk_offer_opened", { brand: item.brand });
  };

  return (
    <div className="space-y-12 max-w-7xl">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">
          {t.raw("howItWorks.eyebrow") as string}
        </p>
        <h1 className="mt-2 text-3xl lg:text-4xl font-bold tracking-tight">
          {t("title")}
        </h1>
        <p className="mt-3 text-ink-700 max-w-3xl">{t("subtitle")}</p>
      </header>

      <section className="rounded-3xl border border-surface-200 bg-surface-50 p-6 lg:p-8">
        <div className="max-w-2xl">
          <h2 className="text-xl lg:text-2xl font-bold tracking-tight">
            {t("howItWorks.title")}
          </h2>
          <p className="mt-2 text-sm text-ink-700">{t("howItWorks.subtitle")}</p>
        </div>
        <ol className="mt-6 grid gap-4 md:grid-cols-3 relative">
          <div className="hidden md:block absolute top-7 left-[16%] right-[16%] h-px bg-gradient-to-r from-brand-200 via-accent-200 to-success-200" />
          {steps.map((s) => (
            <li
              key={s.step}
              className="relative rounded-2xl border border-surface-200 bg-white p-5"
            >
              <span className="relative z-10 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 text-white font-display text-base font-bold tabular-nums">
                {s.step}
              </span>
              <h3 className="mt-4 font-bold text-ink-900">{s.title}</h3>
              <p className="mt-2 text-sm text-ink-700">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="grid gap-6 grid-cols-1 md:grid-cols-2">
        {items.map((item) => {
          const isPlaceholder = !item.code && !item.ctaUrl;
          const glyph = BRAND_GLYPH[item.brand] ?? "🎁";
          return (
            <article
              key={item.brand}
              className={`hs-card-hover rounded-2xl border border-surface-200 bg-white p-6 flex flex-col ${
                isPlaceholder ? "opacity-70" : ""
              }`}
            >
              <header className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-surface-100 text-2xl">
                    {glyph}
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">
                      {item.category}
                    </p>
                    <p className="font-bold text-ink-900">{item.brand}</p>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center rounded-full px-3 h-7 text-xs font-bold ${BADGE_CLASS[item.badgeTone]}`}
                >
                  {item.badge}
                </span>
              </header>

              <h3 className="mt-5 font-display text-2xl font-bold text-ink-900 tracking-tight leading-tight">
                {item.headline}
              </h3>
              <p className="mt-3 text-sm text-ink-700 leading-relaxed">
                {item.body}
              </p>

              {item.code && (
                <div className="mt-5 flex items-center gap-2 rounded-xl border border-dashed border-brand-200 bg-brand-50 px-4 h-12 font-mono text-sm font-semibold text-brand-900">
                  <span className="opacity-60 text-xs">CODE</span>
                  <span className="tracking-wider">{item.code}</span>
                </div>
              )}

              <div className="mt-auto pt-5">
                {item.code ? (
                  <button
                    type="button"
                    onClick={() => onCopy(item)}
                    disabled={copied === item.brand}
                    className="inline-flex items-center justify-center gap-2 w-full h-11 px-5 rounded-xl bg-brand-50 border border-brand-100 text-brand-900 text-sm font-semibold hover:bg-brand-100 transition-colors"
                  >
                    {copied === item.brand
                      ? `✓ ${t("cardCopied")}`
                      : t("cardCopyCode")}
                  </button>
                ) : item.ctaUrl ? (
                  <Link
                    href={item.ctaUrl as never}
                    onClick={() => onOpen(item)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full h-11 px-5 rounded-xl bg-brand-50 border border-brand-100 text-brand-900 text-sm font-semibold hover:bg-brand-100 transition-colors"
                  >
                    {t("cardSeeOffer")} →
                  </Link>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="inline-flex items-center justify-center gap-2 w-full h-11 px-5 rounded-xl bg-surface-100 border border-surface-200 text-ink-500 text-sm font-semibold cursor-not-allowed"
                  >
                    {item.ctaCopy}
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </section>

      <p className="text-xs text-ink-500 max-w-3xl">{t("footnote")}</p>
    </div>
  );
}
