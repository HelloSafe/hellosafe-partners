"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";

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

  const fmt = (n: number) => new Intl.NumberFormat(locale).format(n);
  const eur = (n: number) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(n);

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
