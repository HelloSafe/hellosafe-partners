import "server-only";
import { and, desc, eq, inArray, isNull, or } from "drizzle-orm";
import { db } from "@/db";
import { coverageProfiles, gapAnalyses } from "@/db/schema";
import { newId } from "@/lib/ids";
import { runGapAnalysis } from "./gap-engine";
import type { CoverageData, WizardInputs } from "./coverage-types";
import type {
  CreateContractInput,
  UpdateContractInput,
} from "./validators";

/**
 * Service layer for the coach domain. Pure of Next/HTTP concerns: takes
 * partnerId + business inputs, returns business outputs. Route handlers
 * are thin wrappers that call into here.
 */

// ===================== Analyses =====================

export async function listAnalyses(partnerId: string) {
  return db
    .select({
      id: gapAnalyses.id,
      clientLabel: gapAnalyses.clientLabel,
      locale: gapAnalyses.locale,
      createdAt: gapAnalyses.createdAt,
      output: gapAnalyses.output,
      inputs: gapAnalyses.inputs,
    })
    .from(gapAnalyses)
    .where(eq(gapAnalyses.partnerId, partnerId))
    .orderBy(desc(gapAnalyses.createdAt))
    .limit(50);
}

export async function getAnalysis(partnerId: string, id: string) {
  const rows = await db
    .select()
    .from(gapAnalyses)
    .where(
      and(eq(gapAnalyses.id, id), eq(gapAnalyses.partnerId, partnerId)),
    )
    .limit(1);
  return rows[0] ?? null;
}

export async function deleteAnalysis(partnerId: string, id: string) {
  await db
    .delete(gapAnalyses)
    .where(
      and(eq(gapAnalyses.id, id), eq(gapAnalyses.partnerId, partnerId)),
    );
}

/**
 * Run a gap analysis and persist it. Loads the referenced coverage profiles
 * from DB, calls the gap-engine, stores the output snapshot.
 */
export async function createAnalysis(
  partnerId: string,
  inputs: WizardInputs,
  locale: "fr" | "en",
) {
  const ids = [
    inputs.coverage.cardId,
    inputs.coverage.mutuelleId,
    inputs.coverage.socialSecurityId,
    inputs.coverage.partnerContractId,
  ].filter((x): x is string => Boolean(x));

  const rows = ids.length
    ? await db
        .select()
        .from(coverageProfiles)
        .where(
          and(
            eq(coverageProfiles.active, true),
            inArray(coverageProfiles.id, ids),
          ),
        )
    : [];
  const byId = new Map(rows.map((r) => [r.id, r]));
  const toRecord = (id: string | null) => {
    if (!id) return null;
    const r = byId.get(id);
    if (!r) return null;
    return {
      id: r.id,
      name: r.name,
      type: r.type as "card" | "mutuelle" | "social_security" | "partner_contract",
      data: r.data as CoverageData,
    };
  };

  const output = runGapAnalysis({
    inputs,
    card: toRecord(inputs.coverage.cardId),
    mutuelle: toRecord(inputs.coverage.mutuelleId),
    socialSecurity: toRecord(inputs.coverage.socialSecurityId),
    partnerContract: toRecord(inputs.coverage.partnerContractId),
    locale,
  });

  const id = newId();
  await db.insert(gapAnalyses).values({
    id,
    partnerId,
    clientLabel: inputs.client.label,
    locale,
    inputs,
    output,
  });

  return { id, output };
}

// ===================== Baseline / Coverage profiles =====================

export async function listBaselineCoverages(
  partnerId: string,
  locale: "fr" | "en",
) {
  // Baseline = partner_id IS NULL, partner contracts = belong to this partner.
  const rows = await db
    .select({
      id: coverageProfiles.id,
      partnerId: coverageProfiles.partnerId,
      type: coverageProfiles.type,
      source: coverageProfiles.source,
      name: coverageProfiles.name,
      issuer: coverageProfiles.issuer,
      country: coverageProfiles.country,
      locale: coverageProfiles.locale,
      data: coverageProfiles.data,
      active: coverageProfiles.active,
      notes: coverageProfiles.notes,
    })
    .from(coverageProfiles)
    .where(
      and(
        eq(coverageProfiles.active, true),
        or(
          isNull(coverageProfiles.partnerId),
          eq(coverageProfiles.partnerId, partnerId),
        ),
      ),
    );

  const filtered = rows.filter((r) => {
    if (r.type === "partner_contract") return r.partnerId === partnerId;
    return r.locale === locale;
  });

  return {
    cards: filtered.filter((r) => r.type === "card"),
    mutuelles: filtered.filter((r) => r.type === "mutuelle"),
    socialSecurity: filtered.filter((r) => r.type === "social_security"),
    partnerContracts: filtered.filter((r) => r.type === "partner_contract"),
  };
}

// ===================== Contracts (partner-owned) =====================

export async function listContracts(partnerId: string) {
  return db
    .select()
    .from(coverageProfiles)
    .where(
      and(
        eq(coverageProfiles.partnerId, partnerId),
        eq(coverageProfiles.type, "partner_contract"),
      ),
    )
    .orderBy(desc(coverageProfiles.createdAt));
}

export async function getContract(partnerId: string, id: string) {
  const rows = await db
    .select()
    .from(coverageProfiles)
    .where(
      and(
        eq(coverageProfiles.id, id),
        eq(coverageProfiles.partnerId, partnerId),
        eq(coverageProfiles.type, "partner_contract"),
      ),
    )
    .limit(1);
  return rows[0] ?? null;
}

