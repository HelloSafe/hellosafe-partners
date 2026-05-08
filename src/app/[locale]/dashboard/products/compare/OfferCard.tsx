"use client";

import { useTranslations } from "next-intl";
import type { DisplayOffer } from "./types";

export function OfferCard({
  offer,
  score,
  rank,
  isCheapest,
  isTopCoverage,
  expanded,
  onToggleExpand,
  onShare,
}: {
  offer: DisplayOffer;
  score: number;
  rank: number;
  isCheapest: boolean;
  isTopCoverage: boolean;
  expanded: boolean;
  onToggleExpand: () => void;
  onShare: () => void;
}) {
  const t = useTranslations("dashboard.products.results");

  const cents = offer.priceData?.priceInCent ?? null;
  const currency = (offer.priceData?.currency || "eur").toUpperCase();
  const allGuarantees =
    offer.priceData?.partnerProductInfo?.allInfoFromPartnerApi?.garanties ?? [];

  // Headline guarantees (4 always shown)
  const find = (re: RegExp) =>
    allGuarantees.find((g) => re.test(`${g.code_garantie ?? ""} ${g.label ?? ""}`));
  const headline = [
    { label: t("guaranteeMedical"), value: pretty(find(/m[ée]dic|hospital|frais.*soin/i)) },
    { label: t("guaranteeRepatriation"), value: pretty(find(/rapatri|repatri/i)) },
    { label: t("guaranteeCancellation"), value: pretty(find(/annul|cancel/i)) },
    { label: t("guaranteeBaggage"), value: pretty(find(/bagage|baggage|luggage/i)) },
  ];

  const ipidUrl = offer.ipid?.url ? `https://hellosafe.com${offer.ipid.url}` : null;
  const cgvUrl = offer.cgv?.url ? `https://hellosafe.com${offer.cgv.url}` : null;

  // Score visualization
  const scoreColor =
    score >= 80
      ? { bar: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50" }
      : score >= 60
        ? { bar: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-50" }
        : { bar: "bg-red-500", text: "text-red-700", bg: "bg-red-50" };

  const showBadge = isCheapest || isTopCoverage;

  return (
    <article
      className={`relative rounded-2xl border bg-white overflow-hidden transition-shadow ${
        showBadge
          ? "border-brand-300 shadow-md"
          : "border-surface-200 hover:border-surface-300"
      }`}
    >
      {/* ─── Floating badge ──────────────────────────────────────────── */}
      {showBadge && (
        <div className="absolute -top-3 left-6 z-10 inline-flex items-center gap-1.5 rounded-full bg-brand-500 text-white px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wider shadow">
          {isCheapest ? "★ " : "✓ "}
          {isCheapest ? t("badgeBest") : t("badgeTopCoverage")}
        </div>
      )}

      {/* ─── Main row ─────────────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-[1fr_auto] gap-6 p-5 lg:p-6">
        {/* Left: insurer + guarantees + score */}
        <div className="space-y-4">
          {/* Insurer header */}
          <div className="flex items-center gap-3">
            {offer.insurer?.logo?.url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={`https://hellosafe.com${offer.insurer.logo.url}`}
                alt={offer.insurer.name}
                className="h-11 w-11 object-contain rounded-lg bg-white border border-surface-200 p-0.5"
              />
            ) : (
              <div className="h-11 w-11 rounded-lg bg-surface-100 flex items-center justify-center text-xs font-bold text-ink-500">
                {offer.insurer?.name?.slice(0, 2).toUpperCase() ?? "??"}
              </div>
            )}
            <div className="min-w-0">
              <h3 className="font-bold text-ink-900 truncate">{offer.name}</h3>
              <p className="text-xs text-ink-500 truncate">
                {offer.insurer?.name}
                {offer.priceData?.partnerProductInfo?.formuleLabel && (
                  <>
                    {" · "}
                    {offer.priceData.partnerProductInfo.formuleLabel}
                  </>
                )}
              </p>
            </div>
            <span className="ml-auto text-xs font-mono tabular-nums text-ink-300">
              #{rank}
            </span>
          </div>

          {/* Guarantees table */}
          <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
            {headline.map((row) => (
              <div
                key={row.label}
                className="flex items-baseline justify-between gap-3 border-b border-surface-100 pb-1.5"
              >
                <dt className="text-xs text-ink-500">{row.label}</dt>
                <dd className="text-sm font-semibold text-ink-900 text-right truncate max-w-[55%]">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>

          {/* Score bar */}
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink-500 whitespace-nowrap">
              {t("scoreCoverage")}
            </span>
            <div className="flex-1 h-2 rounded-full bg-surface-200 overflow-hidden">
              <div
                className={`h-full transition-all ${scoreColor.bar}`}
                style={{ width: `${Math.max(2, score)}%` }}
              />
            </div>
            <span
              className={`text-sm font-bold tabular-nums ${scoreColor.text}`}
            >
              {score}
              <span className="text-ink-400 font-normal">/100</span>
            </span>
          </div>

          {/* Expand link */}
          <button
            type="button"
            onClick={onToggleExpand}
            className="text-xs font-semibold text-brand-700 hover:underline"
          >
            {expanded ? `▴ ${t("hideGuarantees")}` : `▾ ${t("showAllGuarantees")} (${allGuarantees.length})`}
          </button>
        </div>

        {/* Right: price + CTA */}
        <div className="lg:w-44 lg:border-l lg:border-surface-200 lg:pl-6 flex lg:flex-col items-center lg:items-stretch gap-3 lg:gap-4 lg:justify-center">
          <div className="lg:text-center flex-1 lg:flex-none">
            <p className="text-3xl font-bold tabular-nums text-ink-900 lg:text-center">
              {cents !== null ? formatCurrency(cents / 100, currency) : "—"}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-ink-500 lg:text-center">
              {t("perTrip")}
            </p>
          </div>
          <button
            type="button"
            onClick={onShare}
            className="h-10 px-4 inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition-colors whitespace-nowrap"
          >
            ✉ {t("shareCta")}
          </button>
        </div>
      </div>

      {/* ─── Expanded full guarantees ─────────────────────────────────── */}
      {expanded && (
        <div className="border-t border-surface-200 bg-surface-50/50 px-5 lg:px-6 py-5">
          <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-2">
            {allGuarantees.map((g, i) => (
              <div
                key={i}
                className="flex items-baseline justify-between gap-3 border-b border-surface-200 pb-1.5"
              >
                <dt className="text-xs text-ink-700 flex-1">
                  {g.label || g.code_garantie || "—"}
                </dt>
                <dd className="text-xs font-semibold text-ink-900 text-right max-w-[40%] truncate">
                  {g.valeur || "—"}
                </dd>
              </div>
            ))}
          </dl>
          {(ipidUrl || cgvUrl) && (
            <div className="mt-4 flex flex-wrap gap-3 text-xs">
              {ipidUrl && (
                <a
                  href={ipidUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-brand-700 hover:underline"
                >
                  📄 {t("seeIpid")}
                </a>
              )}
              {cgvUrl && (
                <a
                  href={cgvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-brand-700 hover:underline"
                >
                  📑 {t("seeCgv")}
                </a>
              )}
            </div>
          )}
        </div>
      )}
    </article>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function pretty(g?: { valeur?: string; label?: string }): string {
  const raw = g?.valeur || g?.label || "—";
  if (raw.length > 50) return raw.slice(0, 47) + "…";
  return raw;
}

function formatCurrency(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount.toFixed(0)} ${currency}`;
  }
}
