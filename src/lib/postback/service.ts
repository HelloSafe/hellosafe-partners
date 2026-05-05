import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { conversions, partners, trackedLinks } from "@/db/schema";
import { newId } from "@/lib/ids";
import { inngest } from "@/lib/inngest/client";
import type { PostbackPayload, SimulateConversionInput } from "./validators";

/**
 * Service for recording and updating partner-attributed conversions.
 * Two entry points:
 *   - postbackFromHelloSafe(payload): called by /api/postback/conversion
 *     when HelloSafe's backoffice notifies us of a sale.
 *   - simulateConversionForShortCode(input): admin helper used by
 *     /api/admin/test-conversion to mock a conversion in dev/demo.
 *
 * Both ultimately call recordOrUpdateConversion, which is idempotent on
 * `externalOrderId`.
 */

// ===================== Helpers =====================

function toCents(v: number | string | undefined): number {
  if (v == null) return 0;
  const n = typeof v === "string" ? parseFloat(v) : v;
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100);
}

/**
 * Parse the "<partnerCode>-<shortCode>" ref produced by /r redirect
 * cookie. partnerCode itself contains a dash (e.g. "hs-abc123") so we
 * split on the LAST dash.
 */
function splitRef(ref: string): { partnerCode: string; shortCode: string } | null {
  const lastDash = ref.lastIndexOf("-");
  if (lastDash < 0) return null;
  return {
    partnerCode: ref.slice(0, lastDash),
    shortCode: ref.slice(lastDash + 1),
  };
}

async function findLinkByShortCode(shortCode: string) {
  const rows = await db
    .select({ linkId: trackedLinks.id, partnerId: partners.id })
    .from(trackedLinks)
    .innerJoin(partners, eq(partners.id, trackedLinks.partnerId))
    .where(eq(trackedLinks.shortCode, shortCode))
    .limit(1);
  return rows[0] ?? null;
}

async function getPartnerCode(partnerId: string) {
  const rows = await db
    .select({ code: partners.partnerCode })
    .from(partners)
    .where(eq(partners.id, partnerId))
    .limit(1);
  return rows[0]?.code ?? null;
}

// ===================== Core: idempotent upsert =====================

type RecordParams = {
  linkId: string;
  partnerId: string;
  externalOrderId: string;
  amountCents: number;
  commissionCents: number;
  currency: string;
  status: "pending" | "validated" | "cancelled";
  subIdOverride: string | null;
};

async function recordOrUpdateConversion(params: RecordParams) {
  const existing = await db
    .select({ id: conversions.id })
    .from(conversions)
    .where(eq(conversions.externalOrderId, params.externalOrderId))
    .limit(1);

  if (existing.length) {
    await db
      .update(conversions)
      .set({
        status: params.status,
        amountCents: params.amountCents,
        commissionCents: params.commissionCents,
        currency: params.currency,
        validatedAt: params.status === "validated" ? new Date() : null,
        subIdOverride: params.subIdOverride,
      })
      .where(eq(conversions.id, existing[0].id));
    // Fire the event so handlers can react to status transitions (e.g.
    // an upgrade from pending → validated should still email the
    // partner). Best-effort.
    inngest
      .send({
        name: "conversion/created",
        data: {
          conversionId: existing[0].id,
          partnerId: params.partnerId,
          linkId: params.linkId,
          amountCents: params.amountCents,
          commissionCents: params.commissionCents,
          currency: params.currency as "EUR" | "GBP" | "USD",
          status: params.status,
        },
      })
      .catch((e) => console.error("[inngest] conversion/created failed", e));
    return { action: "updated" as const, id: existing[0].id };
  }

  const id = newId();
  await db.insert(conversions).values({
    id,
    linkId: params.linkId,
    partnerId: params.partnerId,
    externalOrderId: params.externalOrderId,
    amountCents: params.amountCents,
    commissionCents: params.commissionCents,
    currency: params.currency,
    status: params.status,
    subIdOverride: params.subIdOverride,
    validatedAt: params.status === "validated" ? new Date() : null,
  });
  inngest
    .send({
      name: "conversion/created",
      data: {
        conversionId: id,
        partnerId: params.partnerId,
        linkId: params.linkId,
        amountCents: params.amountCents,
        commissionCents: params.commissionCents,
        currency: params.currency as "EUR" | "GBP" | "USD",
        status: params.status,
      },
    })
    .catch((e) => console.error("[inngest] conversion/created failed", e));
  return { action: "created" as const, id };
}

// ===================== Public entry points =====================

/**
 * Record a conversion from HelloSafe's postback. Validates that the
 * partnerCode in the ref matches the actual link owner before inserting.
 * Errors thrown here are mapped to HTTP codes in the route handler.
 */
export async function postbackFromHelloSafe(payload: PostbackPayload) {
  const ref = splitRef(payload.ref);
  if (!ref) throw new PostbackError("INVALID_REF", 400);

  const link = await findLinkByShortCode(ref.shortCode);
  if (!link) throw new PostbackError("LINK_NOT_FOUND", 404);

  const ownerCode = await getPartnerCode(link.partnerId);
  if (ownerCode !== ref.partnerCode) {
    throw new PostbackError("REF_MISMATCH", 400);
  }

  return recordOrUpdateConversion({
    linkId: link.linkId,
    partnerId: link.partnerId,
    externalOrderId: payload.externalOrderId,
    amountCents: toCents(payload.amount),
    commissionCents: toCents(payload.commission),
    currency: (payload.currency || "EUR").toUpperCase(),
    status: payload.status ?? "pending",
    subIdOverride: payload.subId || null,
  });
}

/** Admin helper: simulate a conversion for a short code. */
export async function simulateConversionForShortCode(
  input: SimulateConversionInput,
) {
  const link = await findLinkByShortCode(input.shortCode);
  if (!link) throw new PostbackError("LINK_NOT_FOUND", 404);

  // Default amount/commission for the demo if not provided.
  const amount = input.amount ?? 79;
  const commission = input.commission ?? Math.round(amount * 0.15 * 100) / 100;
  const status = input.status ?? "validated";

  const externalOrderId = `TEST-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  const out = await recordOrUpdateConversion({
    linkId: link.linkId,
    partnerId: link.partnerId,
    externalOrderId,
    amountCents: Math.round(amount * 100),
    commissionCents: Math.round(commission * 100),
    currency: "EUR",
    status,
    subIdOverride: null,
  });
  return {
    id: out.id,
    externalOrderId,
    amountCents: Math.round(amount * 100),
    commissionCents: Math.round(commission * 100),
    status,
  };
}

export class PostbackError extends Error {
  constructor(public code: string, public httpStatus: number) {
    super(code);
  }
}
