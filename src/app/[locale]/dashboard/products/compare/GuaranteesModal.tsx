"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import type { DisplayOffer } from "./OfferGrid";

export function GuaranteesModal({
  offer,
  onClose,
}: {
  offer: DisplayOffer;
  onClose: () => void;
}) {
  const t = useTranslations("dashboard.products.results");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const garanties =
    offer.priceData?.partnerProductInfo?.allInfoFromPartnerApi?.garanties ?? [];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6"
    >
      <div
        className="absolute inset-0 bg-ink-900/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full sm:max-w-2xl max-h-[90dvh] overflow-hidden rounded-t-3xl sm:rounded-2xl bg-white shadow-2xl flex flex-col">
        <header className="flex items-center justify-between px-6 py-4 border-b border-surface-200">
          <div>
            <h3 className="text-lg font-bold text-ink-900">{offer.name}</h3>
            <p className="text-xs text-ink-500">{offer.insurer?.name}</p>
          </div>
          <button
            onClick={onClose}
            aria-label={t("modalDetailsClose")}
            className="h-9 w-9 inline-flex items-center justify-center rounded-full text-ink-700 hover:bg-surface-100"
          >
            ×
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-500 mb-3">
            {t("modalDetailsTitle")}
          </h4>
          {garanties.length === 0 ? (
            <p className="text-sm text-ink-500">—</p>
          ) : (
            <dl className="space-y-2.5">
              {garanties.map((g, i) => (
                <div
                  key={i}
                  className="flex items-baseline justify-between gap-3 border-b border-surface-100 pb-2"
                >
                  <dt className="text-sm text-ink-700 flex-1">
                    {g.label || g.code_garantie || "—"}
                  </dt>
                  <dd className="text-sm font-semibold text-ink-900 text-right max-w-[40%]">
                    {g.valeur || "—"}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>
    </div>
  );
}
