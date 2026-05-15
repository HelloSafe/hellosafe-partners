// Run with: npm run db:seed  (picks up .env.local via tsx --env-file)
import { eq } from "drizzle-orm";
import { hashPassword } from "better-auth/crypto";
import { db } from "./index";
import {
  users,
  accounts,
  partners,
  trackedLinks,
  clicks,
  conversions,
} from "./schema";
import { newId, newPartnerCode, newShortCode } from "../lib/ids";

async function upsertUser(opts: {
  email: string;
  password: string;
  name: string;
  role: "admin" | "partner";
}) {
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, opts.email))
    .limit(1);
  if (existing[0]) return existing[0];

  // Create user + Better Auth credentials account in the same flow.
  const id = newId();
  await db.insert(users).values({
    id,
    email: opts.email,
    name: opts.name,
    role: opts.role,
    emailVerified: true,
  });
  await db.insert(accounts).values({
    id: newId(),
    accountId: id,
    providerId: "credential",
    userId: id,
    password: await hashPassword(opts.password),
  });
  console.log(`  + user ${opts.email} (${opts.role})`);
  return (await db.select().from(users).where(eq(users.id, id)).limit(1))[0];
}

async function upsertApprovedPartner(
  userId: string,
  info: {
    companyName: string;
    contactName: string;
    website: string;
    audience: string;
    country: string;
    monthlyVisitors: number;
    agencyName?: string;
    agencyTagline?: string;
    agencyBrandColor?: string;
    agencyLogoUrl?: string | null;
  },
) {
  const existing = await db
    .select()
    .from(partners)
    .where(eq(partners.userId, userId))
    .limit(1);
  if (existing[0]) return existing[0];

  const id = newId();
  await db.insert(partners).values({
    id,
    userId,
    partnerCode: newPartnerCode(),
    companyName: info.companyName,
    contactName: info.contactName,
    website: info.website,
    audience: info.audience,
    country: info.country,
    monthlyVisitors: info.monthlyVisitors,
    agencyName: info.agencyName ?? info.companyName,
    agencyTagline: info.agencyTagline ?? null,
    agencyBrandColor: info.agencyBrandColor ?? "#563bff",
    agencyLogoUrl: info.agencyLogoUrl ?? null,
    status: "approved",
    approvedAt: new Date(),
  });
  console.log(`  + partner approved ${info.companyName}`);
  return (
    await db.select().from(partners).where(eq(partners.id, id)).limit(1)
  )[0];
}

/**
 * Seeds 6 tracked links + ~2000 clicks + ~80 conversions on the blog partner,
 * spread over 30 days with a clear growth curve and weekend uplift, and a
 * Pareto distribution where the top 3 links concentrate ~60% of conversions.
 *
 * Idempotent: skips if any tracked link already exists for the partner.
 */
