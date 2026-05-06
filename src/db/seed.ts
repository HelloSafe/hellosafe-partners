// Run with: npm run db:seed  (picks up .env.local via tsx --env-file)
import { eq, and, isNull } from "drizzle-orm";
import { hashPassword } from "better-auth/crypto";
import { db } from "./index";
import {
  users,
  accounts,
  partners,
  trackedLinks,
  clicks,
  conversions,
  coverageProfiles,
} from "./schema";
import { newId, newPartnerCode, newShortCode } from "../lib/ids";
import type { CoverageData } from "../lib/coach/coverage-types";

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

// ---------- Baseline coverage profiles ----------

const VISA_PREMIER_FR: CoverageData = {
  limits: {
    medical_expenses: {
      unlimited: false,
      amount: { cents: 155_000_00, currency: "EUR" },
      deductibleCents: 75_00,
    },
    repatriation: { covered: true, actualCosts: true },
    trip_cancellation: {
      cents: 5_500_00,
      currency: "EUR",
      perPerson: true,
      allCauses: false,
    },
    baggage: { cents: 800_00, currency: "EUR" },
    personal_liability: { cents: 1_500_000_00, currency: "EUR" },
    trip_delay: { cents: 600_00, currency: "EUR", afterHours: 4 },
    rental_car_excess: { cents: 0, currency: "EUR" },
    winter_sports: {
      covered: true,
      cap: { cents: 5_000_00, currency: "EUR" },
    },
  },
  constraints: {
    maxTripDurationDays: 90,
    maxAgeYears: 75,
    geographicalZone: "worldwide",
    deductibleCents: 75_00,
  },
  coveredRelatives: ["self", "spouse_legal", "children_under_25"],
  excludedRelatives: ["concubin", "children_over_25", "parents", "friends"],
  keyExclusions: [
    "Concubin non marié exclu",
    "Enfants de plus de 25 ans exclus",
    "Voyages de plus de 90 jours non couverts",
    "Conditions médicales préexistantes",
    "Sports extrêmes (parapente, alpinisme >3000m, etc.)",
  ],
  notes:
    "Carte standard du marché français milieu de gamme. Cotisation incluse dans les frais de tenue de compte.",
};

const BARCLAYS_PREMIER_UK: CoverageData = {
  limits: {
    medical_expenses: {
      unlimited: false,
      amount: { cents: 10_000_000_00, currency: "GBP" },
    },
    repatriation: { covered: true, actualCosts: true },
    trip_cancellation: {
      cents: 7_500_00,
      currency: "GBP",
      perPerson: true,
      allCauses: false,
    },
    baggage: { cents: 1_500_00, currency: "GBP" },
    personal_liability: { cents: 2_000_000_00, currency: "GBP" },
    trip_delay: { cents: 250_00, currency: "GBP", afterHours: 12 },
    rental_car_excess: { cents: 0, currency: "GBP" },
    winter_sports: {
      covered: true,
      cap: { cents: 5_000_00, currency: "GBP" },
    },
  },
  constraints: {
    maxTripDurationDays: 31,
    maxAgeYears: 70,
    geographicalZone: "worldwide",
  },
  coveredRelatives: ["self", "spouse_legal", "children_under_25"],
  excludedRelatives: ["concubin", "children_over_25", "parents", "friends"],
  keyExclusions: [
    "Unmarried partner not covered",
    "Adult children (over 25) not covered",
    "Trips longer than 31 days not covered",
    "Pre-existing medical conditions",
  ],
  notes:
    "Standard UK premium account card insurance. Coverage requires the trip to be paid with the card.",
};

const HARMONIE_FR: CoverageData = {
  limits: {
    medical_expenses: {
      unlimited: false,
      amount: { cents: 50_000_00, currency: "EUR" },
    },
    repatriation: { covered: false },
    trip_cancellation: { cents: 0, currency: "EUR" },
    baggage: { cents: 0, currency: "EUR" },
    personal_liability: { cents: 0, currency: "EUR" },
    trip_delay: { cents: 0, currency: "EUR" },
    rental_car_excess: { cents: 0, currency: "EUR" },
    winter_sports: { covered: false },
  },
  constraints: {
    maxTripDurationDays: 90,
    geographicalZone: "worldwide",
  },
  coveredRelatives: ["self", "spouse_legal", "concubin", "children_under_25"],
  keyExclusions: [
    "Pas de rapatriement sanitaire",
    "Pas d'annulation de voyage",
    "Pas de bagages",
    "Couvre uniquement le complément aux frais médicaux non remboursés par la sécu",
  ],
  notes: "Mutuelle standard France. Couvre les frais médicaux à l'étranger en complément de la Sécurité Sociale, sans assistance ni rapatriement.",
};

