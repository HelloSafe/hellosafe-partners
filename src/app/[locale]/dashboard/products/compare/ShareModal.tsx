"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import type { TripFormState } from "./TripForm";

export function ShareModal({
  trip,
  offerId,
  offerName,
  onClose,
}: {
  trip: TripFormState;
  /** When set, the share message mentions this specific offer to the client. */
  offerId?: number | null;
  offerName?: string | null;
  onClose: () => void;
}) {
  const t = useTranslations("dashboard.products.share");
  const [phase, setPhase] = useState<"loading" | "ready" | "error">("loading");
  const [shareUrl, setShareUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);

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

  void offerId; // tracking the highlighted offer in the share payload is a future enhancement

  // Create the shareable subscription on open
  useEffect(() => {
    const tripInfo = {
      intent: "forTourism" as const,
      countryResidence: "FR",
      arrivalCountries: trip.arrivalCountries.map((c) => c.toUpperCase()),
      startDate: new Date(trip.startDate + "T00:00:00.000Z").toISOString(),
      endDate: new Date(trip.endDate + "T00:00:00.000Z").toISOString(),
      currency: "EUR" as const,
      travellers: trip.travellers,
      shouldCoverCancellation: false,
      isAnnual: false,
      tripPrice: -1,
    };
    fetch("/api/products/share", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-timezone":
          Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/Paris",
      },
      body: JSON.stringify({ tripInfo }),
    })
      .then(async (r) => {
        if (!r.ok) throw new Error("upstream");
        return r.json();
      })
      .then((d: { shareUrl: string }) => {
        setShareUrl(d.shareUrl);
        setPhase("ready");
      })
      .catch(() => setPhase("error"));
  }, [trip]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2_000);
    } catch {
      // fallback: select the input
    }
  };

  const emailHref = `mailto:?subject=${encodeURIComponent(
    t("emailSubject"),
  )}&body=${encodeURIComponent(t("emailBody", { url: shareUrl }))}`;
  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(
    t("whatsappBody", { url: shareUrl }),
  )}`;

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
      <div className="relative w-full sm:max-w-lg max-h-[90dvh] overflow-y-auto rounded-t-3xl sm:rounded-2xl bg-white shadow-2xl">
        <header className="flex items-start justify-between px-6 py-5 border-b border-surface-200">
          <div className="pr-4">
            <h3 className="text-lg font-bold text-ink-900">{t("title")}</h3>
            {offerName && (
              <p className="mt-1 inline-flex items-center rounded-full bg-brand-50 text-brand-700 px-2.5 py-1 text-xs font-semibold">
                {offerName}
              </p>
            )}
            <p className="mt-2 text-sm text-ink-500 leading-relaxed">
              {t("subtitle")}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label={t("close")}
            className="h-9 w-9 shrink-0 inline-flex items-center justify-center rounded-full text-ink-700 hover:bg-surface-100"
          >
            ×
          </button>
        </header>

        <div className="px-6 py-5 space-y-5">
          {phase === "loading" && (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
            </div>
          )}

          {phase === "error" && (
            <div className="rounded-lg bg-danger-50 text-danger-600 px-4 py-3 text-sm">
              {t("errorCreating")}
            </div>
          )}

          {phase === "ready" && (
            <>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-500 mb-1.5">
                  {t("linkLabel")}
                </label>
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={shareUrl}
                    onClick={(e) => e.currentTarget.select()}
                    className="flex-1 rounded-lg border border-surface-300 bg-surface-50 px-3 h-10 text-xs font-mono text-ink-900"
                  />
                  <button
                    type="button"
                    onClick={copyLink}
                    className={`h-10 px-4 rounded-lg text-sm font-semibold transition-colors ${
                      copied
                        ? "bg-success-50 text-success-700 border border-success-200"
                        : "bg-brand-500 text-white hover:bg-brand-600"
                    }`}
                  >
                    {copied ? t("copied") : t("copy")}
                  </button>
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <a
                  href={emailHref}
                  className="h-11 inline-flex items-center justify-center gap-2 rounded-lg border border-surface-300 bg-white text-sm font-semibold text-ink-900 hover:border-brand-300 hover:text-brand-700 transition-colors"
                >
                  ✉ {t("channelEmail")}
                </a>
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-11 inline-flex items-center justify-center gap-2 rounded-lg bg-[#25D366] text-white text-sm font-semibold hover:bg-[#20bd5a] transition-colors"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
                    <path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9s-.5-.1-.7.1-.7.9-.9 1.1c-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.1-.7-1.7-.9-2.3-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.7.4-.3.3-1 1-1 2.4 0 1.4 1 2.8 1.2 3 .1.2 2 3 4.8 4.2.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.6-.1 1.7-.7 1.9-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.3M12 22a10 10 0 0 1-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4A10 10 0 1 1 12 22m0-21.7A11.7 11.7 0 0 0 1.6 17.5L0 24l6.7-1.7A11.7 11.7 0 0 0 23.7 12 11.7 11.7 0 0 0 12 .3" />
                  </svg>
                  {t("channelWhatsapp")}
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
