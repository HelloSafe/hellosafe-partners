import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { coverageProfiles, partners, trackedLinks } from "@/db/schema";
import { newId, newShortCode } from "@/lib/ids";
import { runGapAnalysis } from "@/lib/coach/gap-engine";
import type {
  CoverageData,
  WizardInputs,
} from "@/lib/coach/coverage-types";
import {
  clientIp,
  rateLimitResponse,
  widgetLimiter,
} from "@/lib/ratelimit";
import { type DestinationKey } from "@/lib/links/destinations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const AnswersSchema = z.object({
  destination: z.string().min(1).max(120),
  duration: z.enum(["short", "medium", "long", "year"]),
  age: z.enum(["under_25", "25_50", "50_70", "over_70"]),
  companions: z
    .array(z.enum(["alone", "partner", "kids", "friends"]))
    .min(1)
    .max(4),
  coverage: z
    .array(
      z.enum([
        "visa_premier",
        "mastercard_gold",
        "barclays",
        "none_card",
        "mutuelle_yes",
        "mutuelle_no",
        "ss_fr",
        "ss_uk",
      ]),
    )
    .max(6),
  specials: z
    .array(z.enum(["winter", "extreme", "cruise", "cancel", "none"]))
    .max(5),
});

const PayloadSchema = z.object({
  partner: z.string().min(1).max(64),
  lang: z.enum(["fr", "en"]),
  source: z.string().max(200).nullable().optional(),
  answers: AnswersSchema,
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function POST(req: NextRequest) {
  const verdict = await widgetLimiter(clientIp(req));
  if (!verdict.success) return rateLimitResponse(verdict);

  let payload: z.infer<typeof PayloadSchema>;
  try {
    const json = await req.json();
    payload = PayloadSchema.parse(json);
  } catch (err) {
    return NextResponse.json(
      { error: "Invalid payload", details: String(err) },
      { status: 400 },
    );
  }

  const partnerRow = await db
    .select({
      id: partners.id,
      partnerCode: partners.partnerCode,
      companyName: partners.companyName,
      status: partners.status,
    })
    .from(partners)
    .where(eq(partners.partnerCode, payload.partner))
    .limit(1);

  const partner = partnerRow[0];
  if (!partner || partner.status !== "approved") {
    return NextResponse.json({ error: "Unknown partner" }, { status: 404 });
  }

  // Map widget answers → WizardInputs.
  const inputs = mapAnswersToWizardInputs(payload.answers, payload.lang);

  // Load coverage profiles needed by the wizard inputs.
  const departureCountry = inputs.client.departureCountry;
  const baselineLocale = departureCountry === "UK" ? "en" : "fr";

  const profiles = await db
    .select()
    .from(coverageProfiles)
    .where(
      and(
        eq(coverageProfiles.active, true),
        isNull(coverageProfiles.partnerId),
      ),
    );

  const byNameLike = (substr: string) =>
    profiles.find(
      (p) =>
        p.locale === baselineLocale &&
        p.name.toLowerCase().includes(substr.toLowerCase()),
    );

  // Pick a card profile when the user said they have one.
  const cardWanted = payload.answers.coverage.find((c) =>
    ["visa_premier", "mastercard_gold", "barclays"].includes(c),
  );
  let cardProfile = null as null | {
    id: string;
    name: string;
    type: "card";
    data: CoverageData;
  };
  if (cardWanted === "visa_premier") {
    const r = byNameLike("Visa Premier");
    if (r)
      cardProfile = {
        id: r.id,
        name: r.name,
        type: "card",
        data: r.data as CoverageData,
      };
  } else if (cardWanted === "mastercard_gold") {
    // No baseline yet — fall back to Visa Premier as closest equivalent.
    const r = byNameLike("Visa Premier") ?? byNameLike("Barclays");
    if (r)
      cardProfile = {
        id: r.id,
        name: r.name,
        type: "card",
        data: r.data as CoverageData,
      };
  } else if (cardWanted === "barclays") {
    const r = byNameLike("Barclays");
    if (r)
      cardProfile = {
        id: r.id,
        name: r.name,
        type: "card",
        data: r.data as CoverageData,
      };
  }

  // Mutuelle (only if user said they have one).
  let mutuelleProfile = null as null | {
    id: string;
    name: string;
    type: "mutuelle";
    data: CoverageData;
  };
  if (payload.answers.coverage.includes("mutuelle_yes")) {
    const r =
      baselineLocale === "fr"
        ? byNameLike("Harmonie Mutuelle")
        : byNameLike("BUPA");
    if (r)
      mutuelleProfile = {
        id: r.id,
        name: r.name,
        type: "mutuelle",
        data: r.data as CoverageData,
      };
  }

  // Social security: auto-pick from departureCountry.
  const ssRow =
    baselineLocale === "fr"
      ? byNameLike("Sécurité Sociale")
      : byNameLike("NHS");
  const ssProfile = ssRow
    ? {
        id: ssRow.id,
        name: ssRow.name,
        type: "social_security" as const,
        data: ssRow.data as CoverageData,
      }
    : null;

  inputs.coverage.cardId = cardProfile?.id ?? null;
  inputs.coverage.mutuelleId = mutuelleProfile?.id ?? null;
  inputs.coverage.socialSecurityId = ssProfile?.id ?? null;
  inputs.coverage.partnerContractId = null;

  const output = runGapAnalysis({
    inputs,
    card: cardProfile,
    mutuelle: mutuelleProfile,
    socialSecurity: ssProfile,
    partnerContract: null,
    locale: payload.lang,
  });

  // Find or create the widget-coach tracked link for this partner so the
  // CTA click is logged in the partner's reporting just like any other link.
  const shortCode = await ensureWidgetLink(partner.id, payload.lang);

  const ctaUrl = `${APP_URL}/r/${shortCode}${
    payload.source
      ? `?subid=${encodeURIComponent(`widget:${payload.source.slice(0, 60)}`)}`
      : ""
  }`;

  return NextResponse.json({
    shareId: newId(),
    output,
    ctaUrl,
  });
}

// ===== Helpers =====

function mapAnswersToWizardInputs(
  answers: z.infer<typeof AnswersSchema>,
  lang: "fr" | "en",
): WizardInputs {
  const today = new Date();
  const startDate = new Date(today.getTime() + 30 * 86_400_000);
  const durationDays =
    answers.duration === "short"
      ? 5
      : answers.duration === "medium"
      ? 21
      : answers.duration === "long"
      ? 90
      : 365;
  const endDate = new Date(startDate.getTime() + durationDays * 86_400_000);

  const ageRange =
    answers.age === "under_25"
      ? "18_25"
      : answers.age === "25_50"
      ? "36_50"
      : answers.age === "50_70"
      ? "51_65"
      : "over_75";

  const companions: WizardInputs["client"]["companions"] = [];
  if (answers.companions.includes("partner")) {
    companions.push({ kind: "spouse_legal", count: 1 });
  }
  if (answers.companions.includes("kids")) {
    companions.push({ kind: "child_under_25", count: 2 });
  }
  if (answers.companions.includes("friends")) {
    companions.push({ kind: "friend", count: 1 });
  }

  const departureCountry: WizardInputs["client"]["departureCountry"] =
    answers.coverage.includes("ss_uk") || lang === "en" ? "UK" : "FR";

  const purpose: WizardInputs["trip"]["purpose"] =
    answers.specials.includes("cruise") ? "cruise" : "leisure";

  const activities: WizardInputs["trip"]["activities"] = [];
  if (answers.specials.includes("winter")) activities.push("winter_sports");
  if (answers.specials.includes("extreme")) activities.push("extreme_sports");
  if (activities.length === 0) activities.push("none");

  const tripValue = answers.specials.includes("cancel") ? 3000 : 0;

  return {
    client: {
      label: "Widget visitor",
      ageRange,
      companions,
      departureCountry,
    },
    trip: {
      destination: answers.destination,
      destinationLabel: answers.destination,
      startDate: startDate.toISOString().slice(0, 10),
      endDate: endDate.toISOString().slice(0, 10),
      purpose,
      activities,
      estimatedTripValueEur: tripValue,
    },
    coverage: {
      cardId: null,
      mutuelleId: null,
      socialSecurityId: null,
      partnerContractId: null,
    },
  };
}

const WIDGET_LINK_LABEL = "Widget Coach (auto)";

async function ensureWidgetLink(
  partnerId: string,
  language: string,
): Promise<string> {
  // Try to find an existing widget-coach link for this partner.
  const existing = await db
    .select({ shortCode: trackedLinks.shortCode })
    .from(trackedLinks)
    .where(
      and(
        eq(trackedLinks.partnerId, partnerId),
        eq(trackedLinks.label, WIDGET_LINK_LABEL),
      ),
    )
    .limit(1);

  if (existing[0]) return existing[0].shortCode;

  // Otherwise create one (idempotent thanks to unique short code).
  const shortCode = newShortCode(8);
  const destination: DestinationKey = "travel";
  await db.insert(trackedLinks).values({
    id: newId(),
    partnerId,
    shortCode,
    label: WIDGET_LINK_LABEL,
    destination,
    language,
    campaign: "widget-coach",
    subId: "",
  });
  return shortCode;
}

// CORS: allow embedding from any origin (the widget runs on partner sites).
export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get("origin") ?? "*";
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "content-type",
      "Access-Control-Max-Age": "86400",
    },
  });
}
