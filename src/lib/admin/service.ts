import "server-only";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { conversions, partners, trackedLinks } from "@/db/schema";

/**
 * Admin operations that don't fit a single domain. Currently: read-only
 * conversions feed across all partners. Status mutations on partners
 * live in src/lib/partners/service.ts.
 */

export async function listConversions(limit = 50) {
  const rows = await db
    .select({
      id: conversions.id,
      externalOrderId: conversions.externalOrderId,
      amountCents: conversions.amountCents,
      commissionCents: conversions.commissionCents,
      currency: conversions.currency,
      status: conversions.status,
      createdAt: conversions.createdAt,
      validatedAt: conversions.validatedAt,
      partnerCompany: partners.companyName,
      partnerCode: partners.partnerCode,
      linkLabel: trackedLinks.label,
      linkShortCode: trackedLinks.shortCode,
      subId: conversions.subIdOverride,
    })
    .from(conversions)
    .innerJoin(partners, eq(partners.id, conversions.partnerId))
    .leftJoin(trackedLinks, eq(trackedLinks.id, conversions.linkId))
    .orderBy(desc(conversions.createdAt))
    .limit(limit);

  return rows.map((r) => ({
    ...r,
    amountCents: Number(r.amountCents),
    commissionCents: Number(r.commissionCents),
  }));
}
