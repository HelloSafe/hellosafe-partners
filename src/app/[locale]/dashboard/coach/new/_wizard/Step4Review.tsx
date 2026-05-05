"use client";

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
  isEn,
}: {
  data: WizardInputs;
  baseline: Baseline | null;
  ageLabels: Record<AgeRange, string>;
  compLabels: Record<CompanionKind, string>;
  isEn: boolean;
}) {
  const lookup = (id: string | null, list: { id: string; name: string }[]) =>
    id ? list.find((c) => c.id === id)?.name : null;
  return (
    <div className="rounded-2xl border border-surface-200 bg-white p-7 lg:p-9 space-y-6">
      <p className="text-sm text-ink-500">
        {isEn
          ? "Quick review before we run the analysis."
          : "Vérification rapide avant de lancer l'analyse."}
      </p>
      <ReviewBlock
        title={isEn ? "Traveler" : "Voyageur"}
        rows={[
          [isEn ? "Reference" : "Référence", data.client.label],
          [isEn ? "Age range" : "Tranche d'âge", ageLabels[data.client.ageRange]],
          [isEn ? "Departure" : "Départ", data.client.departureCountry],
          [
            isEn ? "Companions" : "Accompagnants",
            data.client.companions.length === 0
              ? isEn
                ? "Solo"
                : "Seul"
              : data.client.companions.map((c) => compLabels[c.kind]).join(", "),
          ],
        ]}
      />
      <ReviewBlock
        title={isEn ? "Trip" : "Voyage"}
        rows={[
          [isEn ? "Destination" : "Destination", data.trip.destinationLabel],
          [
            isEn ? "Dates" : "Dates",
            `${data.trip.startDate} → ${data.trip.endDate}`,
          ],
          [
            isEn ? "Trip value" : "Valeur",
            data.trip.estimatedTripValueEur > 0
              ? `${data.trip.estimatedTripValueEur} €`
              : "—",
          ],
          [
            isEn ? "Activities" : "Activités",
            data.trip.activities.length === 0
              ? "—"
              : data.trip.activities.join(", "),
          ],
        ]}
      />
      <ReviewBlock
        title={isEn ? "Coverage stack" : "Couvertures"}
        rows={[
          [
            isEn ? "Card" : "Carte",
            lookup(data.coverage.cardId, baseline?.cards ?? []) ?? "—",
          ],
          [
            isEn ? "Mutuelle" : "Mutuelle",
            lookup(data.coverage.mutuelleId, baseline?.mutuelles ?? []) ?? "—",
          ],
          [
            isEn ? "Social security" : "Sécu",
            lookup(
              data.coverage.socialSecurityId,
              baseline?.socialSecurity ?? [],
            ) ?? "—",
          ],
          [
            isEn ? "Distributed contract" : "Contrat distribué",
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
