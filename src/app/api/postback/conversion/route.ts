import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { trackedLinks, partners, conversions } from "@/db/schema";
import { newId } from "@/lib/ids";

export const dynamic = "force-dynamic";

type Payload = {
  ref?: string; // partnerCode-shortCode as produced by /r redirect (utm ref=)
  externalOrderId?: string;
  amount?: number | string; // in currency units, e.g. 79 for 79 EUR
  commission?: number | string; // in currency units
  currency?: string;
  status?: "pending" | "validated" | "cancelled";
  subId?: string;
};

export async function POST(req: NextRequest) {
  const secret = process.env.POSTBACK_SECRET;
  const auth = req.headers.get("authorization");
  if (!secret || !auth || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as Payload;
  if (!body.ref || !body.externalOrderId) {
    return NextResponse.json(
      { error: "MISSING_FIELDS", required: ["ref", "externalOrderId"] },
      { status: 400 },
    );
  }

  // ref is "<partnerCode>-<shortCode>". partnerCode is "hs-xxxxxx" (contains one dash).
  // Strategy: split on the LAST dash, everything before = partnerCode, after = shortCode.
  const lastDash = body.ref.lastIndexOf("-");
  if (lastDash < 0) {
    return NextResponse.json({ error: "INVALID_REF" }, { status: 400 });
  }
  const partnerCode = body.ref.slice(0, lastDash);
  const shortCode = body.ref.slice(lastDash + 1);

  const rows = await db
    .select({
      linkId: trackedLinks.id,
      partnerId: partners.id,
    })
    .from(trackedLinks)
    .innerJoin(partners, eq(partners.id, trackedLinks.partnerId))
    .where(eq(trackedLinks.shortCode, shortCode))
    .limit(1);

  const row = rows[0];
  if (!row) {
    return NextResponse.json({ error: "LINK_NOT_FOUND" }, { status: 404 });
  }

  // Sanity: ensure the partnerCode in the ref matches the owner of the link.
  const ownerCheck = await db
    .select({ code: partners.partnerCode })
    .from(partners)
    .where(eq(partners.id, row.partnerId))
    .limit(1);
  if (ownerCheck[0]?.code !== partnerCode) {
    return NextResponse.json({ error: "REF_MISMATCH" }, { status: 400 });
  }

  const amountCents = toCents(body.amount);
  const commissionCents = toCents(body.commission);
  const currency = (body.currency || "EUR").toUpperCase();
  const status = body.status ?? "pending";

  // Upsert by externalOrderId.
  const existing = await db
    .select({ id: conversions.id, status: conversions.status })
    .from(conversions)
    .where(eq(conversions.externalOrderId, body.externalOrderId))
    .limit(1);

  if (existing.length) {
    await db
      .update(conversions)
      .set({
        status,
        amountCents,
        commissionCents,
        currency,
        validatedAt: status === "validated" ? new Date() : null,
        subIdOverride: body.subId || null,
      })
      .where(eq(conversions.id, existing[0].id));
    return NextResponse.json({
      ok: true,
      action: "updated",
      id: existing[0].id,
    });
  }

  const id = newId();
  await db.insert(conversions).values({
    id,
    linkId: row.linkId,
    partnerId: row.partnerId,
    externalOrderId: body.externalOrderId,
    amountCents,
    commissionCents,
    currency,
    status,
    subIdOverride: body.subId || null,
    validatedAt: status === "validated" ? new Date() : null,
  });
  return NextResponse.json({ ok: true, action: "created", id }, { status: 201 });
}

function toCents(v: number | string | undefined): number {
  if (v == null) return 0;
  const n = typeof v === "string" ? parseFloat(v) : v;
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100);
}
