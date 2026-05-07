"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import type { WizardInputs } from "@/lib/coach/coverage-types";
import {
  AGE_RANGE_LABEL_EN,
  AGE_RANGE_LABEL_FR,
  COMPANION_LABEL_EN,
  COMPANION_LABEL_FR,
} from "@/lib/coach/coverage-types";
import { Step1Traveler } from "./_wizard/Step1Traveler";
import { Step2Trip } from "./_wizard/Step2Trip";
import { Step3Coverage } from "./_wizard/Step3Coverage";
import { Step4Review } from "./_wizard/Step4Review";
import { Header } from "./_wizard/ui";
import { type Baseline, nextMonthISO } from "./_wizard/constants";

/**
 * 4-step wizard that gathers traveler + trip + coverage and POSTs the
 * inputs to /api/coach/analyses to run the gap engine. Each step is its
 * own component under _wizard/; this file orchestrates state, baseline
 * fetch, and step navigation.
 */
export function CoachWizard() {
  const locale = useLocale();
  const isEn = locale === "en";
  const ageLabels = isEn ? AGE_RANGE_LABEL_EN : AGE_RANGE_LABEL_FR;
  const compLabels = isEn ? COMPANION_LABEL_EN : COMPANION_LABEL_FR;
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [baseline, setBaseline] = useState<Baseline | null>(null);

  const [data, setData] = useState<WizardInputs>({
    client: {
      label: "",
      ageRange: "36_50",
      companions: [],
      departureCountry: isEn ? "CA" : "FR",
    },
    trip: {
      destination: "",
      destinationLabel: "",
      startDate: nextMonthISO(0),
      endDate: nextMonthISO(7),
      purpose: "leisure",
      activities: [],
      estimatedTripValueEur: 3000,
    },
    coverage: {
      cardId: null,
      mutuelleId: null,
      socialSecurityId: null,
      partnerContractId: null,
    },
  });

  // Refresh baseline when departureCountry changes (drives country of the card catalog).
  useEffect(() => {
    fetch(`/api/coach/baseline?country=${data.client.departureCountry}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d: Baseline) => {
        setBaseline(d);
        // Auto-pick the social security of the departure country.
        const ssId = d.socialSecurity[0]?.id ?? null;
        const ctrId = d.partnerContracts[0]?.id ?? null;
        setData((prev) => ({
          ...prev,
          coverage: {
            ...prev.coverage,
            socialSecurityId: ssId,
            // Only auto-fill the partner contract if the user hasn't picked.
            partnerContractId:
              prev.coverage.partnerContractId ?? ctrId ?? null,
          },
        }));
      });
  }, [data.client.departureCountry]);

  const canNext = useMemo(() => {
    if (step === 1) return data.client.label.trim().length > 0;
    if (step === 2) {
      return (
        data.trip.destinationLabel.trim().length > 0 &&
        data.trip.startDate &&
        data.trip.endDate
      );
    }
    if (step === 3) return true;
    return false;
  }, [step, data]);

  const submit = async () => {
    setErr(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/coach/analyses", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ inputs: data, locale }),
      });
      const out = await res.json();
      if (!res.ok) {
        setErr(out.error ?? "Erreur");
        setSubmitting(false);
        return;
      }
      router.push(`/dashboard/coach/${out.id}` as never);
    } catch {
      setErr("Erreur de connexion au serveur.");
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      <Header step={step} isEn={isEn} />

      {step === 1 && (
        <Step1Traveler
          data={data}
          setData={setData}
          ageLabels={ageLabels}
          compLabels={compLabels}
          isEn={isEn}
        />
      )}
      {step === 2 && <Step2Trip data={data} setData={setData} isEn={isEn} />}
      {step === 3 && (
        <Step3Coverage
          data={data}
          setData={setData}
          baseline={baseline}
          isEn={isEn}
        />
      )}
      {step === 4 && (
        <Step4Review
          data={data}
          baseline={baseline}
          ageLabels={ageLabels}
          compLabels={compLabels}
          isEn={isEn}
        />
      )}

      {err && (
        <div className="rounded-xl bg-danger-50 text-danger-600 px-4 py-3 text-sm">
          {err}
        </div>
      )}

      <div className="flex items-center justify-between gap-3 pt-4 border-t border-surface-200">
        <button
          type="button"
          disabled={step === 1 || submitting}
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          className="h-11 px-5 rounded-xl border border-surface-300 text-sm font-semibold disabled:opacity-30"
        >
          ← {isEn ? "Back" : "Retour"}
        </button>
        {step < 4 && (
          <button
            type="button"
            disabled={!canNext}
            onClick={() => setStep((s) => s + 1)}
            className="h-11 px-6 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 disabled:opacity-50 transition-colors"
          >
            {isEn ? "Continue" : "Continuer"} →
          </button>
        )}
        {step === 4 && (
          <button
            type="button"
            disabled={submitting}
            onClick={submit}
            className="h-11 px-6 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 disabled:opacity-50 transition-colors"
          >
            {submitting
              ? isEn
                ? "Computing…"
                : "Analyse en cours…"
              : isEn
              ? "Generate analysis →"
              : "Générer l'analyse →"}
          </button>
        )}
      </div>
    </div>
  );
}
