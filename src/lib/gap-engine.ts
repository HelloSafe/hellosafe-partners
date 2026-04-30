/**
 * Gap engine — deterministic coverage gap analyzer.
 * Inputs: wizard inputs + the relevant coverage profiles loaded from DB.
 * Output: the structured analysis displayed by the agent to the client.
 */

import {
  type CoverageData,
  type GapAnalysisOutput,
  type GuaranteeKey,
  type GuaranteeRow,
  type WizardInputs,
  type AmountCents,
  ageRangeUpperBound,
  tripDurationDays,
  companionToRelative,
  COMPANION_LABEL_FR,
  COMPANION_LABEL_EN,
} from "./coverage-types";

type CoverageRecord = {
  id: string;
  name: string;
  type: "card" | "mutuelle" | "social_security" | "partner_contract";
  data: CoverageData;
};

type EngineInput = {
  inputs: WizardInputs;
  card: CoverageRecord | null;
  mutuelle: CoverageRecord | null;
  socialSecurity: CoverageRecord | null;
  partnerContract: CoverageRecord | null;
  locale: "fr" | "en";
};

// HelloSafe baseline (what we recommend) — used as the "right column" benchmark.
const HELLOSAFE_BASELINE: CoverageData = {
  limits: {
    medical_expenses: {
      unlimited: false,
      amount: { cents: 4_500_000_00, currency: "EUR" },
      deductibleCents: 0,
    },
    repatriation: { covered: true, actualCosts: true },
    trip_cancellation: {
      cents: 12_000_00,
      currency: "EUR",
      perPerson: true,
      allCauses: true,
    },
    baggage: { cents: 3_000_00, currency: "EUR" },
    personal_liability: { cents: 4_500_000_00, currency: "EUR" },
    trip_delay: { cents: 800_00, currency: "EUR", afterHours: 4 },
    rental_car_excess: { cents: 50_000_00, currency: "EUR" },
    winter_sports: {
      covered: true,
      cap: { cents: 5_000_00, currency: "EUR" },
    },
  },
  constraints: {
    maxTripDurationDays: 365,
    maxAgeYears: 99,
    geographicalZone: "worldwide",
  },
  coveredRelatives: [
    "self",
    "spouse_legal",
    "concubin",
    "children_under_25",
    "children_over_25",
    "parents",
    "friends",
  ],
};

const HELLOSAFE_PRICE_PER_DAY_CENTS = 140; // €1.40 / day

const GUARANTEE_LABELS_FR: Record<GuaranteeKey, string> = {
  medical_expenses: "Frais médicaux à l'étranger",
  repatriation: "Rapatriement / assistance médicale",
  trip_cancellation: "Annulation de voyage",
  baggage: "Bagages",
  personal_liability: "Responsabilité civile à l'étranger",
  trip_delay: "Retard de transport",
  rental_car_excess: "Franchise location de voiture",
  winter_sports: "Sports d'hiver / activités à risque",
};

const GUARANTEE_LABELS_EN: Record<GuaranteeKey, string> = {
  medical_expenses: "Medical expenses abroad",
  repatriation: "Repatriation / medical assistance",
  trip_cancellation: "Trip cancellation",
  baggage: "Baggage",
  personal_liability: "Personal liability abroad",
  trip_delay: "Trip delay",
  rental_car_excess: "Rental car excess",
  winter_sports: "Winter sports / risk activities",
};

