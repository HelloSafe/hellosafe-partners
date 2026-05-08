"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { TripForm, type TripFormState } from "./TripForm";
import { OffersResults } from "./OffersResults";
import type { DisplayOffer } from "./types";

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
  const [includeCancellation, setIncludeCancellation] = useState(false);
  const [errorKey, setErrorKey] = useState<string | null>(null);

  const fetchOffers = async (
    trip: TripFormState,
    cancellation: boolean,
  ): Promise<{ ok: true; offers: DisplayOffer[] } | { ok: false; key: string }> => {
    if (trip.travellers.length === 0) return { ok: false, key: "noTravelers" };
    if (trip.arrivalCountries.length === 0)
      return { ok: false, key: "noDestination" };
    if (new Date(trip.endDate) <= new Date(trip.startDate))
      return { ok: false, key: "invalidDates" };

    const tripInfo = {
      intent: "forTourism" as const,
      countryResidence: "FR",
      arrivalCountries: trip.arrivalCountries.map((s) => s.toUpperCase()),
      startDate: new Date(trip.startDate + "T00:00:00.000Z").toISOString(),
      endDate: new Date(trip.endDate + "T00:00:00.000Z").toISOString(),
      currency: "EUR" as const,
      travellers: trip.travellers,
      shouldCoverCancellation: cancellation,
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
      if (!res.ok) return { ok: false, key: "fetchFailed" };
      const data = await res.json();
      return { ok: true, offers: data.displayOffers ?? [] };
    } catch {
      return { ok: false, key: "fetchFailed" };
    }
  };

  const submit = async () => {
    setPhase("loading");
    setErrorKey(null);
    const r = await fetchOffers(state, includeCancellation);
    if (!r.ok) {
      setErrorKey(r.key);
      setPhase("error");
      return;
    }
    setOffers(r.offers);
    setPhase("results");
  };

  const refetchWith = async (nextCancellation: boolean) => {
    setIncludeCancellation(nextCancellation);
    setPhase("loading");
    const r = await fetchOffers(state, nextCancellation);
    if (!r.ok) {
      setErrorKey(r.key);
      setPhase("error");
      return;
    }
    setOffers(r.offers);
    setPhase("results");
  };

  // Form phase
  if (phase === "form" || phase === "error") {
    return (
      <div className="max-w-3xl space-y-8">
        <Breadcrumb />
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
      </div>
    );
  }

  // Loading phase
  if (phase === "loading" && offers.length === 0) {
    return (
      <div className="max-w-3xl space-y-8">
        <Breadcrumb />
        <div className="flex flex-col items-center justify-center py-20">
          <div className="h-8 w-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
          <p className="mt-4 text-sm text-ink-500">{t("form.submitting")}</p>
        </div>
      </div>
    );
  }

  // Results phase
  return (
    <OffersResults
      trip={state}
      offers={offers}
      includeCancellation={includeCancellation}
      onToggleCancellation={(v) => refetchWith(v)}
      onEditTrip={() => setPhase("form")}
      isRefetching={phase === "loading"}
    />
  );
}

function Breadcrumb() {
  const t = useTranslations("dashboard.products");
  return (
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
  );
}
