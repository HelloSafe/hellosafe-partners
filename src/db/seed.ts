/* eslint-disable no-console */
// Run with: npm run db:seed  (picks up .env.local via tsx --env-file)
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "./index";
import { users, partners, trackedLinks, conversions } from "./schema";
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

  const id = newId();
  await db.insert(users).values({
    id,
    email: opts.email,
    passwordHash: await bcrypt.hash(opts.password, 10),
    name: opts.name,
    role: opts.role,
    emailVerifiedAt: new Date(),
  });
  console.log(`  + user ${opts.email} (${opts.role})`);
  return (await db.select().from(users).where(eq(users.id, id)).limit(1))[0];
}

async function upsertApprovedPartner(userId: string, info: {
  companyName: string;
  contactName: string;
  website: string;
  audience: string;
  country: string;
  monthlyVisitors: number;
}) {
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
    ...info,
    status: "approved",
    approvedAt: new Date(),
  });
  console.log(`  + partner approved ${info.companyName}`);
  return (
    await db.select().from(partners).where(eq(partners.id, id)).limit(1)
  )[0];
}

async function seedLinksAndConversions(partnerId: string) {
  const hasLinks = await db
    .select({ id: trackedLinks.id })
    .from(trackedLinks)
    .where(eq(trackedLinks.partnerId, partnerId))
    .limit(1);
  if (hasLinks.length) return;

  const specs = [
    { label: "Article PVT Canada", destination: "pvt", subId: "article-pvt-canada", campaign: "pvt-canada" },
    { label: "Newsletter mars", destination: "travel", subId: "newsletter-03", campaign: "newsletter-march" },
    { label: "Guide Schengen", destination: "schengen", subId: "guide-schengen", campaign: "schengen-guide" },
    { label: "Bannière ski saison", destination: "ski", subId: "home-hero", campaign: "ski-hero" },
    { label: "Widget homepage", destination: "home", subId: "widget-home", campaign: "home-widget" },
  ] as const;

  for (const spec of specs) {
    const linkId = newId();
    await db.insert(trackedLinks).values({
      id: linkId,
      partnerId,
      shortCode: newShortCode(8),
      label: spec.label,
      destination: spec.destination,
      language: "fr",
      campaign: spec.campaign,
      subId: spec.subId,
    });
    // Seed a handful of validated conversions on different months for the demo.
    const buckets = [
      { daysAgo: 3, count: 4 },
      { daysAgo: 12, count: 6 },
      { daysAgo: 40, count: 9 },
      { daysAgo: 72, count: 7 },
    ];
    for (const b of buckets) {
      for (let i = 0; i < b.count; i++) {
        const d = new Date();
        d.setUTCDate(d.getUTCDate() - b.daysAgo - i);
        await db.insert(conversions).values({
          id: newId(),
          linkId,
          partnerId,
          externalOrderId: `SEED-${linkId.slice(0, 6)}-${b.daysAgo}-${i}`,
          amountCents: 7900,
          commissionCents: Math.round(7900 * 0.15),
          currency: "EUR",
          status: b.daysAgo > 14 ? "validated" : "pending",
          validatedAt: b.daysAgo > 14 ? d : null,
          createdAt: d,
        });
      }
    }
    console.log(`  + link ${spec.label} (${spec.subId}) with seed conversions`);
  }
}

async function main() {
  console.log("Seeding HelloSafe Partners database…\n");

  console.log("1. Admin");
  await upsertUser({
    email: "admin@hellosafe.test",
    password: "changeme",
    name: "HelloSafe Admin",
    role: "admin",
  });

  console.log("\n2. Demo approved partner");
  const demoUser = await upsertUser({
    email: "demo@partner.fr",
    password: "partner123",
    name: "Julien Démo",
    role: "partner",
  });
  const demoPartner = await upsertApprovedPartner(demoUser.id, {
    companyName: "Blog Voyage Démo",
    contactName: "Julien Démo",
    website: "https://blogvoyage.example",
    audience: "Blog voyage FR, 45k visites/mois, forte saison été, audience PVT et longs séjours.",
    country: "FR",
    monthlyVisitors: 45_000,
  });

  console.log("\n3. Demo links + historical conversions");
  await seedLinksAndConversions(demoPartner.id);

  console.log("\nDone.\n");
  console.log("--- Credentials ---");
  console.log("  Admin    admin@hellosafe.test / changeme          → /fr/admin");
  console.log("  Partner  demo@partner.fr      / partner123        → /fr/dashboard");
  console.log("");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
