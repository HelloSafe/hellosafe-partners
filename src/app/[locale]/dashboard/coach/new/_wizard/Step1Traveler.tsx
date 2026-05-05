"use client";

import type {
  AgeRange,
  Companion,
  CompanionKind,
  DepartureCountry,
  WizardInputs,
} from "@/lib/coach/coverage-types";
import { AGE_RANGES, COMPANION_KINDS } from "./constants";
import { Field, inputCls } from "./ui";

export function Step1Traveler({
  data,
  setData,
  ageLabels,
  compLabels,
  isEn,
}: {
  data: WizardInputs;
  setData: (s: WizardInputs) => void;
  ageLabels: Record<AgeRange, string>;
  compLabels: Record<CompanionKind, string>;
  isEn: boolean;
}) {
  const toggleCompanion = (kind: CompanionKind) => {
    const exists = data.client.companions.find((c) => c.kind === kind);
    let next: Companion[];
    if (exists) {
      next = data.client.companions.filter((c) => c.kind !== kind);
    } else {
      next = [...data.client.companions, { kind, count: 1 }];
    }
    setData({ ...data, client: { ...data.client, companions: next } });
  };

  return (
    <div className="rounded-2xl border border-surface-200 bg-white p-7 lg:p-9 space-y-7">
      <Field
        label={isEn ? "Client reference" : "Référence dossier client"}
        hint={
          isEn
            ? 'Free text, only visible inside your dashboard. e.g. "Mr Smith — Bali May".'
            : "Texte libre, visible uniquement dans votre dashboard. Ex : « M. Martin — Bali mai »."
        }
      >
        <input
          autoFocus
          value={data.client.label}
          onChange={(e) =>
            setData({ ...data, client: { ...data.client, label: e.target.value } })
          }
          placeholder={isEn ? "e.g. Mr Smith — Bali May" : "Ex : Mme Martin — Bali mai"}
          className={inputCls}
        />
      </Field>

      <Field label={isEn ? "Age range" : "Tranche d'âge du voyageur"}>
        <div className="flex flex-wrap gap-2">
          {AGE_RANGES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() =>
                setData({
                  ...data,
                  client: { ...data.client, ageRange: r },
                })
              }
              className={`rounded-lg border px-3 h-9 text-sm font-medium transition-colors ${
                data.client.ageRange === r
                  ? "border-brand-500 bg-brand-50 text-brand-700"
                  : "border-surface-300 text-ink-700 hover:border-brand-300"
              }`}
            >
              {ageLabels[r]}
            </button>
          ))}
        </div>
      </Field>

      <Field
        label={isEn ? "Departure country" : "Pays de départ"}
        hint={
          isEn
            ? "Drives the social security baseline (UK NHS or FR Sécu)."
            : "Détermine la base sécurité sociale (Sécu FR ou NHS UK)."
        }
      >
        <div className="flex gap-2">
          {(["FR", "UK"] as DepartureCountry[]).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() =>
                setData({
                  ...data,
                  client: { ...data.client, departureCountry: c },
                })
              }
              className={`rounded-lg border px-4 h-10 text-sm font-semibold transition-colors ${
                data.client.departureCountry === c
                  ? "border-brand-500 bg-brand-50 text-brand-700"
                  : "border-surface-300 text-ink-700 hover:border-brand-300"
              }`}
            >
              {c === "FR" ? "🇫🇷 France" : "🇬🇧 United Kingdom"}
            </button>
          ))}
        </div>
      </Field>

      <Field
        label={isEn ? "Traveling with…" : "Voyage avec…"}
        hint={
          isEn
            ? "Tap each kind of companion. The Coach will flag who isn't covered by the card insurance."
            : "Cochez chaque type d'accompagnant. Le Coach signalera qui n'est pas couvert par la carte."
        }
      >
        <div className="flex flex-wrap gap-2">
          {COMPANION_KINDS.map((k) => {
            const checked = data.client.companions.find((c) => c.kind === k);
            return (
              <button
                key={k}
                type="button"
                onClick={() => toggleCompanion(k)}
                className={`rounded-lg border px-3 h-10 text-sm font-medium transition-colors ${
                  checked
                    ? "border-brand-500 bg-brand-50 text-brand-700"
                    : "border-surface-300 text-ink-700 hover:border-brand-300"
                }`}
              >
                {checked ? "✓ " : ""}
                {compLabels[k]}
              </button>
            );
          })}
        </div>
      </Field>
    </div>
  );
}
