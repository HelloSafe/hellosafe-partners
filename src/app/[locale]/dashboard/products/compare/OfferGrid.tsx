"use client";

import { useTranslations } from "next-intl";

/**
 * Loose typing of the HelloSafe `display-offers` payload — we only read the
 * fields we display. The upstream shape can extend without breaking this.
 */
export type DisplayOffer = {
  id: number;
  name: string;
  insurer?: { id: number; name: string; logo?: { url?: string | null } };
  offerSettingCurrency?: string;
  priceData?: {
    priceInCent: number | null;
    currency: string | null;
    partnerProductInfo?: {
      formuleLabel?: string;
      allInfoFromPartnerApi?: {
        garanties?: Array<{
          icone?: string;
          label?: string;
          code_garantie?: string;
          valeur?: string;
        }>;
      };
    };
  };
  yesList?: Array<{ text?: string; label?: string }>;
  noList?: Array<{ text?: string; label?: string }>;
  ipid?: { url?: string | null } | null;
  cgv?: { url?: string | null } | null;
  partner?: string;
};

export function OfferGrid({ offers }: { offers: DisplayOffer[] }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {offers.map((o) => (
        <OfferCard key={o.id} offer={o} />
      ))}
    </div>
  );
}

function OfferCard({ offer }: { offer: DisplayOffer }) {
  const t = useTranslations("dashboard.products.results");

  const cents = offer.priceData?.priceInCent ?? null;
  const currency = (offer.priceData?.currency || "eur").toUpperCase();
  const guarantees = offer.priceData?.partnerProductInfo?.allInfoFromPartnerApi?.garanties ?? [];

  // Try to extract the 4 headline guarantees by matching common code/label patterns.
  const find = (re: RegExp) =>
    guarantees.find((g) => re.test(g.code_garantie || g.label || ""));
  const medical = find(/m[ée]dic|hospital|frais.*soin/i);
  const repat = find(/rapatri|repatri/i);
  const cancel = find(/annul|cancel/i);
  const baggage = find(/bagage|baggage|luggage/i);

  const ipidUrl = offer.ipid?.url || null;
  const cgvUrl = offer.cgv?.url || null;
  const ipid = ipidUrl ? `https://hellosafe.com${ipidUrl}` : null;
  const cgv = cgvUrl ? `https://hellosafe.com${cgvUrl}` : null;

  return (
    <article className="rounded-2xl border border-surface-200 bg-white overflow-hidden hover:border-brand-300 transition-colors">
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
            {cents !== null
              ? formatCurrency(cents / 100, currency)
              : "—"}
          </p>
          <p className="text-[10px] uppercase tracking-wider text-ink-500">
            {t("perTrip")}
          </p>
        </div>
      </header>

      <div className="p-5 space-y-3">
        <Row label={t("guaranteeMedical")} value={shortValue(medical)} />
        <Row label={t("guaranteeRepatriation")} value={shortValue(repat)} />
        <Row label={t("guaranteeCancellation")} value={shortValue(cancel)} />
        <Row label={t("guaranteeBaggage")} value={shortValue(baggage)} />
      </div>

      {(ipid || cgv) && (
        <footer className="px-5 py-3 border-t border-surface-200 flex flex-wrap gap-3 text-xs">
          {ipid && (
            <a
              href={ipid}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-700 font-medium hover:underline"
            >
              📄 {t("seeIpid")}
            </a>
          )}
          {cgv && (
            <a
              href={cgv}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-700 font-medium hover:underline"
            >
              📑 {t("seeCgv")}
            </a>
          )}
        </footer>
      )}
    </article>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-xs text-ink-500">{label}</span>
      <span className="text-sm font-medium text-ink-900 text-right truncate">
        {value}
      </span>
    </div>
  );
}

function shortValue(g?: { valeur?: string; label?: string }): string {
  const raw = g?.valeur || g?.label || "—";
  if (raw.length > 60) return raw.slice(0, 57) + "…";
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
