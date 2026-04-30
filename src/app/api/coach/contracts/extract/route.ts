import { NextRequest, NextResponse } from "next/server";
import { getSessionContext } from "@/lib/session";
import type { CoverageData } from "@/lib/coverage-types";

/**
 * Mock extraction endpoint.
 * In v2 we'll plug Claude API for real CGV → JSON extraction.
 * For now: returns a baseline Club-Med-like template + the warning that
 * the agent must verify. Best-effort regex sniffing on the input text to
 * pre-fill obvious numeric values when we can find them.
 */
export async function POST(req: NextRequest) {
  const ctx = await getSessionContext();
  if (!ctx?.partner) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }
  const body = (await req.json().catch(() => null)) as { text?: string } | null;
  const text = (body?.text ?? "").slice(0, 50_000);

  const data = templateFromText(text);

  return NextResponse.json({
    ok: true,
    extractionMode: "mock",
    notice:
      "Extraction simulée. Vérifiez les valeurs avant d'enregistrer le contrat.",
    suggestedName: detectName(text),
    suggestedIssuer: detectIssuer(text),
    data,
  });
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
  const raw = m[1].replace(/[\s.\u00a0]/g, "").replace(",", ".");
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
  const baggage = detectAmountCents(
    /bagages?[^€]*?([\d\s.,]+)\s*€/i,
    text,
  );

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
