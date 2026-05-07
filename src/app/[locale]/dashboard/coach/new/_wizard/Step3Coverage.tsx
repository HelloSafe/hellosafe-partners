"use client";

import { useTranslations } from "next-intl";
import type { WizardInputs } from "@/lib/coach/coverage-types";
import type { Baseline } from "./constants";
import { Field, SelectChips } from "./ui";

export function Step3Coverage({
  data,
  setData,
  baseline,
}: {
  data: WizardInputs;
  setData: (s: WizardInputs) => void;
  baseline: Baseline | null;
}) {
  const t = useTranslations("coachWizard.step3");

  if (!baseline) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-6 w-6 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
      </div>
    );
  }
  const ssLabel =
    data.client.departureCountry === "FR"
      ? t("socialSecurity.labelFr")
      : t("socialSecurity.labelCa");

  return (
    <div className="rounded-2xl border border-surface-200 bg-white p-7 lg:p-9 space-y-7">
      <Field label={t("card.label")} hint={t("card.hint")}>
        <SelectChips
          options={[
            { id: "", label: t("card.noCard") },
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

      <Field label={t("mutuelle.label")}>
        <SelectChips
          options={[
            { id: "", label: t("mutuelle.none") },
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

      <Field label={ssLabel} hint={t("socialSecurity.hint")}>
        <SelectChips
          options={[
            { id: "", label: t("socialSecurity.skip") },
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

      <Field label={t("partnerContract.label")} hint={t("partnerContract.hint")}>
        <SelectChips
          options={[
            { id: "", label: t("partnerContract.none") },
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
