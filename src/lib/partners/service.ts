import "server-only";
import { desc, eq, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import { clicks, conversions, partners, users } from "@/db/schema";
import type { Partner } from "@/db/schema";
import type {
  AdminStatusInput,
  BrandingInput,
  CompleteProfileInput,
  OnboardingInput,
} from "./validators";

/**
 * Service layer for the partners domain. Owns the `partners` table and
 * exposes operations consumed by both the admin back-office and the
 * partner self-service routes.
 */

// ===================== Read =====================

export async function getById(id: string): Promise<Partner | null> {
  const rows = await db.select().from(partners).where(eq(partners.id, id)).limit(1);
  return rows[0] ?? null;
}

/**
 * Partner + the email of its linked user. Used by the admin route when it
 * needs to email the partner after a status change.
 */
export async function getByIdWithEmail(
  id: string,
): Promise<(Partner & { email: string }) | null> {
  const rows = await db
    .select({
      id: partners.id,
      userId: partners.userId,
      partnerCode: partners.partnerCode,
      companyName: partners.companyName,
      contactName: partners.contactName,
      website: partners.website,
      audience: partners.audience,
      country: partners.country,
      monthlyVisitors: partners.monthlyVisitors,
      status: partners.status,
      approvedAt: partners.approvedAt,
      profileCompletedAt: partners.profileCompletedAt,
      agencyName: partners.agencyName,
      agencyLogoUrl: partners.agencyLogoUrl,
      agencyBrandColor: partners.agencyBrandColor,
      agencyTagline: partners.agencyTagline,
      persona: partners.persona,
      onboardedAt: partners.onboardedAt,
      legalForm: partners.legalForm,
      siret: partners.siret,
      vatNumber: partners.vatNumber,
      billingStreet: partners.billingStreet,
      billingPostalCode: partners.billingPostalCode,
      billingCity: partners.billingCity,
      billingCountry: partners.billingCountry,
      createdAt: partners.createdAt,
      email: users.email,
    })
    .from(partners)
    .innerJoin(users, eq(users.id, partners.userId))
    .where(eq(partners.id, id))
    .limit(1);
  return rows[0] ?? null;
}

/**
 * List all partners with their click / sales / commission aggregates and
 * the linked user email. Used by the admin dashboard.
 */
export async function listForAdminWithStats() {
  // Pre-aggregate clicks and conversions per partner (one scan each) and merge
  // in JS, instead of three correlated subqueries per partner row.
  const [rows, clickRows, convRows] = await Promise.all([
    db
      .select({
        id: partners.id,
        userId: partners.userId,
        partnerCode: partners.partnerCode,
        companyName: partners.companyName,
        contactName: partners.contactName,
        website: partners.website,
        audience: partners.audience,
        country: partners.country,
        monthlyVisitors: partners.monthlyVisitors,
        status: partners.status,
        createdAt: partners.createdAt,
        approvedAt: partners.approvedAt,
        email: users.email,
      })
      .from(partners)
      .innerJoin(users, eq(users.id, partners.userId))
      .orderBy(desc(partners.createdAt)),
    db
      .select({ partnerId: clicks.partnerId, clicks: sql<number>`count(*)::int` })
      .from(clicks)
      .groupBy(clicks.partnerId),
    db
      .select({
        partnerId: conversions.partnerId,
        sales: sql<number>`count(*)::int`,
        commissionCents: sql<number>`coalesce(sum(${conversions.commissionCents}),0)::bigint`,
      })
      .from(conversions)
      .where(ne(conversions.status, "cancelled"))
      .groupBy(conversions.partnerId),
  ]);

  const clicksByPartner = new Map(
    clickRows.map((c) => [c.partnerId, Number(c.clicks)]),
  );
  const convByPartner = new Map(
    convRows.map((c) => [
      c.partnerId,
      { sales: Number(c.sales), commissionCents: Number(c.commissionCents) },
    ]),
  );

  return rows.map((r) => ({
    ...r,
    clickCount: clicksByPartner.get(r.id) ?? 0,
    salesCount: convByPartner.get(r.id)?.sales ?? 0,
    commissionCents: convByPartner.get(r.id)?.commissionCents ?? 0,
  }));
}

// ===================== Mutations =====================

/** Admin: approve / reject / reset to pending. */
export async function updateStatus(id: string, input: AdminStatusInput) {
  await db
    .update(partners)
    .set({
      status: input.status,
      approvedAt: input.status === "approved" ? new Date() : null,
    })
    .where(eq(partners.id, id));
}

/**
 * Self-service: persona + agency white-label fields, plus the
 * "onboardedAt" stamp when `complete` is true.
 */
export async function updateOnboarding(
  partnerId: string,
  current: Pick<Partner, "companyName" | "agencyBrandColor">,
  input: OnboardingInput,
) {
  const updates: Record<string, unknown> = {};

  if (input.persona !== undefined) updates.persona = input.persona;
  if (input.agencyName !== undefined) {
    updates.agencyName = input.agencyName.trim() || current.companyName;
  }
  if (input.agencyLogoUrl !== undefined) {
    updates.agencyLogoUrl = input.agencyLogoUrl?.trim() || null;
  }
  if (input.agencyBrandColor !== undefined) {
    updates.agencyBrandColor = input.agencyBrandColor;
  }
  if (input.agencyTagline !== undefined) {
    updates.agencyTagline = input.agencyTagline?.trim() || null;
  }
  if (input.complete) {
    updates.onboardedAt = new Date();
  }

  if (Object.keys(updates).length > 0) {
    await db.update(partners).set(updates).where(eq(partners.id, partnerId));
  }
}

/**
 * Self-service: OAuth partners fill in their company / site details before the
 * account goes to review. Stamps `profileCompletedAt` so the dashboard gate
 * stops routing them back to /complete-profile.
 */
export async function completeProfile(
  partnerId: string,
  input: CompleteProfileInput,
) {
  const visitors =
    typeof input.monthlyVisitors === "string"
      ? parseInt(input.monthlyVisitors, 10) || null
      : input.monthlyVisitors ?? null;

  await db
    .update(partners)
    .set({
      companyName: input.companyName.trim(),
      contactName: input.contactName.trim(),
      website: input.website?.trim() || null,
      audience: input.audience?.trim() || null,
      country: input.country?.trim() || null,
      monthlyVisitors: visitors,
      profileCompletedAt: new Date(),
    })
    .where(eq(partners.id, partnerId));
}

/** Self-service: branding fields used by the coach white-label output. */
export async function updateBranding(
  partnerId: string,
  current: Pick<Partner, "companyName" | "agencyBrandColor">,
  input: BrandingInput,
) {
  // Soft validation on color: must look like a hex; otherwise keep current.
  const HEX = /^#[0-9a-fA-F]{6}$/;
  const color =
    input.agencyBrandColor && HEX.test(input.agencyBrandColor)
      ? input.agencyBrandColor
      : current.agencyBrandColor ?? "#563bff";

  await db
    .update(partners)
    .set({
      agencyName: input.agencyName?.trim() || current.companyName,
      agencyLogoUrl: input.agencyLogoUrl?.trim() || null,
      agencyBrandColor: color,
      agencyTagline: input.agencyTagline?.trim() || null,
    })
    .where(eq(partners.id, partnerId));
}
