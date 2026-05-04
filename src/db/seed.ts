/* eslint-disable no-console */
// Run with: npm run db:seed  (picks up .env.local via tsx --env-file)
import { eq, and, isNull } from "drizzle-orm";
import { hashPassword } from "better-auth/crypto";
import { db } from "./index";
import {
  users,
  accounts,
  partners,
  trackedLinks,
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