const BUPA_UK: CoverageData = {
  limits: {
    medical_expenses: {
      unlimited: false,
      amount: { cents: 100_000_00, currency: "GBP" },
    },
    repatriation: { covered: false },
    trip_cancellation: { cents: 0, currency: "GBP" },
    baggage: { cents: 0, currency: "GBP" },
    personal_liability: { cents: 0, currency: "GBP" },
    trip_delay: { cents: 0, currency: "GBP" },
    rental_car_excess: { cents: 0, currency: "GBP" },
    winter_sports: { covered: false },
  },
  constraints: {
    maxTripDurationDays: 90,
    geographicalZone: "worldwide",
  },
  coveredRelatives: ["self", "spouse_legal", "concubin", "children_under_25"],
  keyExclusions: [
    "No repatriation",
    "No trip cancellation",
    "No baggage cover",
    "Outpatient care only — overseas top-up plan",
  ],
  notes: "Standard UK private medical insurance. Travel cover is overseas top-up only.",
};

const SECU_FR: CoverageData = {
  limits: {
    medical_expenses: {
      unlimited: false,
      amount: { cents: 5_000_00, currency: "EUR" },
    },
    repatriation: { covered: false },
    trip_cancellation: { cents: 0, currency: "EUR" },
    baggage: { cents: 0, currency: "EUR" },
    personal_liability: { cents: 0, currency: "EUR" },
    trip_delay: { cents: 0, currency: "EUR" },
    rental_car_excess: { cents: 0, currency: "EUR" },
    winter_sports: { covered: false },
  },
  constraints: {
    geographicalZone: "EU+EHIC",
  },
  coveredRelatives: ["self"],
  keyExclusions: [
    "Hors EU/EEE/Suisse : remboursement aux tarifs français français sur facture, souvent dérisoire",
    "Pas de rapatriement",
    "Pas d'annulation",
    "Avance des frais à la charge du voyageur",
    "Hors EU+EHIC : aucune prise en charge directe",
  ],
  notes:
    "Sécurité Sociale française. Avec la carte EHIC, couvre les soins urgents dans un hôpital public en UE/EEE/Suisse au tarif local. Hors zone : quasiment rien en pratique.",
};

const NHS_UK: CoverageData = {
  limits: {
    medical_expenses: {
      unlimited: false,
      amount: { cents: 2_500_00, currency: "GBP" },
    },
    repatriation: { covered: false },
    trip_cancellation: { cents: 0, currency: "GBP" },
    baggage: { cents: 0, currency: "GBP" },
    personal_liability: { cents: 0, currency: "GBP" },
    trip_delay: { cents: 0, currency: "GBP" },
    rental_car_excess: { cents: 0, currency: "GBP" },
    winter_sports: { covered: false },
  },
  constraints: {
    geographicalZone: "EU+EHIC",
  },
  coveredRelatives: ["self"],
  keyExclusions: [
    "Outside EU/EEA: no automatic cover. Reimbursements very limited",
    "No repatriation",
    "No trip cancellation",
    "Patient pays upfront in most cases",
  ],
  notes:
    "UK NHS coverage abroad relies on the GHIC card (post-Brexit successor of EHIC). Public-hospital emergency care covered in EU/EEA at local rates. Outside EU: no cover, a private travel policy is essential.",
};

const CLUB_MED_DEFAULT_CONTRACT: CoverageData = {
  limits: {
    medical_expenses: {
      unlimited: false,
      amount: { cents: 250_000_00, currency: "EUR" },
    },
    repatriation: { covered: true, actualCosts: true },
    trip_cancellation: {
      cents: 8_000_00,
      currency: "EUR",
      perPerson: true,
      allCauses: true,
    },
    baggage: { cents: 2_000_00, currency: "EUR" },
    personal_liability: { cents: 4_500_000_00, currency: "EUR" },
    trip_delay: { cents: 500_00, currency: "EUR", afterHours: 4 },
    rental_car_excess: { cents: 0, currency: "EUR" },
    winter_sports: {
      covered: true,
      cap: { cents: 5_000_00, currency: "EUR" },
    },
  },
  constraints: {
    maxTripDurationDays: 60,
    maxAgeYears: 80,
    geographicalZone: "worldwide_excluding_us_canada",
  },
  coveredRelatives: ["self", "spouse_legal", "children_under_25"],
  excludedRelatives: ["concubin", "children_over_25", "parents", "friends"],
  keyExclusions: [
    "Concubin non marié exclu (clause familiale standard)",
    "Voyages aux États-Unis et au Canada non couverts",
    "Voyages de plus de 60 jours non couverts",
    "Conditions médicales préexistantes",
  ],
  notes:
    "Contrat agence par défaut (exemple Club Med). Configurez votre propre contrat pour le remplacer dans les analyses Coach.",
};

