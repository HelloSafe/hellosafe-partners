"use client";

import { useTranslations } from "next-intl";
import type { DisplayOffer } from "./OfferGrid";

export function OfferCard({
  offer,
  score,
  badge,
  onShowDetails,
}: {
  offer: DisplayOffer;
  score: number;
  badge: "best" | "coverage" | null;
  onShowDetails: () => void;
}) {
  const t = useTranslations("dashboard.products.results");

  const cents = offer.priceData?.priceInCent ?? null;
  const currency = (offer.priceData?.currency || "eur").toUpperCase();
  const guarantees =
    offer.priceData?.partnerProductInfo?.allInfoFromPartnerApi?.garanties ?? [];

  const find = (re: RegExp) =>
    guarantees.find((g) => re.test(`${g.code_garantie ?? ""} ${g.label ?? ""}`));
  const medical = find(/m[ée]dic|hospital|frais.*soin/i);
  const repat = find(/rapatri|repatri/i);
  const cancel = find(/annul|cancel/i);
  const baggage = find(/bagage|baggage|luggage/i);

  const ipidUrl = offer.ipid?.url || null;
  const cgvUrl = offer.cgv?.url || null;
  const ipid = ipidUrl ? `https://hellosafe.com${ipidUrl}` : null;
  const cgv = cgvUrl ? `https://hellosafe.com${cgvUrl}` : null;

  const scoreColor =
    score >= 80
      ? "text-emerald-600 bg-emerald-50 border-emerald-200"
      : score >= 60
        ? "text-amber-600 bg-amber-50 border-amber-200"
        : "text-ink-700 bg-surface-100 border-surface-200";

  return (
    <article className="relative rounded-2xl border border-surface-200 bg-white overflow-hidden hover:border-brand-300 transition-colors">
      {badge && (
        <span
          className={`absolute top-3 right-3 inline-flex items-center rounded-full px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider ${
            badge === "best"
              ? "bg-brand-500 text-white"
              : "bg-emerald-500 text-white"
          }`}
        >
          {badge === "best" ? t("badgeBest") : t("badgeTopCoverage")}
        </span>
      )}

      <header className="flex items-start gap-4 p-5 border-b border-surface-200">
        {offer.insurer?.logo?.url ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={`https://hellosafe.com${offer.insurer.logo.url}`}
            alt={offer.insurer.name}
            className="h-10 w-10 object-contain rounded-md bg-white border border-surface-200"
          />
        ) : (
          <div className="h-10 w-10 rounded-md bg-surface-100 flex items-center justify-center text-xs font-bold text-ink-500">
            {offer.insurer?.name?.slice(0, 2).toUpperCase() ?? "??"}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-ink-900 truncate">{offer.name}</h3>
          <p className="text-xs text-ink-500 truncate">{offer.insurer?.name}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold tabular-nums text-ink-900">
            {cents !== null ? formatCurrency(cents / 100, currency) : "—"}
          </p>
          <p className="text-[10px] uppercase tracking-wider text-ink-500">
            {t("perTrip")}
          </p>
        </div>
      </header>

      <div className="px-5 py-4 grid gap-3 sm:grid-cols-2">
        <Row label={t("guaranteeMedical")} value={shortValue(medical)} />
        <Row label={t("guaranteeRepatriation")} value={shortValue(repat)} />
        <Row label={t("guaranteeCancellation")} value={shortValue(cancel)} />
        <Row label={t("guaranteeBaggage")} value={shortValue(baggage)} />
      </div>

      <footer className="px-5 py-3 border-t border-surface-200 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${scoreColor}`}
          >
            <svg viewBox="0 0 16 16" className="h-3 w-3" aria-hidden>
              <path
                d="M8 1l2.05 4.55L15 6.3l-3.7 3.45L12.2 15 8 12.6 3.8 15l.9-5.25L1 6.3l4.95-.75L8 1z"
                fill="currentColor"
              />
            </svg>
            {t("score")} {score}{t("scoreOf")}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <button
            type="button"
            onClick={onShowDetails}
            className="font-semibold text-brand-700 hover:underline"
          >
            {t("moreDetails")}
          </button>
          {ipid && (
            <a
              href={ipid}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-ink-500 hover:text-brand-700"
            >
              📄 {t("seeIpid")}
            </a>
          )}
          {cgv && (
            <a
              href={cgv}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-ink-500 hover:text-brand-700"
            >
              📑 {t("seeCgv")}
            </a>
          )}
        </div>
      </footer>
    </article>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-500">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-medium text-ink-900 truncate">{value}</p>
    </div>
  );
}

function shortValue(g?: { valeur?: string; label?: string }): string {
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
