"use client";

import type {
  TripActivity,
  TripPurpose,
  WizardInputs,
} from "@/lib/coach/coverage-types";
import { Field, inputCls } from "./ui";

export function Step2Trip({
  data,
  setData,
  isEn,
}: {
  data: WizardInputs;
  setData: (s: WizardInputs) => void;
  isEn: boolean;
}) {
  const purposes: TripPurpose[] = [
    "leisure",
    "business",
    "study",
    "expat",
    "visa_required",
    "cruise",
  ];
  const purposeLabel = (p: TripPurpose) =>
    isEn
      ? {
          leisure: "Leisure",
          business: "Business",
          study: "Study",
          expat: "Expat / long stay",
          visa_required: "Visa-required",
          cruise: "Cruise",
        }[p]
      : {
          leisure: "Loisirs",
          business: "Professionnel",
          study: "Études",
          expat: "Expatriation",
          visa_required: "Visa requis",
          cruise: "Croisière",
        }[p];

  const activities: TripActivity[] = [
    "winter_sports",
    "diving",
    "trekking",
    "extreme_sports",
    "motorbike",
  ];
  const actLabel = (a: TripActivity) =>
    isEn
      ? {
          winter_sports: "Skiing / winter sports",
          diving: "Diving",
          trekking: "Trekking / hiking",
          extreme_sports: "Extreme sports",
          motorbike: "Motorbike",
          none: "None",
        }[a]
      : {
          winter_sports: "Ski / sports d'hiver",
          diving: "Plongée",
          trekking: "Trek / randonnée",
          extreme_sports: "Sports extrêmes",
          motorbike: "Moto",
          none: "Aucune",
        }[a];

  return (
    <div className="rounded-2xl border border-surface-200 bg-white p-7 lg:p-9 space-y-7">
      <Field
        label={isEn ? "Destination" : "Destination"}
        hint={
          isEn
            ? "Country and (if helpful) city or region. Mention US/Canada or Asia explicitly when relevant."
            : "Pays et (si pertinent) ville ou région. Précisez USA/Canada ou Asie quand c'est pertinent."
        }
      >
        <input
          value={data.trip.destinationLabel}
          onChange={(e) =>
            setData({
              ...data,
              trip: {
                ...data.trip,
                destinationLabel: e.target.value,
                destination: e.target.value,
              },
            })
          }
          placeholder={
            isEn ? "e.g. Indonesia (Bali)" : "Ex : Indonésie (Bali)"
          }
          className={inputCls}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={isEn ? "Start date" : "Date de départ"}>
          <input
            type="date"
            value={data.trip.startDate}
            onChange={(e) =>
              setData({
                ...data,
                trip: { ...data.trip, startDate: e.target.value },
              })
            }
            className={inputCls}
          />
        </Field>
        <Field label={isEn ? "End date" : "Date de retour"}>
          <input
            type="date"
            value={data.trip.endDate}
            onChange={(e) =>
              setData({
                ...data,
                trip: { ...data.trip, endDate: e.target.value },
              })
            }
            className={inputCls}
          />
        </Field>
      </div>

      <Field
        label={
          isEn
            ? "Estimated trip value (per person, in €)"
            : "Valeur estimée du voyage (par personne, en €)"
        }
        hint={
          isEn
            ? "Used to size the cancellation cap recommendation."
            : "Sert à dimensionner la recommandation d'annulation."
        }
      >
        <input
          type="number"
          min={0}
          step={100}
          value={data.trip.estimatedTripValueEur}
          onChange={(e) =>
            setData({
              ...data,
              trip: {
                ...data.trip,
                estimatedTripValueEur: Number(e.target.value) || 0,
              },
            })
          }
          className={inputCls}
        />
      </Field>

      <Field label={isEn ? "Trip purpose" : "Type de voyage"}>
        <div className="flex flex-wrap gap-2">
          {purposes.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() =>
                setData({ ...data, trip: { ...data.trip, purpose: p } })
              }
              className={`rounded-lg border px-3 h-9 text-sm font-medium transition-colors ${
                data.trip.purpose === p
                  ? "border-brand-500 bg-brand-50 text-brand-700"
                  : "border-surface-300 text-ink-700 hover:border-brand-300"
              }`}
            >
              {purposeLabel(p)}
            </button>
          ))}
        </div>
      </Field>

      <Field label={isEn ? "Risk activities" : "Activités à risque"}>
        <div className="flex flex-wrap gap-2">
          {activities.map((a) => {
            const on = data.trip.activities.includes(a);
            return (
              <button
                key={a}
                type="button"
                onClick={() => {
                  const next = on
                    ? data.trip.activities.filter((x) => x !== a)
                    : [...data.trip.activities, a];
                  setData({ ...data, trip: { ...data.trip, activities: next } });
                }}
                className={`rounded-lg border px-3 h-9 text-sm font-medium transition-colors ${
                  on
                    ? "border-brand-500 bg-brand-50 text-brand-700"
                    : "border-surface-300 text-ink-700 hover:border-brand-300"
                }`}
              >
                {on ? "✓ " : ""}
                {actLabel(a)}
              </button>
            );
          })}
        </div>
      </Field>
    </div>
  );
}
