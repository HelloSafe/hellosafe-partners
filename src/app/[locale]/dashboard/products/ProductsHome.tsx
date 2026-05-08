"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

type Intent = "tourism" | "schengen" | "cancel" | "annual" | "pvt" | "other";

const INTENTS: { id: Intent; emoji: string; href: string | null }[] = [
  { id: "tourism", emoji: "🏖", href: "/dashboard/products/compare" },
  { id: "annual", emoji: "🔁", href: null },
  { id: "schengen", emoji: "🇪🇺", href: null },
  { id: "cancel", emoji: "🚫", href: null },
  { id: "pvt", emoji: "🎒", href: null },
  { id: "other", emoji: "➕", href: null },
];

export function ProductsHome() {
  const t = useTranslations("dashboard.products");

  return (
    <div className="max-w-5xl space-y-8">
      <header>
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-ink-900">
          {t("title")}
        </h1>
        <p className="mt-2 text-ink-700 max-w-2xl">{t("subtitle")}</p>
      </header>

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-500 mb-4">
          {t("intents.title")}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {INTENTS.map((intent) => {
            const card = (
              <article
                className={`relative h-full rounded-2xl border bg-white p-6 transition-all ${
                  intent.href
                    ? "border-surface-200 hover:border-brand-300 hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
                    : "border-surface-200 opacity-60"
                }`}
              >
                <div className="text-3xl">{intent.emoji}</div>
                <h3 className="mt-3 text-lg font-bold text-ink-900">
                  {t(`intents.${intent.id}.label`)}
                </h3>
                <p className="mt-1.5 text-sm text-ink-700 leading-relaxed">
                  {t(`intents.${intent.id}.body`)}
                </p>
                {!intent.href && (
                  <span className="mt-4 inline-flex items-center rounded-full bg-surface-100 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-ink-500">
                    {t("intents.soon")}
                  </span>
                )}
                {intent.href && (
                  <span className="mt-4 inline-flex items-center text-sm font-semibold text-brand-700">
                    →
                  </span>
                )}
              </article>
            );
            return intent.href ? (
              <Link
                key={intent.id}
                href={intent.href as never}
                className="block"
              >
                {card}
              </Link>
            ) : (
              <div key={intent.id}>{card}</div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
