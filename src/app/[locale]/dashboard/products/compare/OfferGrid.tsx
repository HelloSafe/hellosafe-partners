"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { OfferCard } from "./OfferCard";
import { GuaranteesModal } from "./GuaranteesModal";
import { ShareModal } from "./ShareModal";
import { computeScore } from "./scoring";
import type { TripFormState } from "./TripForm";

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

export type SortKey = "price" | "coverage";

export function OfferGrid({
  offers,
  trip,
}: {
  offers: DisplayOffer[];
  trip: TripFormState;
}) {
  const t = useTranslations("dashboard.products.results");
  const [sort, setSort] = useState<SortKey>("price");
  const [detailsOf, setDetailsOf] = useState<DisplayOffer | null>(null);
  const [shareOpen, setShareOpen] = useState(false);

  const decorated = useMemo(
    () =>
      offers.map((o) => ({
        offer: o,
        score: computeScore(o),
      })),
    [offers],
  );

  const sorted = useMemo(() => {
    const copy = [...decorated];
    if (sort === "price") {
      copy.sort(
        (a, b) =>
          (a.offer.priceData?.priceInCent ?? Infinity) -
          (b.offer.priceData?.priceInCent ?? Infinity),
      );
    } else {
      copy.sort((a, b) => b.score - a.score);
    }
    return copy;
  }, [decorated, sort]);

  // Identify badges
  const cheapestId = useMemo(() => {
    const valid = decorated.filter((d) => d.offer.priceData?.priceInCent != null);
    if (!valid.length) return null;
    return valid.reduce((a, b) =>
      (a.offer.priceData!.priceInCent ?? Infinity) <
      (b.offer.priceData!.priceInCent ?? Infinity)
        ? a
        : b,
    ).offer.id;
  }, [decorated]);

  const topCoverageId = useMemo(() => {
    if (!decorated.length) return null;
    return decorated.reduce((a, b) => (a.score >= b.score ? a : b)).offer.id;
  }, [decorated]);

  return (
    <div className="space-y-5">
      {/* ─── Sort toolbar ────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">
            {t("sortBy")}
          </span>
          <div className="inline-flex rounded-lg border border-surface-300 bg-white p-1">
            {(["price", "coverage"] as SortKey[]).map((s) => (
              <button
                key={s}
                onClick={() => setSort(s)}
                className={`px-3 h-8 rounded-md text-sm font-medium transition-colors ${
                  sort === s
                    ? "bg-brand-50 text-brand-700"
                    : "text-ink-700 hover:bg-surface-100"
                }`}
              >
                {s === "price" ? t("sortPrice") : t("sortCoverage")}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShareOpen(true)}
          className="h-10 px-4 inline-flex items-center gap-2 rounded-lg bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition-colors"
        >
          ✉ {t("shareCta")}
        </button>
      </div>

      {/* ─── Grid ──────────────────────────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-2">
        {sorted.map(({ offer, score }) => (
          <OfferCard
            key={offer.id}
            offer={offer}
            score={score}
            badge={
              offer.id === cheapestId
                ? "best"
                : offer.id === topCoverageId
                  ? "coverage"
                  : null
            }
            onShowDetails={() => setDetailsOf(offer)}
          />
        ))}
      </div>

      {/* ─── Modals ───────────────────────────────────────────────────── */}
      {detailsOf && (
        <GuaranteesModal
          offer={detailsOf}
          onClose={() => setDetailsOf(null)}
        />
      )}
      {shareOpen && (
        <ShareModal trip={trip} onClose={() => setShareOpen(false)} />
      )}
    </div>
  );
}
