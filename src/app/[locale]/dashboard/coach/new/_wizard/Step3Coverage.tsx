"use client";

import type { WizardInputs } from "@/lib/coach/coverage-types";
import type { Baseline } from "./constants";
import { Field, SelectChips } from "./ui";

export function Step3Coverage({
  data,
  setData,
  baseline,
  isEn,
}: {
  data: WizardInputs;
  setData: (s: WizardInputs) => void;
  baseline: Baseline | null;
  isEn: boolean;
}) {
  if (!baseline) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-6 w-6 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
      </div>
    );
  }
  return (
    <div className="rounded-2xl border border-surface-200 bg-white p-7 lg:p-9 space-y-7">
      <Field
        label={isEn ? "Bank card" : "Carte bancaire"}
        hint={
          isEn
            ? "Pick the closest match. We'll add more cards over time."
            : "Sélectionnez la plus proche. La bibliothèque s'enrichira."
        }
      >
        <SelectChips
          options={[
            { id: "", label: isEn ? "No card / unsure" : "Pas de carte / je ne sais pas" },
            ...baseline.cards.map((c) => ({ id: c.id, label: c.name })),
          ]}
          value={data.coverage.cardId ?? ""}
          onChange={(v) =>
            setData({
              ...data,
              coverage: { ...data.coverage, cardId: v || null },
            })
          }
        />
      </Field>

      <Field
        label={isEn ? "Top-up health insurance (mutuelle)" : "Mutuelle santé"}
      >
        <SelectChips
          options={[
            { id: "", label: isEn ? "None" : "Aucune" },
            ...baseline.mutuelles.map((c) => ({ id: c.id, label: c.name })),
          ]}
          value={data.coverage.mutuelleId ?? ""}
          onChange={(v) =>
            setData({
              ...data,
              coverage: { ...data.coverage, mutuelleId: v || null },
            })
          }
        />
      </Field>

      <Field
        label={
          isEn
            ? `Home country social security (${data.client.departureCountry === "FR" ? "Sécu FR" : "NHS / GHIC"})`
            : `Sécurité sociale du pays de départ (${data.client.departureCountry === "FR" ? "Sécu FR" : "NHS / GHIC"})`
        }
        hint={
          isEn
            ? "Auto-selected based on departure country."
            : "Sélectionnée automatiquement selon le pays de départ."
        }
      >
        <SelectChips
          options={[
            { id: "", label: isEn ? "Skip" : "Ignorer" },
            ...baseline.socialSecurity.map((c) => ({ id: c.id, label: c.name })),
          ]}
          value={data.coverage.socialSecurityId ?? ""}
          onChange={(v) =>
            setData({
              ...data,
              coverage: { ...data.coverage, socialSecurityId: v || null },
            })
          }
        />
      </Field>

      <Field
        label={isEn ? "Your distributed contract" : "Votre contrat distribué"}
        hint={
          isEn
            ? "Manage your contracts in My contracts. Pre-loaded: Club Med."
            : "Gérez vos contrats depuis Mes contrats. Pré-chargé : Club Med."
        }
      >
        <SelectChips
          options={[
            { id: "", label: isEn ? "None" : "Aucun" },
            ...baseline.partnerContracts.map((c) => ({
              id: c.id,
              label: c.name,
            })),
          ]}
          value={data.coverage.partnerContractId ?? ""}
          onChange={(v) =>
            setData({
              ...data,
              coverage: { ...data.coverage, partnerContractId: v || null },
            })
          }
        />
      </Field>
    </div>
  );
}
