"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";

type Summary = {
  clicks: number;
  pendingConversions: number;
  validatedConversions: number;
  cancelledConversions: number;
  pendingRevenueCents: number;
  validatedRevenueCents: number;
  pendingCommissionCents: number;
  validatedCommissionCents: number;
};

type LinkRow = {
  linkId: string;
  label: string;
  destination: string;
  subId: string;
  campaign: string;
  clicks: number;
  pendingConv: number;
  validatedConv: number;
  cancelledConv: number;
  revenueCents: number;
  commissionCents: number;
};

type ReportingData = {
  range: { from: string; to: string };
  summary: Summary;
  perLink: LinkRow[];
};

type Period = "7" | "30" | "90";

function periodToDates(p: Period): { from: string; to: string } {
  const now = new Date();
  const days = parseInt(p, 10);
  const from = new Date(now.getTime() - days * 86_400_000);
  return {
    from: from.toISOString(),
    to: now.toISOString(),
  };
}

export function ReportingPanel() {
  const t = useTranslations("dashboard.reporting");
  const locale = useLocale();
  const [period, setPeriod] = useState<Period>("30");
  const [subId, setSubId] = useState("");
  // Track which queryString the loaded `data` corresponds to. `loading` is
  // simply derived as "the displayed data doesn't match the live filters yet".
  const [result, setResult] = useState<{
    data: ReportingData | null;
    queryFor: string | null;
  }>({ data: null, queryFor: null });

  // Apply Sub-ID filter only when the user explicitly hits Enter or blurs:
  // we don't want a network round-trip on every keystroke.
  const [appliedSubId, setAppliedSubId] = useState("");

  const queryString = useMemo(() => {
    const { from, to } = periodToDates(period);
    const p = new URLSearchParams({ from, to });
    if (appliedSubId.trim()) p.set("subid", appliedSubId.trim());
    return p.toString();
  }, [period, appliedSubId]);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/account/reporting?${queryString}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d: ReportingData) => {
        if (!cancelled) setResult({ data: d, queryFor: queryString });
      })
      .catch(() => {
        if (!cancelled) setResult({ data: null, queryFor: queryString });
      });
    return () => {
      cancelled = true;
    };
  }, [queryString]);

  const data = result.data;
  const loading = result.queryFor !== queryString;

  const fmt = (n: number) => new Intl.NumberFormat(locale).format(n);
  const eur = (cents: number) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(Math.round(cents / 100));

  return (
    <div className="space-y-8">
      <header className="max-w-3xl">
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-ink-900">
          {t("title")}
        </h1>
        <p className="mt-2 text-ink-700">{t("subtitle")}</p>
      </header>

      {/* ─── Filters ─────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-end gap-4">
        <Field label={t("filters.period")}>
          <div className="flex gap-1 rounded-lg border border-surface-300 bg-white p-1">
            {(["7", "30", "90"] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 h-8 rounded-md text-sm font-medium transition-colors ${
                  period === p
                    ? "bg-brand-50 text-brand-700"
                    : "text-ink-700 hover:bg-surface-100"
                }`}
              >
                {t(`filters.last${p}` as "filters.last7" | "filters.last30" | "filters.last90")}
              </button>
            ))}
          </div>
        </Field>

        <Field label={t("filters.subId")}>
          <input
            value={subId}
            onChange={(e) => setSubId(e.target.value)}
            onBlur={() => setAppliedSubId(subId)}
            onKeyDown={(e) => {
              if (e.key === "Enter") setAppliedSubId(subId);
            }}
            placeholder={t("filters.subIdPlaceholder")}
            className="h-10 rounded-lg border border-surface-300 bg-white px-3 text-sm w-64 focus-ring focus:border-brand-500"
          />
        </Field>

        <a
          href={`/api/account/reporting/export?${queryString}`}
          className="ml-auto h-10 px-4 inline-flex items-center justify-center rounded-lg border border-surface-300 bg-white text-sm font-semibold text-ink-700 hover:border-brand-300 hover:text-brand-700 transition-colors"
        >
          ↓ {t("filters.export")}
        </a>
      </div>

      {/* ─── KPI tiles ──────────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          label={t("kpi.clicks")}
          value={loading || !data ? "…" : fmt(data.summary.clicks)}
          accent="slate"
        />
        <Kpi
          label={t("kpi.quotes")}
          value={loading || !data ? "…" : fmt(data.summary.pendingConversions)}
          subtitle={t("kpi.quotesHint")}
          accent="amber"
        />
        <Kpi
          label={t("kpi.sales")}
          value={loading || !data ? "…" : fmt(data.summary.validatedConversions)}
          subtitle={t("kpi.salesHint")}
          accent="green"
        />
        <Kpi
          label={t("kpi.commissions")}
          value={loading || !data ? "…" : eur(data.summary.validatedCommissionCents)}
          subtitle={t("kpi.commissionsHint")}
          accent="violet"
        />
      </div>

      {/* ─── Per-link table ─────────────────────────────────────────────── */}
      <section className="rounded-2xl border border-surface-200 bg-white overflow-hidden">
        <header className="px-6 py-4 border-b border-surface-200">
          <h2 className="text-lg font-bold text-ink-900">{t("table.title")}</h2>
        </header>
        {!data || data.perLink.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-ink-500">
            {t("table.empty")}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-surface-50 border-b border-surface-200">
                <tr className="text-left">
                  <Th>{t("table.label")}</Th>
                  <Th>{t("table.subId")}</Th>
                  <Th>{t("table.campaign")}</Th>
                  <Th align="right">{t("table.clicks")}</Th>
                  <Th align="right">{t("table.quotes")}</Th>
                  <Th align="right">{t("table.sales")}</Th>
                  <Th align="right">{t("table.revenue")}</Th>
                  <Th align="right">{t("table.commission")}</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-200">
                {data.perLink.map((r) => (
                  <tr key={r.linkId} className="hover:bg-surface-50">
                    <td className="px-5 py-3">
                      <p className="font-medium text-ink-900 truncate max-w-[18rem]">
                        {r.label || "—"}
                      </p>
                      <p className="text-xs text-ink-500 truncate max-w-[18rem]">
                        {r.destination}
                      </p>
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-ink-700 truncate max-w-[12rem]">
                      {r.subId || "—"}
                    </td>
                    <td className="px-5 py-3 text-ink-700 truncate max-w-[12rem]">
                      {r.campaign || "—"}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums">{fmt(r.clicks)}</td>
                    <td className="px-5 py-3 text-right tabular-nums text-amber-700">
                      {fmt(r.pendingConv)}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums text-emerald-700 font-semibold">
                      {fmt(r.validatedConv)}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums">
                      {eur(r.revenueCents)}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums font-semibold">
                      {eur(r.commissionCents)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

// ─── Local UI primitives ──────────────────────────────────────────────────────

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold uppercase tracking-wider text-ink-500 mb-1.5">
        {label}
      </span>
      {children}
    </label>
  );
}

const ACCENT_BAR: Record<"slate" | "amber" | "green" | "violet", string> = {
  slate: "bg-slate-400",
  amber: "bg-amber-400",
  green: "bg-emerald-400",
  violet: "bg-brand-500",
};

function Kpi({
  label,
  value,
  subtitle,
  accent,
}: {
  label: string;
  value: string;
  subtitle?: string;
  accent: "slate" | "amber" | "green" | "violet";
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-surface-200 bg-white">
      <div className={`h-1 w-full ${ACCENT_BAR[accent]}`} />
      <div className="p-4">
        <div className="text-[10px] font-bold uppercase tracking-wider text-ink-500">
          {label}
        </div>
        <div className="mt-1 text-2xl font-bold tabular-nums text-ink-900">
          {value}
        </div>
        {subtitle && (
          <div className="mt-1 text-xs text-ink-500">{subtitle}</div>
        )}
      </div>
    </div>
  );
}

function Th({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      className={`px-5 py-3 text-[0.68rem] font-bold uppercase tracking-wider text-ink-500 ${
        align === "right" ? "text-right" : ""
      }`}
    >
      {children}
    </th>
  );
}