async function seedBaselineCoverages() {
  // Avoid duplicating: check if any baseline (partner_id is null) already exists.
  const exists = await db
    .select({ id: coverageProfiles.id })
    .from(coverageProfiles)
    .where(isNull(coverageProfiles.partnerId))
    .limit(1);
  if (exists.length) {
    console.log("  baseline coverages already present, skipping");
    return;
  }

  const baselines: Array<{
    type: "card" | "mutuelle" | "social_security";
    name: string;
    issuer: string;
    country: string;
    locale: "fr" | "en";
    data: CoverageData;
  }> = [
    {
      type: "card",
      name: "Visa Premier",
      issuer: "Visa Europe",
      country: "FR",
      locale: "fr",
      data: VISA_PREMIER_FR,
    },
    {
      type: "card",
      name: "Barclays Premier Travel Pack",
      issuer: "Barclays",
      country: "GB",
      locale: "en",
      data: BARCLAYS_PREMIER_UK,
    },
    {
      type: "mutuelle",
      name: "Harmonie Mutuelle",
      issuer: "Harmonie Mutuelle",
      country: "FR",
      locale: "fr",
      data: HARMONIE_FR,
    },
    {
      type: "mutuelle",
      name: "BUPA Worldwide",
      issuer: "BUPA",
      country: "GB",
      locale: "en",
      data: BUPA_UK,
    },
    {
      type: "social_security",
      name: "Sécurité Sociale française",
      issuer: "Assurance Maladie",
      country: "FR",
      locale: "fr",
      data: SECU_FR,
    },
    {
      type: "social_security",
      name: "NHS / GHIC",
      issuer: "UK National Health Service",
      country: "GB",
      locale: "en",
      data: NHS_UK,
    },
  ];

  for (const b of baselines) {
    await db.insert(coverageProfiles).values({
      id: newId(),
      partnerId: null,
      type: b.type,
      source: "seed",
      name: b.name,
      issuer: b.issuer,
      country: b.country,
      locale: b.locale,
      data: b.data,
      active: true,
    });
    console.log(`  + baseline ${b.type} ${b.name} (${b.locale.toUpperCase()})`);
  }
}

async function seedClubMedContract(partnerId: string) {
  // Check if partner already has a contract.
  const existing = await db
    .select({ id: coverageProfiles.id })
    .from(coverageProfiles)
    .where(
      and(
        eq(coverageProfiles.partnerId, partnerId),
        eq(coverageProfiles.type, "partner_contract"),
      ),
    )
    .limit(1);
  if (existing.length) return;

  await db.insert(coverageProfiles).values({
    id: newId(),
    partnerId,
    type: "partner_contract",
    source: "seed",
    name: "Club Med Travel Insurance",
    issuer: "Club Med",
    country: "FR",
    locale: "fr",
    data: CLUB_MED_DEFAULT_CONTRACT,
    active: true,
    notes: "Contrat de démonstration. Modifiez ou créez votre propre contrat depuis le dashboard.",
  });
  console.log(`  + Club Med default contract on partner ${partnerId.slice(0, 8)}…`);
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

  console.log("\n5. Baseline coverage profiles (cards / mutuelles / sécu)");
  await seedBaselineCoverages();

  console.log("\n6. Club Med default contract on agency partner");
  await seedClubMedContract(agencyPartner.id);

  console.log("\nDone.\n");
  console.log("--- Credentials ---");
  console.log("  Antoine  antoine@hellosafe.fr  / demo1234    → /fr/admin (persistent demo)");
  console.log("  Admin    admin@hellosafe.test  / changeme    → /fr/admin");
  console.log("  Blog     demo@partner.fr       / partner123  → /fr/dashboard");
  console.log("  Agency   agency@hellosafe.test / agency123   → /fr/dashboard/coach");
  console.log("");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
