/**
 * Server-only catalog of HelloCard bank cards, loaded from Supabase.
 * Card IDs are prefixed with "hc:" to distinguish them from Neon coverage profile IDs.
 * Results are cached in-process for 1 hour (Node.js module cache survives across requests
 * in a long-running server process / Vercel edge warm start).
 */
import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { CoverageData } from "./coverage-types";
import { FR_GUARANTEE_MAP, CA_GUARANTEE_MAP, type GuaranteeMap } from "./guarantee-mapping";

// ── Supabase client ──────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.SUPABASE_HELLOCARD_URL!;
const SUPABASE_ANON = process.env.SUPABASE_HELLOCARD_ANON_KEY!;

function makeClient() {
  return createClient(SUPABASE_URL, SUPABASE_ANON, {
    db: { schema: "hellocard" },
    auth: { persistSession: false },
  });
}

// ── Types ────────────────────────────────────────────────────────────────────

export type HcCountry = "FR" | "CA";

export type CardEntry = {
  /** "hc:<numeric_id>" — distinguishable from Neon UUIDs */
  id: string;
  name: string;
  issuer: string | null;
};

// ── In-process cache (1 h TTL) ───────────────────────────────────────────────

const TTL = 60 * 60 * 1000;
const listCache = new Map<string, { data: CardEntry[]; expiresAt: number }>();
const coverageCache = new Map<string, { data: CoverageData; expiresAt: number }>();

// ── listCards ─────────────────────────────────────────────────────────────────

/**
 * Returns all active cards for the given country, labelled as "BankName — CardName".
 * Sorted by the `order` column ascending.
 */
export async function listCards(country: HcCountry): Promise<CardEntry[]> {
  const hit = listCache.get(country);
  if (hit && hit.expiresAt > Date.now()) return hit.data;

  const sb = makeClient();
  const { data, error } = await sb
    .from("cards")
    .select("id, bank_name, card_name")
    .eq("country", country)
    .eq("language", "fr")
    .order("order", { ascending: true })
    .limit(600);

  if (error) throw new Error(`[cards-catalog] listCards(${country}) → ${error.message}`);

  const entries: CardEntry[] = (data ?? []).map((r) => ({
    id: `hc:${r.id}`,
    name: `${r.bank_name} — ${r.card_name}`,
    issuer: r.bank_name ?? null,
  }));

  listCache.set(country, { data: entries, expiresAt: Date.now() + TTL });
  return entries;
}

// ── getCardCoverage ───────────────────────────────────────────────────────────

/**
 * Fetches the active guarantee rows for a given card and maps them to CoverageData.
 * @param hcId   "hc:<numeric_id>"
 * @param country "FR" | "CA"
 */
export async function getCardCoverage(
  hcId: string,
  country: HcCountry,
): Promise<CoverageData | null> {
  const cacheKey = `${country}:${hcId}`;
  const hit = coverageCache.get(cacheKey);
  if (hit && hit.expiresAt > Date.now()) return hit.data;

  const numericId = parseInt(hcId.replace(/^hc:/, ""), 10);
  if (!Number.isFinite(numericId)) return null;

  const sb = makeClient();
  const table =
    country === "FR" ? "card_guarantee_details_fr" : "card_guarantee_details_ca";
  const activeField = country === "FR" ? "active" : "is_active";

  const { data, error } = await sb
    .from(table)
    .select("insurance_guarantee, amount")
    .eq("card_id", numericId)
    .eq("language", "fr")
    .eq(activeField, true);

  if (error || !data?.length) return null;

  const map = country === "FR" ? FR_GUARANTEE_MAP : CA_GUARANTEE_MAP;
  const result = buildCoverageData(data, map, country);
  coverageCache.set(cacheKey, { data: result, expiresAt: Date.now() + TTL });
  return result;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function isActualCosts(amount: string | null): boolean {
  if (!amount) return false;
  return /r[ée]els?|actual|illimit|frais r/i.test(amount);
}

function parseCents(amount: string | null): number | null {
  if (!amount) return null;
  const n = parseFloat(amount.replace(/[^0-9.,]/g, "").replace(",", "."));
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.round(n * 100);
}

function buildCoverageData(
  rows: Array<{ insurance_guarantee: string; amount: string | null }>,
  map: GuaranteeMap,
  country: HcCountry,
): CoverageData {
  const currency = country === "FR" ? ("EUR" as const) : ("CAD" as const);

  // First hit wins per GuaranteeKey
  const byKey = new Map<string, { amount: string | null }>();
  for (const row of rows) {
    const gkey = map[row.insurance_guarantee];
    if (gkey && !byKey.has(gkey)) byKey.set(gkey, { amount: row.amount });
  }

  const g = (k: string) => byKey.get(k);
  const limits: CoverageData["limits"] = {};

  const med = g("medical_expenses");
  if (med) {
    limits.medical_expenses = isActualCosts(med.amount)
      ? { unlimited: true }
      : { unlimited: false, amount: { cents: parseCents(med.amount) ?? 0, currency } };
  }

  const rep = g("repatriation");
  if (rep) {
    const c = parseCents(rep.amount);
    limits.repatriation = {
      covered: true,
      actualCosts: isActualCosts(rep.amount),
      ...(c ? { cap: { cents: c, currency } } : {}),
    };
  }

  const cancel = g("trip_cancellation");
  if (cancel) {
    const c = parseCents(cancel.amount);
    if (c) limits.trip_cancellation = { cents: c, currency, perPerson: true };
  }

  const bag = g("baggage");
  if (bag) {
    const c = parseCents(bag.amount);
    if (c) limits.baggage = { cents: c, currency };
  }

  const liab = g("personal_liability");
  if (liab) {
    const c = parseCents(liab.amount);
    if (c) limits.personal_liability = { cents: c, currency };
  }

  const delay = g("trip_delay");
  if (delay) {
    const c = parseCents(delay.amount);
    if (c) limits.trip_delay = { cents: c, currency };
  }

  const car = g("rental_car_excess");
  if (car) {
    // "Frais réels" = full coverage (0 deductible); otherwise cap amount
    limits.rental_car_excess = {
      cents: isActualCosts(car.amount) ? 0 : (parseCents(car.amount) ?? 0),
      currency,
    };
  }

  const ski = g("winter_sports");
  if (ski) {
    const c = parseCents(ski.amount);
    limits.winter_sports = {
      covered: true,
      ...(c ? { cap: { cents: c, currency } } : {}),
    };
  }

  return {
    limits,
    constraints: { geographicalZone: "worldwide" },
    coveredRelatives: ["self"],
    notes: `Source: HelloCard Supabase (${country})`,
  };
}
