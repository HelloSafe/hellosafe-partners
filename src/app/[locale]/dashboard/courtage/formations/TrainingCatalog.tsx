"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

type Format = "elearning" | "webinar" | "session";
type Category =
  | "fundamentals"
  | "selling"
  | "atlas"
  | "compliance"
  | "claims"
  | "digital";

type Module = {
  id: string;
  category: Category;
  title: string;
  body: string;
  duration: number; // hours
  format: Format;
  price: number; // EUR HT, 0 = free
};

const CATEGORY_ORDER: Category[] = [
  "fundamentals",
  "selling",
  "atlas",
  "compliance",
  "claims",
  "digital",
];

const FORMAT_ICON: Record<Format, string> = {
  elearning: "💻",
  webinar: "🎥",
  session: "🏛",
};

export function TrainingCatalog() {
  const t = useTranslations("dashboard.training");
  const modules = t.raw("modules") as Module[];
  const [selected, setSelected] = useState<Category | "all">("all");

  const visible = useMemo(() => {
    if (selected === "all") return modules;
    return modules.filter((m) => m.category === selected);
  }, [modules, selected]);

  const grouped = useMemo(() => {
    const map = new Map<Category, Module[]>();
    for (const m of visible) {
      if (!map.has(m.category)) map.set(m.category, []);
      map.get(m.category)!.push(m);
    }
    return CATEGORY_ORDER.filter((c) => map.has(c)).map((c) => ({
      category: c,
      modules: map.get(c)!,
    }));
  }, [visible]);

  return (
    <div className="max-w-6xl space-y-8">
      <header>
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-ink-900">
          {t("title")}
        </h1>
        <p className="mt-2 text-ink-700 max-w-3xl leading-relaxed">
          {t("subtitle")}
        </p>
      </header>

      {/* Soon banner */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900 leading-relaxed flex items-start gap-3">
        <span className="text-xl">⏳</span>
        <p className="flex-1">{t("soonBanner")}</p>
        <a
          href="mailto:formations@hellosafe.com?subject=Catalogue%20formations%20Atlas%20%E2%80%94%20m%27inscrire"
          className="shrink-0 h-9 px-4 inline-flex items-center rounded-lg bg-amber-500 text-white text-xs font-bold hover:bg-amber-600 transition-colors"
        >
          M&apos;inscrire
        </a>
      </div>

      {/* DDA note */}
      <div className="rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-700 leading-relaxed flex items-start gap-3">
        <span>🛡</span>
        <p>{t("ddaNote")}</p>
      </div>

      {/* Category filter */}
      <nav className="flex flex-wrap gap-2">
        <CategoryChip
          label="Tout voir"
          on={selected === "all"}
          onClick={() => setSelected("all")}
        />
        {CATEGORY_ORDER.map((c) => (
          <CategoryChip
            key={c}
            label={t(`categories.${c}`)}
            on={selected === c}
            onClick={() => setSelected(c)}
          />
        ))}
      </nav>

      {/* Modules grouped by category */}
      <div className="space-y-10">
        {grouped.map(({ category, modules: list }) => (
          <section key={category}>
            <h2 className="text-xs font-bold uppercase tracking-wider text-ink-500 mb-4">
              {t(`categories.${category}`)}
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {list.map((m) => (
                <ModuleCard key={m.id} module={m} />
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Custom session CTA */}
      <section className="rounded-2xl border border-surface-200 bg-gradient-to-br from-brand-50 via-white to-white p-6 lg:p-8">
        <h2 className="text-lg font-bold text-ink-900">{t("contactCta")}</h2>
        <p className="mt-2 text-sm text-ink-700 max-w-2xl leading-relaxed">
          {t("contactBody")}
        </p>
        <a
          href="mailto:formations@hellosafe.com?subject=Session%20de%20formation%20sur%20mesure"
          className="mt-4 inline-flex h-10 px-5 items-center rounded-lg bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition-colors"
        >
          ✉ formations@hellosafe.com
        </a>
      </section>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function CategoryChip({
  label,
  on,
  onClick,
}: {
  label: string;
  on: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-9 px-3.5 rounded-full text-sm font-medium transition-colors ${
        on
          ? "bg-brand-500 text-white"
          : "bg-white border border-surface-300 text-ink-700 hover:border-brand-300"
      }`}
    >
      {label}
    </button>
  );
}

function ModuleCard({ module: m }: { module: Module }) {
  const t = useTranslations("dashboard.training");

  const isFree = m.price === 0;
  const isCompliance = m.category === "compliance";

  return (
    <article className="rounded-2xl border border-surface-200 bg-white p-5 flex flex-col hover:border-brand-300 transition-colors opacity-90">
      <header className="flex items-center gap-2 mb-3">
        <span
          className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-surface-100"
          aria-hidden
        >
          {FORMAT_ICON[m.format]}
        </span>
        <span className="text-[0.65rem] font-bold uppercase tracking-wider text-ink-500">
          {t(`format.${m.format}`)}
        </span>
        <span className="ml-auto text-xs font-mono tabular-nums text-ink-700">
          {t("format.hours", { hours: m.duration })}
        </span>
      </header>

      <h3 className="font-bold text-ink-900 leading-snug">{m.title}</h3>
      <p className="mt-2 text-sm text-ink-700 leading-relaxed flex-1">
        {m.body}
      </p>

      <footer className="mt-4 pt-4 border-t border-surface-100 flex items-center justify-between gap-2">
        <span
          className={`text-sm font-semibold ${
            isFree ? "text-emerald-700" : "text-ink-900"
          }`}
        >
          {isFree
            ? t("format.free")
            : t("format.paid", { price: m.price })}
        </span>
        {isCompliance && (
          <span
            className="inline-flex items-center rounded-full bg-brand-50 text-brand-700 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider"
            title={t("format.ddaHours")}
          >
            DDA
          </span>
        )}
      </footer>
    </article>
  );
}
