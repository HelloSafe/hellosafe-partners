import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { coverageProfiles, gapAnalyses } from "@/db/schema";
import { getSessionContext } from "@/lib/session";
import { newId } from "@/lib/ids";
import { runGapAnalysis } from "@/lib/gap-engine";
import type {
  CoverageData,
  WizardInputs,
} from "@/lib/coverage-types";

export const dynamic = "force-dynamic";

export async function GET() {
  const ctx = await getSessionContext();
  if (!ctx?.partner) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }
  const rows = await db
    .select({
      id: gapAnalyses.id,
      clientLabel: gapAnalyses.clientLabel,
      locale: gapAnalyses.locale,
      createdAt: gapAnalyses.createdAt,
      output: gapAnalyses.output,
      inputs: gapAnalyses.inputs,
    })
    .from(gapAnalyses)
    .where(eq(gapAnalyses.partnerId, ctx.partner.id))
    .orderBy(desc(gapAnalyses.createdAt))
    .limit(50);

  return NextResponse.json({ analyses: rows });
}

export async function POST(req: NextRequest) {
  const ctx = await getSessionContext();
  if (!ctx?.partner) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }
  if (ctx.partner.status !== "approved") {
    return NextResponse.json({ error: "PARTNER_NOT_APPROVED" }, { status: 403 });
  }

  const body = (await req.json().catch(() => null)) as
    | { inputs: WizardInputs; locale?: "fr" | "en" }
    | null;
  if (!body?.inputs?.client?.label) {
    return NextResponse.json(
      { error: "MISSING_INPUTS", required: "inputs.client.label and trip details" },
      { status: 400 },
    );
  }
  const locale: "fr" | "en" = body.locale === "en" ? "en" : "fr";

  // Load referenced coverage profiles in a single query.
  const ids = [
    body.inputs.coverage.cardId,
    body.inputs.coverage.mutuelleId,
    body.inputs.coverage.socialSecurityId,
    body.inputs.coverage.partnerContractId,
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
    inputs: body.inputs,
    card: toRecord(body.inputs.coverage.cardId),
    mutuelle: toRecord(body.inputs.coverage.mutuelleId),
    socialSecurity: toRecord(body.inputs.coverage.socialSecurityId),
    partnerContract: toRecord(body.inputs.coverage.partnerContractId),
    locale,
  });

  const id = newId();
  await db.insert(gapAnalyses).values({
    id,
    partnerId: ctx.partner.id,
    clientLabel: body.inputs.client.label,
    locale,
    inputs: body.inputs,
    output,
  });

  return NextResponse.json({ ok: true, id, output }, { status: 201 });
}
