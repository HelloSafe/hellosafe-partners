"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { TripForm, type TripFormState } from "./TripForm";
import { OfferGrid, type DisplayOffer } from "./OfferGrid";

type Phase = "form" | "loading" | "results" | "error";

const initial: TripFormState = {
  arrivalCountries: ["ES"],
  startDate: futureISO(30),
  endDate: futureISO(37),
  travellers: [{ age: 35 }],
};

function futureISO(daysAhead: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + daysAhead);
  return d.toISOString().slice(0, 10);
}

export function CompareWizard() {
  const t = useTranslations("dashboard.products");
  const [phase, setPhase] = useState<Phase>("form");
  const [state, setState] = useState<TripFormState>(initial);
  const [offers, setOffers] = useState<DisplayOffer[]>([]);
  const [errorKey, setErrorKey] = useState<string | null>(null);

  const submit = async () => {
    // Validate
    if (state.travellers.length === 0) {
      setErrorKey("noTravelers");
      setPhase("error");
      return;
    }
    if (state.arrivalCountries.length === 0) {
      setErrorKey("noDestination");
      setPhase("error");
      return;
    }
    if (new Date(state.endDate) <= new Date(state.startDate)) {
      setErrorKey("invalidDates");
      setPhase("error");
      return;
    }

    setPhase("loading");
    setErrorKey(null);

    const tripInfo = {
      intent: "forTourism" as const,
      countryResidence: "FR",
      arrivalCountries: state.arrivalCountries.map((s) => s.toUpperCase()),
      startDate: new Date(state.startDate + "T00:00:00.000Z").toISOString(),
      endDate: new Date(state.endDate + "T00:00:00.000Z").toISOString(),
      currency: "EUR" as const,
      travellers: state.travellers,
      shouldCoverCancellation: false,
      isAnnual: false,
      tripPrice: -1,
    };

    try {
      const res = await fetch("/api/products/quotes", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-timezone":
            Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/Paris",
        },
        body: JSON.stringify({ tripInfo }),
      });
      if (!res.ok) {
        setErrorKey("fetchFailed");
        setPhase("error");
        return;
      }
      const data = await res.json();
      setOffers(data.displayOffers ?? []);
      setPhase("results");
    } catch {
      setErrorKey("fetchFailed");
      setPhase("error");
    }
  };

  const sortedOffers = useMemo(
    () =>
      [...offers].sort(
        (a, b) =>
          (a.priceData?.priceInCent ?? Infinity) -
          (b.priceData?.priceInCent ?? Infinity),
      ),
    [offers],
  );

  return (
    <div className="max-w-6xl space-y-8">
      <header className="flex items-baseline gap-3">
        <Link
          href="/dashboard/products"
          className="text-sm text-ink-500 hover:text-ink-900"
        >
          ← {t("title")}
        </Link>
        <span className="text-ink-300">/</span>
        <h1 className="text-2xl font-bold text-ink-900">
          {t("intents.tourism.label")}
        </h1>
      </header>

      {(phase === "form" || phase === "error") && (
        <>
          <TripForm state={state} setState={setState} />
          {phase === "error" && errorKey && (
            <div className="rounded-lg bg-danger-50 text-danger-600 px-4 py-3 text-sm">
              {t(`errors.${errorKey}` as `errors.fetchFailed`)}
            </div>
          )}
          <button
            type="button"
            onClick={submit}
            className="h-11 px-6 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition-colors"
          >
            {t("form.submit")}
          </button>
        </>
      )}

      {phase === "loading" && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="h-8 w-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
          <p className="mt-4 text-sm text-ink-500">{t("form.submitting")}</p>
        </div>
      )}

      {phase === "results" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-ink-900">
              {t("results.title", { count: sortedOffers.length })}
            </h2>
            <button
              type="button"
              onClick={() => setPhase("form")}
              className="text-sm font-medium text-ink-700 hover:text-brand-700"
            >
              {t("results.back")}
            </button>
          </div>
          {sortedOffers.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-surface-300 bg-white p-10 text-center text-sm text-ink-500">
              {t("results.noResults")}
            </div>
          ) : (
            <OfferGrid offers={sortedOffers} trip={state} />
          )}
        </div>
      )}
    </div>
  );
}
