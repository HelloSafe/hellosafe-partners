"use client";

import { useTranslations } from "next-intl";
import type {
  AgeRange,
  CompanionKind,
  WizardInputs,
} from "@/lib/coach/coverage-types";
import type { Baseline } from "./constants";
import { ReviewBlock } from "./ui";

export function Step4Review({
  data,
  baseline,
  ageLabels,
  compLabels,
}: {
  data: WizardInputs;
  baseline: Baseline | null;
  ageLabels: Record<AgeRange, string>;
  compLabels: Record<CompanionKind, string>;
}) {
  const t = useTranslations("coachWizard.step4");
  const lookup = (id: string | null, list: { id: string; name: string }[]) =>
    id ? list.find((c) => c.id === id)?.name : null;

  return (
    <div className="rounded-2xl border border-surface-200 bg-white p-7 lg:p-9 space-y-6">
      <p className="text-sm text-ink-500">{t("intro")}</p>
      <ReviewBlock
        title={t("blocks.traveler")}
        rows={[
          [t("rows.reference"), data.client.label],
          [t("rows.ageRange"), ageLabels[data.client.ageRange]],
          [t("rows.departure"), data.client.departureCountry],
          [
            t("rows.companions"),
            data.client.companions.length === 0
              ? t("rows.solo")
              : data.client.companions.map((c) => compLabels[c.kind]).join(", "),
          ],
        ]}
      />
      <ReviewBlock
        title={t("blocks.trip")}
        rows={[
          [t("rows.destination"), data.trip.destinationLabel],
          [
            t("rows.dates"),
            `${data.trip.startDate} → ${data.trip.endDate}`,
          ],
          [
            t("rows.tripValue"),
            data.trip.estimatedTripValueEur > 0
              ? `${data.trip.estimatedTripValueEur} €`
              : "—",
          ],
          [
            t("rows.activities"),
            data.trip.activities.length === 0
              ? "—"
              : data.trip.activities.join(", "),
          ],
        ]}
      />
      <ReviewBlock
        title={t("blocks.coverage")}
        rows={[
          [
            t("rows.card"),
            lookup(data.coverage.cardId, baseline?.cards ?? []) ?? "—",
          ],
          [
            t("rows.mutuelle"),
            lookup(data.coverage.mutuelleId, baseline?.mutuelles ?? []) ?? "—",
          ],
          [
            t("rows.socialSecurity"),
            lookup(
              data.coverage.socialSecurityId,
              baseline?.socialSecurity ?? [],
            ) ?? "—",
          ],
          [
            t("rows.partnerContract"),
            lookup(
              data.coverage.partnerContractId,
              baseline?.partnerContracts ?? [],
            ) ?? "—",
          ],
        ]}
      />
    </div>
  );
}