async function seedLinksAndConversions(partnerId: string) {
  const hasLinks = await db
    .select({ id: trackedLinks.id })
    .from(trackedLinks)
    .where(eq(trackedLinks.partnerId, partnerId))
    .limit(1);
  if (hasLinks.length) return;

  // 6 links with realistic French labels — mid-2026 timeframe.
  // Weight = relative share of clicks/conversions. Top 3 = 60% (28+22+12),
  // remaining 3 split 40% (16+12+10).
  const specs = [
    { label: "Article PVT Canada 2026", destination: "pvt",       subId: "blog-pvt-canada-2026",  campaign: "pvt-canada-evergreen", weight: 28 },
    { label: "Guide assurance étudiant Erasmus", destination: "student", subId: "blog-erasmus-guide", campaign: "erasmus-back-to-school", weight: 22 },
    { label: "Top 5 voyages août",       destination: "travel",   subId: "blog-top-5-aout",       campaign: "summer-roundup",       weight: 12 },
    { label: "Guide Schengen visa",      destination: "schengen", subId: "blog-schengen-visa",    campaign: "schengen-evergreen",   weight: 16 },
    { label: "Newsletter avril",         destination: "travel",   subId: "newsletter-04",         campaign: "newsletter-april",     weight: 12 },
    { label: "Bannière ski Pâques",      destination: "ski",      subId: "ski-easter-banner",     campaign: "ski-easter",           weight: 10 },
  ] as const;

  // Step 1 — create the links and remember their ids.
  const linkRows = await Promise.all(
    specs.map(async (spec) => {
      const id = newId();
      await db.insert(trackedLinks).values({
        id,
        partnerId,
        shortCode: newShortCode(8),
        label: spec.label,
        destination: spec.destination,
        language: "fr",
        campaign: spec.campaign,
        subId: spec.subId,
      });
      return { id, ...spec };
    }),
  );

  // Step 2 — generate a 30-day click curve with growth + weekend boost.
  const TOTAL_DAYS = 30;
  const today = new Date();
  today.setUTCHours(12, 0, 0, 0);
  const totalWeight = specs.reduce((acc, s) => acc + s.weight, 0);

  // Daily click target: starts at ~50, grows linearly to ~85 by day 30, +25% weekend.
  const dailyClickPlan: number[] = [];
  for (let i = 0; i < TOTAL_DAYS; i++) {
    const daysAgo = TOTAL_DAYS - 1 - i; // i=0 oldest → i=29 today
    const base = 50 + (i / (TOTAL_DAYS - 1)) * 35; // 50 → 85
    const day = new Date(today);
    day.setUTCDate(today.getUTCDate() - daysAgo);
    const isWeekend = day.getUTCDay() === 0 || day.getUTCDay() === 6;
    dailyClickPlan.push(Math.round(base * (isWeekend ? 1.25 : 1)));
  }

  // Step 3 — emit click rows.
  const clickRowsToInsert: typeof clicks.$inferInsert[] = [];
  for (let i = 0; i < TOTAL_DAYS; i++) {
    const daysAgo = TOTAL_DAYS - 1 - i;
    const targetForDay = dailyClickPlan[i];
    for (let c = 0; c < targetForDay; c++) {
      // Pick a link weighted by spec.weight.
      let pick = Math.random() * totalWeight;
      let chosen = linkRows[0];
      for (const lr of linkRows) {
        pick -= lr.weight;
        if (pick <= 0) {
          chosen = lr;
          break;
        }
      }
      const ts = new Date(today);
      ts.setUTCDate(today.getUTCDate() - daysAgo);
      ts.setUTCHours(8 + Math.floor(Math.random() * 14));
      ts.setUTCMinutes(Math.floor(Math.random() * 60));
      clickRowsToInsert.push({
        id: newId(),
        linkId: chosen.id,
        partnerId,
        ipHash: null,
        userAgent: "Mozilla/5.0 (seed)",
        referer: chosen.subId.startsWith("blog-")
          ? "https://blogvoyage.example"
          : "https://blogvoyage.example/newsletter",
        country: "FR",
        subIdOverride: null,
        createdAt: ts,
      });
    }
  }
  // Bulk insert in batches of 500.
  for (let i = 0; i < clickRowsToInsert.length; i += 500) {
    await db.insert(clicks).values(clickRowsToInsert.slice(i, i + 500));
  }

  // Step 4 — conversions. ~80 total over the same window.
  // Distribution: 70% validated, 20% pending, 10% cancelled. Older first.
  // Amount per conversion: gaussian-ish around €89 (commission ~15%).
  const TOTAL_CONVERSIONS = 80;
  const conversionRowsToInsert: typeof conversions.$inferInsert[] = [];
  for (let n = 0; n < TOTAL_CONVERSIONS; n++) {
    // Day distribution leans late so the curve is convincing.
    const dayWeighted = Math.floor(Math.pow(Math.random(), 0.7) * TOTAL_DAYS);
    const daysAgo = TOTAL_DAYS - 1 - dayWeighted;

    let pick = Math.random() * totalWeight;
    let chosen = linkRows[0];
    for (const lr of linkRows) {
      pick -= lr.weight;
      if (pick <= 0) {
        chosen = lr;
        break;
      }
    }

    const ts = new Date(today);
    ts.setUTCDate(today.getUTCDate() - daysAgo);
    ts.setUTCHours(9 + Math.floor(Math.random() * 12));
    ts.setUTCMinutes(Math.floor(Math.random() * 60));

    // Order amount: 39 / 79 / 99 / 119 / 159 — weighted around 89.
    const tier = Math.random();
    const amountCents =
      tier < 0.1 ? 3900 : tier < 0.4 ? 7900 : tier < 0.75 ? 9900 : tier < 0.93 ? 11900 : 15900;
    const commissionCents = Math.round(amountCents * 0.15);

    // Status: 70/20/10.
    const r = Math.random();
    const status: "validated" | "pending" | "cancelled" =
      r < 0.7 ? "validated" : r < 0.9 ? "pending" : "cancelled";

    conversionRowsToInsert.push({
      id: newId(),
      linkId: chosen.id,
      partnerId,
      externalOrderId: `SEED-${chosen.id.slice(0, 6)}-${n}`,
      amountCents,
      commissionCents,
      currency: "EUR",
      status,
      validatedAt: status === "validated" ? new Date(ts.getTime() + 86_400_000 * 7) : null,
      createdAt: ts,
    });
  }
  for (let i = 0; i < conversionRowsToInsert.length; i += 500) {
    await db.insert(conversions).values(conversionRowsToInsert.slice(i, i + 500));
  }

  console.log(
    `  + ${linkRows.length} links, ${clickRowsToInsert.length} clicks, ${conversionRowsToInsert.length} conversions (Pareto top 3 ≈ 60%)`,
  );
}