function fmtEur(cents: number, locale: string): string {
  return new Intl.NumberFormat(locale === "en" ? "en-US" : "fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function getMedicalCents(data: CoverageData): number {
  const m = data.limits.medical_expenses;
  if (!m) return 0;
  if (m.unlimited) return Number.POSITIVE_INFINITY;
  return m.amount.cents;
}

function getCancellationCents(data: CoverageData): number {
  return data.limits.trip_cancellation?.cents ?? 0;
}
function getBaggageCents(data: CoverageData): number {
  return data.limits.baggage?.cents ?? 0;
}
function getLiabilityCents(data: CoverageData): number {
  return data.limits.personal_liability?.cents ?? 0;
}
function isRepatriationCovered(data: CoverageData): boolean {
  return data.limits.repatriation?.covered === true;
}
function isWinterSportsCovered(data: CoverageData): boolean {
  return data.limits.winter_sports?.covered === true;
}

/**
 * Determines whether a coverage record applies given the trip context.
 * If maxTripDurationDays exceeded or age out of bounds, the source is not active.
 */
function recordApplies(
  rec: CoverageRecord,
  inputs: WizardInputs,
  durationDays: number,
): { applies: boolean; reasons: string[] } {
  const reasons: string[] = [];
  const c = rec.data.constraints;
  if (c.maxTripDurationDays && durationDays > c.maxTripDurationDays) {
    reasons.push(
      `Durée du voyage (${durationDays} j) > durée max couverte (${c.maxTripDurationDays} j) par ${rec.name}`,
    );
  }
  if (c.maxAgeYears && ageRangeUpperBound(inputs.client.ageRange) > c.maxAgeYears) {
    reasons.push(
      `Tranche d'âge (${inputs.client.ageRange}) > âge max couvert (${c.maxAgeYears}) par ${rec.name}`,
    );
  }
  // Geographic — simple heuristic for US/Canada zone exclusions.
  if (
    c.geographicalZone === "worldwide_excluding_us_canada" &&
    /(US|USA|United States|Canada)/i.test(inputs.trip.destinationLabel)
  ) {
    reasons.push(
      `${rec.name} exclut les États-Unis et le Canada de sa zone de couverture`,
    );
  }
  return { applies: reasons.length === 0, reasons };
}

/** Compute the analysis. */
export function runGapAnalysis(input: EngineInput): GapAnalysisOutput {
  const { inputs, card, mutuelle, socialSecurity, partnerContract, locale } = input;
  const labels = locale === "en" ? GUARANTEE_LABELS_EN : GUARANTEE_LABELS_FR;
  const tripDays = tripDurationDays(inputs.trip.startDate, inputs.trip.endDate);

  // Determine which sources actually apply.
  const sources: { rec: CoverageRecord; applies: boolean; reasons: string[] }[] = [];
  for (const r of [card, mutuelle, socialSecurity, partnerContract]) {
    if (!r) continue;
    sources.push({ rec: r, ...recordApplies(r, inputs, tripDays) });
  }
  const activeSources = sources.filter((s) => s.applies);
  const inactiveSources = sources.filter((s) => !s.applies);

  // Aggregate caps across active sources (sum where it makes sense).
  const aggMedicalCents = activeSources.reduce(
    (acc, s) =>
      acc + (Number.isFinite(getMedicalCents(s.rec.data)) ? getMedicalCents(s.rec.data) : 0),
    0,
  );
  const aggCancellationCents = activeSources.reduce(
    (acc, s) => acc + getCancellationCents(s.rec.data),
    0,
  );
  const aggBaggageCents = activeSources.reduce(
    (acc, s) => acc + getBaggageCents(s.rec.data),
    0,
  );
  const aggLiabilityCents = activeSources.reduce(
    (acc, s) => Math.max(acc, getLiabilityCents(s.rec.data)),
    0,
  );
  const repatriationCovered = activeSources.some((s) =>
    isRepatriationCovered(s.rec.data),
  );
  const winterSportsCovered = activeSources.some((s) =>
    isWinterSportsCovered(s.rec.data),
  );

  // Companions analysis: who's not covered?
  const companionsUncovered: { kind: string; sources: string[] }[] = [];
  for (const comp of inputs.client.companions) {
    const rel = companionToRelative(comp.kind);
    const sourcesCovering = activeSources.filter((s) =>
      s.rec.data.coveredRelatives.includes(rel),
    );
    if (sourcesCovering.length === 0) {
      companionsUncovered.push({
        kind: comp.kind,
        sources: activeSources.map((s) => s.rec.name),
      });
    }
  }

  const rows: GuaranteeRow[] = [];

  // ---------- Companions row (top because it's emotional + clear) ----------
  if (inputs.client.companions.length > 0) {
    const companionLabels =
      locale === "en" ? COMPANION_LABEL_EN : COMPANION_LABEL_FR;
    const allComps = inputs.client.companions
      .map((c) => companionLabels[c.kind])
      .join(", ");
    const uncovered = companionsUncovered
      .map((c) => companionLabels[c.kind as keyof typeof companionLabels])
      .filter(Boolean);
    rows.push({
      guarantee: "companions",
      guaranteeLabel: locale === "en" ? "Companions covered" : "Couverture des proches",
      current: {
        summary: uncovered.length
          ? locale === "en"
            ? `Not covered: ${uncovered.join(", ")}`
            : `Non couvert(s) : ${uncovered.join(", ")}`
          : locale === "en"
          ? "All companions covered by current sources"
          : "Tous les proches sont couverts par les sources actuelles",
        breakdown: activeSources.map((s) => ({
          source: s.rec.name,
          detail:
            s.rec.data.coveredRelatives.length === 7
              ? locale === "en"
                ? "Covers self + spouse + partner + all children + parents"
                : "Couvre titulaire + conjoint + concubin + tous les enfants + parents"
              : (s.rec.data.coveredRelatives.length === 0
                  ? locale === "en"
                    ? "—"
                    : "—"
                  : (locale === "en" ? "Covers: " : "Couvre : ") +
                    s.rec.data.coveredRelatives
                      .map((r) =>
                        ({
                          self: locale === "en" ? "self" : "titulaire",
                          spouse_legal: locale === "en" ? "spouse" : "conjoint",
                          concubin: locale === "en" ? "partner" : "concubin",
                          children_under_25:
                            locale === "en" ? "children<25" : "enfants <25",
                          children_over_25:
                            locale === "en" ? "children>25" : "enfants >25",
                          parents: locale === "en" ? "parents" : "parents",
                          friends: locale === "en" ? "friends" : "amis",
                        }[r]),
                      )
                      .join(", ")),
        })),
      },
      helloSafe: {
        summary:
          locale === "en"
            ? "All companions: spouse, unmarried partner, children of any age, parents, even friends sharing the trip"
            : "Tous les proches : conjoint marié, concubin, enfants tous âges, parents, et même les amis du voyage",
      },
      gap: uncovered.length
        ? {
            severity: "critical",
            title:
              locale === "en"
                ? `${uncovered.join(", ")} not covered by ${allComps.length ? "any source" : "the card"}`
                : `${uncovered.join(", ")} non couvert(s) par les couvertures actuelles`,
            explanation:
              locale === "en"
                ? "Most card insurances exclude unmarried partners and adult children. If they fall ill abroad, repatriation is at the family's expense."
                : "La plupart des assurances carte excluent les concubins non mariés et les enfants majeurs. En cas de pépin à l'étranger, leur prise en charge n'est pas garantie — et le rapatriement reste à la charge de la famille.",
            helloSafeAnswer:
              locale === "en"
                ? "HelloSafe covers spouse, partner, all-age children and parents identically — no marital-status loophole."
                : "HelloSafe couvre conjoint, concubin, enfants tous âges et parents à l'identique. Pas de clause discriminante sur le statut marital.",
          }
        : null,
    });
  }

  // ---------- Duration row (if any source dropped because of trip length) ----------
  const durationKilled = inactiveSources.filter((s) =>
    s.reasons.some((r) => /durée|duration/i.test(r)),
  );
  if (durationKilled.length > 0 || inputs.trip.estimatedTripValueEur > 5000) {
    rows.push({
      guarantee: "duration",
      guaranteeLabel:
        locale === "en" ? "Trip duration & destination fit" : "Durée et destination du voyage",
      current: {
        summary:
          locale === "en"
            ? `${tripDays} days planned. ${durationKilled.length > 0 ? `${durationKilled.length} source(s) auto-disabled.` : "All sources active."}`
            : `${tripDays} jours prévus. ${durationKilled.length > 0 ? `${durationKilled.length} source(s) automatiquement désactivée(s).` : "Toutes les sources restent actives."}`,
        breakdown: durationKilled.map((s) => ({
          source: s.rec.name,
          detail: s.reasons.join(" · "),
        })),
      },
      helloSafe: {
        summary:
          locale === "en"
            ? "Up to 365 days per trip, worldwide including US & Canada"
            : "Jusqu'à 365 jours par voyage, monde entier y compris USA & Canada",
      },
      gap: durationKilled.length
        ? {
            severity: "critical",
            title:
              locale === "en"
                ? `${durationKilled.length} source(s) inactive for this trip`
                : `${durationKilled.length} source(s) ne couvre(nt) pas ce voyage`,
            explanation:
              locale === "en"
                ? "These sources cap trip duration. Past the limit, your client travels without that layer of protection — often without realising it."
                : "Ces sources plafonnent la durée du voyage. Au-delà, votre client voyage sans cette protection — souvent sans le savoir.",
            helloSafeAnswer:
              locale === "en"
                ? "Single contract covers the entire trip, no length surprise."
                : "Un seul contrat qui couvre l'intégralité du voyage, sans mauvaise surprise.",
          }
        : null,
    });
  }

  // ---------- Medical expenses ----------
  const helloMedicalCents = HELLOSAFE_BASELINE.limits.medical_expenses!.unlimited
    ? Number.POSITIVE_INFINITY
    : (HELLOSAFE_BASELINE.limits.medical_expenses as { unlimited: false; amount: AmountCents }).amount.cents;
  const usHigh = /(US|USA|United States|Canada|Asia|Indon|Thaïl|Japan|Brazil|Vietnam)/i.test(
    inputs.trip.destinationLabel,
  );
  const medicalGap =
    aggMedicalCents < 1_000_000_00 ||
    (usHigh && aggMedicalCents < 2_000_000_00);
  rows.push({
    guarantee: "medical_expenses",
    guaranteeLabel: labels.medical_expenses,
    current: {
      summary:
        Number.isFinite(aggMedicalCents) && aggMedicalCents > 0
          ? (locale === "en" ? "Total cap: " : "Plafond cumulé : ") +
            fmtEur(aggMedicalCents, locale)
          : locale === "en"
          ? "No active source for medical expenses"
          : "Aucune source active pour les frais médicaux",
      breakdown: activeSources
        .map((s) => {
          const c = getMedicalCents(s.rec.data);
          if (!c) return null;
          return {
            source: s.rec.name,
            detail: Number.isFinite(c) ? fmtEur(c, locale) : locale === "en" ? "Unlimited" : "Illimité",
          };
        })
        .filter((x): x is { source: string; detail: string } => x !== null),
    },
    helloSafe: {
      summary: fmtEur(helloMedicalCents, locale),
    },
    gap: medicalGap
      ? {
          severity: usHigh ? "critical" : "warning",
          title: usHigh
            ? locale === "en"
              ? `Cap of ${fmtEur(aggMedicalCents, locale)} risky in this destination`
              : `Plafond de ${fmtEur(aggMedicalCents, locale)} à risque sur cette destination`
            : locale === "en"
            ? "Total medical cap below safety threshold"
            : "Plafond médical cumulé sous le seuil de prudence",
          explanation: usHigh
            ? locale === "en"
              ? "A serious hospitalization in the US, Canada or Asia regularly exceeds €1 million. Your client's current cap leaves a structural risk."
              : "Une hospitalisation lourde aux États-Unis, au Canada ou en Asie dépasse régulièrement le million d'euros. Le plafond cumulé actuel laisse votre client exposé."
            : locale === "en"
            ? "Below €1 million, a serious case can drain the cap. We recommend a higher cap regardless of destination."
            : "En dessous d'un million, un sinistre lourd épuise vite le plafond. Nous recommandons un plafond supérieur quel que soit le pays.",
          helloSafeAnswer: `${fmtEur(helloMedicalCents, locale)} ${
            locale === "en" ? "— covers the heaviest scenarios" : "— couvre tous les cas extrêmes"
          }`,
        }
      : null,
  });

  // ---------- Repatriation ----------
  rows.push({
    guarantee: "repatriation",
    guaranteeLabel: labels.repatriation,
    current: {
      summary: repatriationCovered
        ? locale === "en"
          ? "Covered by at least one source"
          : "Couvert par au moins une source"
        : locale === "en"
        ? "Not explicitly covered"
        : "Non explicitement couvert",
      breakdown: activeSources.map((s) => ({
        source: s.rec.name,
        detail: isRepatriationCovered(s.rec.data)
          ? locale === "en"
            ? "Yes, actual costs"
            : "Oui, frais réels"
          : locale === "en"
          ? "No"
          : "Non",
      })),
    },
    helloSafe: {
      summary:
        locale === "en"
          ? "Yes, actual costs, 24/7 multilingual hotline"
          : "Oui, frais réels, assistance 24/7 en français",
    },
    gap: repatriationCovered
      ? null
      : {
          severity: "critical",
          title:
            locale === "en"
              ? "Repatriation not guaranteed"
              : "Rapatriement non garanti",
          explanation:
            locale === "en"
              ? "Without repatriation insurance, a serious accident abroad means the family pays for evacuation — often €15,000 to €60,000 in transport alone."
              : "Sans rapatriement, un accident grave à l'étranger laisse la facture du transport sanitaire à la famille — souvent 15 000 à 60 000 € rien que pour l'évacuation.",
          helloSafeAnswer:
            locale === "en"
              ? "Repatriation at actual costs with no cap, multi-lingual 24/7 medical hotline."
              : "Rapatriement aux frais réels sans plafond, plateau médical 24/7.",
        },
  });

  // ---------- Trip cancellation ----------
  const tripValueCents = inputs.trip.estimatedTripValueEur * 100;
  const cancellationGap = tripValueCents > 0 && aggCancellationCents < tripValueCents;
  rows.push({
    guarantee: "trip_cancellation",
    guaranteeLabel: labels.trip_cancellation,
    current: {
      summary:
        aggCancellationCents > 0
          ? (locale === "en" ? "Total cap: " : "Plafond cumulé : ") +
            fmtEur(aggCancellationCents, locale)
          : locale === "en"
          ? "No cancellation cover active"
          : "Aucune couverture annulation active",
      breakdown: activeSources
        .map((s) =>
          getCancellationCents(s.rec.data) > 0
            ? {
                source: s.rec.name,
                detail: fmtEur(getCancellationCents(s.rec.data), locale),
              }
            : null,
        )
        .filter((x): x is { source: string; detail: string } => x !== null),
    },
    helloSafe: {
      summary:
        locale === "en"
          ? `${fmtEur(HELLOSAFE_BASELINE.limits.trip_cancellation!.cents, locale)} per person, all causes including covid, bereavement, professional reasons`
          : `${fmtEur(HELLOSAFE_BASELINE.limits.trip_cancellation!.cents, locale)} par personne, toutes causes justifiées (covid, deuil, professionnel)`,
    },
    gap: cancellationGap
      ? {
          severity: "warning",
          title:
            locale === "en"
              ? `Trip value ${fmtEur(tripValueCents, locale)} exceeds cumulative cancellation cap (${fmtEur(aggCancellationCents, locale)})`
              : `Voyage à ${fmtEur(tripValueCents, locale)} > plafond annulation cumulé (${fmtEur(aggCancellationCents, locale)})`,
          explanation:
            locale === "en"
              ? "If your client cancels at D-3 due to covid or a bereavement, the difference comes out of their pocket."
              : "Si le client annule à J-3 pour cause de covid ou de deuil, la différence reste à sa charge.",
          helloSafeAnswer:
            locale === "en"
              ? "Cancellation up to 100% of the trip value, with all justified causes, no per-person cap surprise."
              : "Annulation jusqu'à 100 % du voyage, toutes causes justifiées, sans mauvaise surprise au plafond.",
        }
      : null,
  });

  // ---------- Personal liability ----------
  rows.push({
    guarantee: "personal_liability",
    guaranteeLabel: labels.personal_liability,
    current: {
      summary:
        aggLiabilityCents > 0
          ? (locale === "en" ? "Best cap: " : "Meilleur plafond : ") +
            fmtEur(aggLiabilityCents, locale)
          : locale === "en"
          ? "No personal liability cover"
          : "Aucune RC à l'étranger",
      breakdown: activeSources
        .map((s) =>
          getLiabilityCents(s.rec.data) > 0
            ? {
                source: s.rec.name,
                detail: fmtEur(getLiabilityCents(s.rec.data), locale),
              }
            : null,
        )
        .filter((x): x is { source: string; detail: string } => x !== null),
    },
    helloSafe: {
      summary: fmtEur(
        HELLOSAFE_BASELINE.limits.personal_liability!.cents,
        locale,
      ),
    },
    gap:
      aggLiabilityCents < 1_000_000_00
        ? {
            severity: "warning",
            title:
              locale === "en"
                ? "Personal liability under €1M"
                : "RC à l'étranger inférieure à 1 M €",
            explanation:
              locale === "en"
                ? "A scooter accident in Asia or a ski collision easily reaches a million in damages."
                : "Un accident de scooter en Asie ou une collision sur les pistes atteint vite un million d'euros de dommages.",
            helloSafeAnswer: `${fmtEur(
              HELLOSAFE_BASELINE.limits.personal_liability!.cents,
              locale,
            )} ${locale === "en" ? "— state of the art on the market" : "— le plus haut du marché"}`,
          }
        : null,
  });

  // ---------- Baggage ----------
  rows.push({
    guarantee: "baggage",
    guaranteeLabel: labels.baggage,
    current: {
      summary:
        aggBaggageCents > 0
          ? (locale === "en" ? "Total cap: " : "Plafond cumulé : ") +
            fmtEur(aggBaggageCents, locale)
          : locale === "en"
          ? "Not covered"
          : "Non couvert",
      breakdown: activeSources
        .map((s) =>
          getBaggageCents(s.rec.data) > 0
            ? {
                source: s.rec.name,
                detail: fmtEur(getBaggageCents(s.rec.data), locale),
              }
            : null,
        )
        .filter((x): x is { source: string; detail: string } => x !== null),
    },
    helloSafe: {
      summary: fmtEur(HELLOSAFE_BASELINE.limits.baggage!.cents, locale),
    },
    gap:
      aggBaggageCents < HELLOSAFE_BASELINE.limits.baggage!.cents
        ? {
            severity: "info",
            title:
              locale === "en"
                ? "Baggage cap below market reference"
                : "Plafond bagages sous la référence marché",
            explanation:
              locale === "en"
                ? "Lost or delayed baggage is the most frequent claim. A higher cap means the client is reimbursed without arguing."
                : "Le sinistre le plus fréquent. Un plafond plus haut, c'est le client remboursé sans débat.",
            helloSafeAnswer: fmtEur(
              HELLOSAFE_BASELINE.limits.baggage!.cents,
              locale,
            ),
          }
        : null,
  });

  // ---------- Winter sports if relevant ----------
  if (inputs.trip.activities.includes("winter_sports")) {
    rows.push({
      guarantee: "winter_sports",
      guaranteeLabel: labels.winter_sports,
      current: {
        summary: winterSportsCovered
          ? locale === "en"
            ? "Covered by at least one source"
            : "Couvert par au moins une source"
          : locale === "en"
          ? "Not covered"
          : "Non couvert",
        breakdown: activeSources.map((s) => ({
          source: s.rec.name,
          detail: isWinterSportsCovered(s.rec.data)
            ? locale === "en"
              ? "Yes"
              : "Oui"
            : locale === "en"
            ? "No"
            : "Non",
        })),
      },
      helloSafe: {
        summary:
          locale === "en"
            ? `On-piste skiing covered, including search & rescue (cap ${fmtEur(
                HELLOSAFE_BASELINE.limits.winter_sports!.cap!.cents,
                locale,
              )})`
            : `Ski sur pistes couvert, recherche et secours inclus (plafond ${fmtEur(
                HELLOSAFE_BASELINE.limits.winter_sports!.cap!.cents,
                locale,
              )})`,
      },
      gap: winterSportsCovered
        ? null
        : {
            severity: "critical",
            title:
              locale === "en"
                ? "Winter sports not covered"
                : "Sports d'hiver non couverts",
            explanation:
              locale === "en"
                ? "A serious fall on slopes can mean €5–10k in helicopter rescue + medical care, none of it reimbursed."
                : "Une chute sur les pistes, c'est 5 à 10 k€ d'hélico et de soins, non remboursés sans assurance dédiée.",
            helloSafeAnswer:
              locale === "en"
                ? "Helicopter rescue, on-mountain medical, equipment included."
                : "Secours hélico, médical sur place, matériel inclus.",
          },
    });
  }

  // ---------- Summary score ----------
  const filledRows = rows.filter((r) => r.gap === null).length;
  const score = rows.length === 0 ? 100 : Math.round((filledRows / rows.length) * 100);
  const criticalGaps = rows.filter((r) => r.gap?.severity === "critical").length;
  const warningGaps = rows.filter((r) => r.gap?.severity === "warning").length;

  return {
    generatedAt: new Date().toISOString(),
    locale,
    summary: {
      totalSources: activeSources.length,
      rowsCount: rows.length,
      criticalGaps,
      warningGaps,
      coverageScore: score,
    },
    rows,
    helloSafeRecommendation: {
      name: "HelloSafe Travel — Go Protect",
      pricePerDayCents: HELLOSAFE_PRICE_PER_DAY_CENTS,
      bullets:
        locale === "en"
          ? [
              `Medical expenses up to ${fmtEur(helloMedicalCents, locale)}`,
              "Repatriation at actual costs, 24/7 hotline",
              "Cancellation up to 100% of trip value, all justified causes",
              "Spouse, partner, all-age children & parents covered identically",
            ]
          : [
              `Frais médicaux jusqu'à ${fmtEur(helloMedicalCents, locale)}`,
              "Rapatriement aux frais réels, assistance 24/7",
              "Annulation jusqu'à 100 % du voyage, toutes causes justifiées",
              "Conjoint, concubin, enfants tous âges et parents couverts à l'identique",
            ],
    },
  };
}
