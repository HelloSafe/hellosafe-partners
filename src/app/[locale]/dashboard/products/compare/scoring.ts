import type { DisplayOffer } from "./OfferGrid";

/**
 * Coverage score on 0–100 — agency-side heuristic to help compare offers
 * at a glance. Not an official HelloSafe rating; pure UX aid.
 *
 * Buckets (max 100):
 *   medical       30
 *   repatriation  15
 *   cancellation  20
 *   baggage       10
 *   liability     10
 *   delay          5
 *   assistance    5
 *   sports         5
 */

const buckets: Array<{
  key: string;
  match: RegExp;
  weight: number;
  highValueEur: number;
}> = [
  { key: "medical", match: /m[ée]dic|hospital|frais.*soin/i, weight: 30, highValueEur: 100_000 },
  { key: "repatriation", match: /rapatri|repatri/i, weight: 15, highValueEur: 0 },
  { key: "cancellation", match: /annul|cancel/i, weight: 20, highValueEur: 5_000 },
  { key: "baggage", match: /bagage|baggage|luggage/i, weight: 10, highValueEur: 1_500 },
  { key: "liability", match: /resp(?:onsabilit[eé])?(?:[\s_-]+civile)?|liability|civile/i, weight: 10, highValueEur: 100_000 },
  { key: "delay", match: /retard|delay/i, weight: 5, highValueEur: 0 },
  { key: "assistance", match: /assistance|24[\s/_-]*7/i, weight: 5, highValueEur: 0 },
  { key: "sports", match: /sport|extr[eê]me|ski|aventure/i, weight: 5, highValueEur: 0 },
];

function parseEurValue(s: string | undefined | null): number {
  if (!s) return 0;
  const lower = s.toLowerCase();
  if (/illimit|frais\s+r[ée]el|unlimited/.test(lower)) return Number.POSITIVE_INFINITY;
  // Extract first numeric run
  const m = s.replace(/\s/g, "").match(/(\d+(?:[.,]\d+)?)/);
  if (!m) return 0;
  const n = parseFloat(m[1].replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

export function computeScore(o: DisplayOffer): number {
  const garanties =
    o.priceData?.partnerProductInfo?.allInfoFromPartnerApi?.garanties ?? [];
  let score = 0;
  for (const b of buckets) {
    const g = garanties.find((x) =>
      b.match.test(`${x.code_garantie ?? ""} ${x.label ?? ""}`),
    );
    if (!g) continue;
    if (b.highValueEur === 0) {
      score += b.weight; // presence-only
    } else {
      const v = parseEurValue(g.valeur);
      const ratio = Math.min(1, v / b.highValueEur);
      // Floor of 50% of weight as soon as the guarantee exists
      score += Math.round(b.weight * (0.5 + 0.5 * ratio));
    }
  }
  return Math.min(100, score);
}