async function main() {
  console.log("Seeding HelloSafe Partners database…\n");

  console.log("1. Admin (legacy test account)");
  await upsertUser({
    email: "admin@hellosafe.test",
    password: "changeme",
    name: "HelloSafe Admin",
    role: "admin",
  });

  console.log("\n1bis. Antoine — persistent demo admin");
  const antoineUser = await upsertUser({
    email: "antoine@hellosafe.fr",
    password: "demo1234",
    name: "Antoine Fruchard",
    role: "admin",
  });
  // Antoine also has an approved partner record so he can browse the
  // partner dashboard without going through onboarding each time.
  await upsertApprovedPartner(antoineUser.id, {
    companyName: "HelloSafe (demo)",
    contactName: "Antoine Fruchard",
    website: "https://hellosafe.com",
    audience: "Compte demo persistent pour le pilotage produit.",
    country: "FR",
    monthlyVisitors: 100_000,
    agencyName: "HelloSafe",
    agencyTagline: "Le coach assurance des voyageurs",
    agencyBrandColor: "#563bff",
  });

  console.log("\n2. Demo blog partner (for affiliate tracking demo)");
  const blogUser = await upsertUser({
    email: "demo@partner.fr",
    password: "partner123",
    name: "Julien Démo",
    role: "partner",
  });
  const blogPartner = await upsertApprovedPartner(blogUser.id, {
    companyName: "Blog Voyage Démo",
    contactName: "Julien Démo",
    website: "https://blogvoyage.example",
    audience: "Blog voyage FR, 45k visites/mois, forte saison été, audience PVT et longs séjours.",
    country: "FR",
    monthlyVisitors: 45_000,
    agencyName: "Blog Voyage Démo",
    agencyTagline: "Le guide voyage qui répond aux vraies questions",
    agencyBrandColor: "#563bff",
  });

  console.log("\n3. Demo agency partner (for the Coach tool demo)");
  const agencyUser = await upsertUser({
    email: "agency@hellosafe.test",
    password: "agency123",
    name: "Caroline B.",
    role: "partner",
  });
  const agencyPartner = await upsertApprovedPartner(agencyUser.id, {
    companyName: "Voyages Évasion",
    contactName: "Caroline B.",
    website: "https://voyages-evasion.example",
    audience:
      "Agence de voyage haut de gamme, 4 commerciaux, 350 dossiers / an. Spécialités : croisière, circuits sur-mesure, expat.",
    country: "FR",
    monthlyVisitors: 0,
    agencyName: "Voyages Évasion",
    agencyTagline: "Conseil personnalisé depuis 2008",
    agencyBrandColor: "#0b1031",
  });

  console.log("\n4. Demo links + historical conversions (blog)");
  await seedLinksAndConversions(blogPartner.id);

  // Hint: agencyPartner is created but unused by the seed since we pivoted
  // away from the agency-side Coach tooling. Kept as a test account for now.
  void agencyPartner;

  console.log("\nDone.\n");
  console.log("--- Credentials ---");
  console.log("  Antoine  antoine@hellosafe.fr  / demo1234    → /fr/admin (persistent demo)");
  console.log("  Admin    admin@hellosafe.test  / changeme    → /fr/admin");
  console.log("  Blog     demo@partner.fr       / partner123  → /fr/dashboard");
  console.log("  Agency   agency@hellosafe.test / agency123   → /fr/dashboard");
  console.log("");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