export async function createContract(
  partnerId: string,
  input: CreateContractInput,
) {
  const id = newId();
  await db.insert(coverageProfiles).values({
    id,
    partnerId,
    type: "partner_contract",
    source: "manual",
    name: input.name,
    issuer: input.issuer ?? null,
    locale: "fr",
    country: "FR",
    data: input.data,
    active: input.active ?? true,
    notes: input.notes ?? null,
  });
  return { id };
}

export async function updateContract(
  partnerId: string,
  id: string,
  patch: UpdateContractInput,
) {
  await db
    .update(coverageProfiles)
    .set({
      ...(patch.name && { name: patch.name }),
      ...(patch.issuer !== undefined && { issuer: patch.issuer ?? null }),
      ...(patch.notes !== undefined && { notes: patch.notes ?? null }),
      ...(typeof patch.active === "boolean" && { active: patch.active }),
      ...(patch.data && { data: patch.data }),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(coverageProfiles.id, id),
        eq(coverageProfiles.partnerId, partnerId),
        eq(coverageProfiles.type, "partner_contract"),
      ),
    );
}

export async function deleteContract(partnerId: string, id: string) {
  await db
    .delete(coverageProfiles)
    .where(
      and(
        eq(coverageProfiles.id, id),
        eq(coverageProfiles.partnerId, partnerId),
        eq(coverageProfiles.type, "partner_contract"),
      ),
    );
}

// ===================== Contract extraction (mock for v1) =====================

/**
 * Mock contract → CoverageData extraction. v2 will plug Claude API for
 * real CGV extraction; for now we do best-effort regex sniffing to
 * pre-fill obvious numeric values and return a Club-Med-shaped template
 * the agent must verify.
 */
export function extractContractFromText(text: string) {
  const safeText = text.slice(0, 50_000);
  return {
    extractionMode: "mock" as const,
    notice:
      "Extraction simulée. Vérifiez les valeurs avant d'enregistrer le contrat.",
    suggestedName: detectName(safeText),
    suggestedIssuer: detectIssuer(safeText),
    data: templateFromText(safeText),
  };
}

function detectName(text: string): string {
  const m = /(Club\s*Med|TUI|Marmara|Pierre\s*&?\s*Vacances|Voyageurs\s*du\s*Monde|Asia|Costa)/i.exec(
    text,
  );
  if (m) return `${m[0]} Travel Insurance`;
  return "Contrat agence personnalisé";
}

function detectIssuer(text: string): string | undefined {
  const m = /(AXA|Allianz|Mondial Assistance|Europ Assistance|Mutuaide|Chapka|ACS|Mapfre|Generali)/i.exec(
    text,
  );
  return m ? m[0] : undefined;
}

function detectAmountCents(re: RegExp, text: string): number | null {
  const m = re.exec(text);
  if (!m) return null;
  const raw = m[1].replace(/[\s. ]/g, "").replace(",", ".");
  const n = parseFloat(raw);
  if (!Number.isFinite(n)) return null;
  return Math.round(n * 100);
}

function templateFromText(text: string): CoverageData {
  const med = detectAmountCents(
    /frais\s+m[ée]dicaux?[^€]*?([\d\s.,]+)\s*€/i,
    text,
  );
  const cancel = detectAmountCents(
    /annul(?:ation)?[^€]*?([\d\s.,]+)\s*€/i,
    text,
  );
  const baggage = detectAmountCents(/bagages?[^€]*?([\d\s.,]+)\s*€/i, text);

  return {
    limits: {
      medical_expenses: {
        unlimited: false,
        amount: { cents: med ?? 250_000_00, currency: "EUR" },
      },
      repatriation: { covered: true, actualCosts: true },
      trip_cancellation: {
        cents: cancel ?? 8_000_00,
        currency: "EUR",
        perPerson: true,
        allCauses: /toutes?\s+causes?/i.test(text),
      },
      baggage: { cents: baggage ?? 2_000_00, currency: "EUR" },
      personal_liability: {
        cents: 4_500_000_00,
        currency: "EUR",
      },
      trip_delay: { cents: 500_00, currency: "EUR", afterHours: 4 },
      rental_car_excess: { cents: 0, currency: "EUR" },
      winter_sports: {
        covered: /sports?\s+d['']?hiver|ski/i.test(text),
        cap: { cents: 5_000_00, currency: "EUR" },
      },
    },
    constraints: {
      maxTripDurationDays: /([\d]+)\s*jours\s*max/i.exec(text)?.[1]
        ? Number(/([\d]+)\s*jours\s*max/i.exec(text)![1])
        : 60,
      maxAgeYears: 80,
      geographicalZone:
        /USA|États-Unis|Etats-Unis|Canada/i.test(text) &&
        /exclu[se]?/i.test(text)
          ? "worldwide_excluding_us_canada"
          : "worldwide",
    },
    coveredRelatives:
      /concubin/i.test(text) && !/exclu/i.test(text)
        ? ["self", "spouse_legal", "concubin", "children_under_25"]
        : ["self", "spouse_legal", "children_under_25"],
    excludedRelatives:
      /concubin/i.test(text) && !/exclu/i.test(text)
        ? ["children_over_25", "parents", "friends"]
        : ["concubin", "children_over_25", "parents", "friends"],
    keyExclusions: [
      "À vérifier — extrait par parsing simple",
      "Conditions médicales préexistantes (clause standard)",
    ],
    notes:
      "Importé par parsing automatique. Vérifiez chaque ligne avant de l'utiliser dans une analyse client.",
  };
}
