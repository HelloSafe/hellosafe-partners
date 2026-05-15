"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";

type DailyPoint = { date: string; clicks: number; sales: number };
type TopLink = {
  id: string;
  label: string;
  destination: string;
  language: string;
  subId: string;
  clicks: number;
  sales: number;
  commissionCents: number;
};
type OverviewData = {
  totals: { clicks: number; sales: number; commissionCents: number };
  daily: DailyPoint[];
  topLinks: TopLink[];
  partner: { name: string; companyName: string; partnerCode: string };
};

export function Overview() {
  const t = useTranslations("dashboard");
  const tlinks = useTranslations("dashboard.links");
  const tDest = useTranslations("dashboard.links.destinations");
  const locale = useLocale();
  const [data, setData] = useState<OverviewData | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/overview", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (!d.error) setData(d as OverviewData);
      });
  }, []);

  if (!data) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  const { totals, daily, topLinks, partner } = data;
  const commissions = Math.round(totals.commissionCents / 100);
  const conversionRate =
    totals.clicks === 0 ? 0 : (totals.sales / totals.clicks) * 100;
  const epc = totals.clicks === 0 ? 0 : commissions / totals.clicks;
  const quotes = Math.round(totals.clicks * 0.18);
  const isEmpty = totals.clicks === 0 && totals.sales === 0;
  const isEn = locale === "en";

  const fmt = (n: number) => new Intl.NumberFormat(locale).format(n);
  const eur = (n: number) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(n);

  if (isEmpty) {
    return (
      <div className="space-y-10 max-w-5xl">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("welcome", { name: partner.name || partner.companyName })}
          </h1>
          <p className="mt-2 text-ink-700">{t("subtitle")}</p>
        </header>

        <section className="rounded-3xl border border-surface-200 bg-gradient-to-br from-brand-50 via-white to-white p-8 lg:p-12">
          <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr] items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-brand-500/10 text-brand-700 px-3 h-7 text-xs font-bold uppercase tracking-wider">
                {isEn ? "Welcome aboard" : "Bienvenue"}
              </span>
              <h2 className="mt-4 text-3xl lg:text-4xl font-bold tracking-tight">
                {isEn
                  ? "Your dashboard is ready. Time to ship your first link."
                  : "Votre dashboard est prêt. À vous de générer votre premier lien."}
              </h2>
              <p className="mt-3 text-ink-700 leading-relaxed">
                {isEn
                  ? "Once your readers click and convert, this page fills up with real-time stats — clicks, conversions, top links, EPC. Generate one link in 30 seconds and you're live."
                  : "Dès que vos lecteurs cliquent et convertissent, cet écran se remplit en temps réel — clics, conversions, top liens, EPC. Générez un lien en 30 secondes et c'est parti."}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/dashboard/links"
                  className="inline-flex items-center h-12 px-6 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition-colors"
                >
                  {isEn ? "Create my first link" : "Créer mon premier lien"} →
                </Link>
              </div>
            </div>
            <div className="hidden lg:flex justify-center">
              <div className="relative w-full max-w-xs aspect-square">
                <div className="absolute inset-0 rounded-3xl bg-brand-500/10" />
                <div className="absolute inset-6 rounded-2xl bg-white shadow-xl border border-surface-200 p-5 flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-xs text-ink-500">
                    <span className="w-2 h-2 rounded-full bg-success-500" />
                    {isEn ? "Live tracking" : "Tracking en direct"}
                  </div>
                  <div className="rounded-xl bg-surface-50 p-3">
                    <p className="text-[0.65rem] uppercase font-bold tracking-wider text-ink-500">
                      {isEn ? "Clicks · 30 d" : "Clics · 30 j"}
                    </p>
                    <p className="text-xl font-bold mt-1">—</p>
                  </div>
                  <div className="rounded-xl bg-surface-50 p-3">
                    <p className="text-[0.65rem] uppercase font-bold tracking-wider text-ink-500">
                      {isEn ? "Commissions" : "Commissions"}
                    </p>
                    <p className="text-xl font-bold mt-1">—</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          {[
            {
              n: 1,
              t: isEn ? "Generate a tracked link" : "Générer un lien tracké",
              d: isEn ? "Pick a destination, label it, copy the URL." : "Choisissez une destination, donnez-lui un nom, copiez l'URL.",
            },
            {
              n: 2,
              t: isEn ? "Share with your audience" : "Partagez à votre audience",
              d: isEn ? "Article, newsletter, social — any channel works." : "Article, newsletter, réseaux — tous les canaux marchent.",
            },
            {
              n: 3,
              t: isEn ? "Get paid monthly" : "Soyez payé chaque mois",
              d: isEn ? "Up to 20% commission, SEPA / wire / Wise." : "Jusqu'à 20% de commission, SEPA / virement / Wise.",
            },
          ].map((s) => (
            <div
              key={s.n}
              className="rounded-2xl border border-surface-200 bg-white p-5"
            >
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-brand-500/10 text-brand-700 font-bold">
                {s.n}
              </span>
              <p className="mt-3 font-bold">{s.t}</p>
              <p className="mt-1 text-sm text-ink-700">{s.d}</p>
            </div>
          ))}
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-7xl">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">
          {t("welcome", { name: partner.name || partner.companyName })}
        </h1>
        <p className="mt-2 text-ink-700">{t("subtitle")}</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Kpi label={t("kpis.clicks")} value={fmt(totals.clicks)} />
        <Kpi label={t("kpis.quotes")} value={fmt(quotes)} muted />
        <Kpi label={t("kpis.sales")} value={fmt(totals.sales)} />
        <Kpi label={t("kpis.commissions")} value={eur(commissions)} accent />
        <Kpi
          label={t("kpis.conversion")}
          value={`${conversionRate.toFixed(2)} %`}
        />
        <Kpi label={t("kpis.epc")} value={eur(epc)} />
      </div>

      <section className="rounded-2xl border border-surface-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{t("trend.title")}</h2>
          <div className="flex items-center gap-3 text-xs text-ink-500">
            <LegendDot color="bg-brand-500" label={t("trend.clicks")} />
            <LegendDot color="bg-success-600" label={t("trend.sales")} />
          </div>
        </div>
        <MiniChart points={daily} />
      </section>

      <section>
        <h2 className="text-lg font-semibold">{t("topLinks.title")}</h2>
        <div className="mt-4 overflow-hidden rounded-2xl border border-surface-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-surface-50 text-ink-500">
              <tr className="text-left">
                <Th>{t("topLinks.columns.label")}</Th>
                <Th>{tlinks("form.destination")}</Th>
                <Th className="text-right">{t("topLinks.columns.clicks")}</Th>
                <Th className="text-right">{t("topLinks.columns.sales")}</Th>
                <Th className="text-right">
                  {t("topLinks.columns.commissions")}
                </Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-200">
              {topLinks.map((l) => (
                <tr key={l.id} className="hover:bg-surface-50">
                  <Td className="font-medium">
                    {l.label}
                    {l.subId && (
                      <span className="ml-2 font-mono text-[0.68rem] rounded bg-surface-100 text-ink-500 px-1.5 py-0.5">
                        {l.subId}
                      </span>
                    )}
                  </Td>
                  <Td className="text-ink-500">{safeTDest(tDest, l.destination)}</Td>
                  <Td className="text-right tabular-nums">{fmt(l.clicks)}</Td>
                  <Td className="text-right tabular-nums">{fmt(l.sales)}</Td>
                  <Td className="text-right tabular-nums font-semibold text-brand-700">
                    {eur(Math.round(l.commissionCents / 100))}
                  </Td>
                </tr>
              ))}
              {topLinks.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-sm text-ink-500">
                    Aucune donnée pour le moment. Générez vos premiers liens dans l&apos;onglet <strong>Mes liens</strong>.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function safeTDest(t: (k: string) => string, key: string) {
  try {
    return t(key);
  } catch {
    return key;
  }
}

function Kpi({
  label,
  value,
  accent,
  muted,
}: {
  label: string;
  value: string;
  accent?: boolean;
  muted?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-5 border ${
        accent
          ? "bg-ink-900 border-ink-900 text-white"
          : "bg-white border-surface-200"
      }`}
    >
      <p
        className={`text-xs font-medium uppercase tracking-wider ${
          accent ? "text-brand-300" : "text-ink-500"
        }`}
      >
        {label}
      </p>
      <p
        className={`mt-2 text-2xl lg:text-[1.6rem] font-bold tabular-nums ${muted ? "text-ink-500" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}

function MiniChart({
  points,
}: {
  points: { date: string; clicks: number; sales: number }[];
}) {
  if (points.length === 0) return null;
  const W = 1000;
  const H = 240;
  const pad = 24;
  const maxC = Math.max(1, ...points.map((p) => p.clicks));
  const maxS = Math.max(1, ...points.map((p) => p.sales));
  const dx = (W - pad * 2) / Math.max(1, points.length - 1);

  const pathFor = (key: "clicks" | "sales", max: number) =>
    points
      .map((p, i) => {
        const x = pad + dx * i;
        const y = H - pad - (p[key] / max) * (H - pad * 2);
        return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(" ");
  const areaFor = (key: "clicks" | "sales", max: number) => {
    const line = pathFor(key, max);
    const last = pad + dx * (points.length - 1);
    return `${line} L ${last} ${H - pad} L ${pad} ${H - pad} Z`;
  };

  return (
    <div className="mt-4 -mx-2 overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[220px]">
        <defs>
          <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-brand-500)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--color-brand-500)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <g>
          {[0, 0.25, 0.5, 0.75].map((f) => (
            <line
              key={f}
              x1={pad}
              x2={W - pad}
              y1={pad + (H - pad * 2) * f}
              y2={pad + (H - pad * 2) * f}
              stroke="var(--color-surface-200)"
              strokeDasharray="2 4"
            />
          ))}
        </g>
        <path d={areaFor("clicks", maxC)} fill="url(#cg)" />
        <path d={pathFor("clicks", maxC)} fill="none" stroke="var(--color-brand-500)" strokeWidth="2.2" />
        <path d={pathFor("sales", maxS)} fill="none" stroke="var(--color-success-600)" strokeWidth="2" />
      </svg>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-2 w-2 rounded-full ${color}`} />
      {label}
    </span>
  );
}

function Th({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`px-4 py-3 text-[0.72rem] font-semibold uppercase tracking-wider ${className}`}
    >
      {children}
    </th>
  );
}
function Td({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={`px-4 py-3 ${className}`}>{children}</td>;
}
