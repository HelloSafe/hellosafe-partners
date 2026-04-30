import { relations, sql } from "drizzle-orm";
import {
  pgTable,
  text,
  integer,
  timestamp,
  pgEnum,
  uniqueIndex,
  index,
  bigint,
  jsonb,
  boolean,
} from "drizzle-orm/pg-core";

// ---------- enums ----------

export const userRole = pgEnum("user_role", ["partner", "admin"]);
export const partnerStatus = pgEnum("partner_status", [
  "pending",
  "approved",
  "rejected",
]);
export const conversionStatus = pgEnum("conversion_status", [
  "pending",
  "validated",
  "cancelled",
]);
export const payoutStatus = pgEnum("payout_status", [
  "pending",
  "processing",
  "paid",
]);
export const coverageType = pgEnum("coverage_type", [
  "card",
  "mutuelle",
  "social_security",
  "partner_contract",
]);
export const coverageSource = pgEnum("coverage_source", [
  "seed",
  "payload",
  "manual",
  "imported",
]);

// ---------- users ----------

export const users = pgTable(
  "users",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull(),
    passwordHash: text("password_hash"),
    googleId: text("google_id"),
    name: text("name"),
    image: text("image"),
    role: userRole("role").notNull().default("partner"),
    emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("users_email_unique").on(sql`lower(${t.email})`),
    uniqueIndex("users_google_unique").on(t.googleId),
  ],
);

// ---------- partners ----------

export const partners = pgTable(
  "partners",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    partnerCode: text("partner_code").notNull(),
    companyName: text("company_name").notNull(),
    contactName: text("contact_name").notNull(),
    website: text("website"),
    audience: text("audience"),
    country: text("country"),
    monthlyVisitors: integer("monthly_visitors"),
    status: partnerStatus("status").notNull().default("pending"),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    // Agency branding for the white-label coach output.
    agencyName: text("agency_name"),
    agencyLogoUrl: text("agency_logo_url"),
    agencyBrandColor: text("agency_brand_color"),
    agencyTagline: text("agency_tagline"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("partners_user_unique").on(t.userId),
    uniqueIndex("partners_code_unique").on(t.partnerCode),
    index("partners_status_idx").on(t.status),
  ],
);

// ---------- tracked links ----------

export const trackedLinks = pgTable(
  "tracked_links",
  {
    id: text("id").primaryKey(),
    partnerId: text("partner_id")
      .notNull()
      .references(() => partners.id, { onDelete: "cascade" }),
    shortCode: text("short_code").notNull(),
    label: text("label").notNull(),
    destination: text("destination").notNull(),
    language: text("language").notNull().default("fr"),
    campaign: text("campaign").notNull().default(""),
    subId: text("sub_id").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("tracked_links_short_code_unique").on(t.shortCode),
    index("tracked_links_partner_idx").on(t.partnerId),
  ],
);

// ---------- clicks ----------

export const clicks = pgTable(
  "clicks",
  {
    id: text("id").primaryKey(),
    linkId: text("link_id")
      .notNull()
      .references(() => trackedLinks.id, { onDelete: "cascade" }),
    partnerId: text("partner_id")
      .notNull()
      .references(() => partners.id, { onDelete: "cascade" }),
    ipHash: text("ip_hash"),
    userAgent: text("user_agent"),
    referer: text("referer"),
    country: text("country"),
    subIdOverride: text("sub_id_override"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("clicks_link_idx").on(t.linkId),
    index("clicks_partner_idx").on(t.partnerId),
    index("clicks_created_idx").on(t.createdAt),
  ],
);

// ---------- conversions ----------

export const conversions = pgTable(
  "conversions",
  {
    id: text("id").primaryKey(),
    linkId: text("link_id").references(() => trackedLinks.id, {
      onDelete: "set null",
    }),
    partnerId: text("partner_id")
      .notNull()
      .references(() => partners.id, { onDelete: "cascade" }),
    externalOrderId: text("external_order_id").notNull(),
    amountCents: bigint("amount_cents", { mode: "number" }).notNull(),
    commissionCents: bigint("commission_cents", { mode: "number" }).notNull(),
    currency: text("currency").notNull().default("EUR"),
    status: conversionStatus("status").notNull().default("pending"),
    subIdOverride: text("sub_id_override"),
    validatedAt: timestamp("validated_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("conversions_external_unique").on(t.externalOrderId),
    index("conversions_partner_idx").on(t.partnerId),
    index("conversions_link_idx").on(t.linkId),
    index("conversions_status_idx").on(t.status),
  ],
);

// ---------- payouts ----------

export const payouts = pgTable(
  "payouts",
  {
    id: text("id").primaryKey(),
    partnerId: text("partner_id")
      .notNull()
      .references(() => partners.id, { onDelete: "cascade" }),
    periodYm: text("period_ym").notNull(),
    salesCount: integer("sales_count").notNull().default(0),
    grossCents: bigint("gross_cents", { mode: "number" }).notNull().default(0),
    status: payoutStatus("status").notNull().default("pending"),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("payouts_partner_period_unique").on(t.partnerId, t.periodYm),
    index("payouts_status_idx").on(t.status),
  ],
);

// ---------- sessions ----------

export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("sessions_user_idx").on(t.userId)],
);

// ---------- coverage profiles (cards / mutuelles / social security / partner contracts) ----------

export const coverageProfiles = pgTable(
  "coverage_profiles",
  {
    id: text("id").primaryKey(),
    // null partner_id = global baseline (cards, mutuelles, social_security)
    // non-null = partner-specific contract (e.g. agency's own product)
    partnerId: text("partner_id").references(() => partners.id, {
      onDelete: "cascade",
    }),
    type: coverageType("type").notNull(),
    source: coverageSource("source").notNull().default("manual"),
    name: text("name").notNull(),
    issuer: text("issuer"),
    country: text("country"),
    locale: text("locale").notNull().default("fr"),
    data: jsonb("data").notNull().default(sql`'{}'::jsonb`),
    active: boolean("active").notNull().default(true),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("coverage_partner_idx").on(t.partnerId),
    index("coverage_type_idx").on(t.type),
    index("coverage_locale_idx").on(t.locale),
  ],
);

// ---------- gap analyses (one per session of the coach wizard) ----------

export const gapAnalyses = pgTable(
  "gap_analyses",
  {
    id: text("id").primaryKey(),
    partnerId: text("partner_id")
      .notNull()
      .references(() => partners.id, { onDelete: "cascade" }),
    clientLabel: text("client_label").notNull(),
    locale: text("locale").notNull().default("fr"),
    inputs: jsonb("inputs").notNull(),
    output: jsonb("output").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("gap_partner_idx").on(t.partnerId),
    index("gap_created_idx").on(t.createdAt),
  ],
);

// ---------- oauth state (short-lived CSRF for Google auth) ----------

export const oauthStates = pgTable("oauth_states", {
  id: text("id").primaryKey(),
  state: text("state").notNull(),
  codeVerifier: text("code_verifier").notNull(),
  redirectTo: text("redirect_to"),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ---------- relations ----------

export const usersRelations = relations(users, ({ one, many }) => ({
  partner: one(partners, { fields: [users.id], references: [partners.userId] }),
  sessions: many(sessions),
}));

export const partnersRelations = relations(partners, ({ one, many }) => ({
  user: one(users, { fields: [partners.userId], references: [users.id] }),
  links: many(trackedLinks),
  clicks: many(clicks),
  conversions: many(conversions),
  payouts: many(payouts),
}));

export const trackedLinksRelations = relations(trackedLinks, ({ one, many }) => ({
  partner: one(partners, {
    fields: [trackedLinks.partnerId],
    references: [partners.id],
  }),
  clicks: many(clicks),
  conversions: many(conversions),
}));

export const clicksRelations = relations(clicks, ({ one }) => ({
  link: one(trackedLinks, {
    fields: [clicks.linkId],
    references: [trackedLinks.id],
  }),
  partner: one(partners, {
    fields: [clicks.partnerId],
    references: [partners.id],
  }),
}));

export const conversionsRelations = relations(conversions, ({ one }) => ({
  link: one(trackedLinks, {
    fields: [conversions.linkId],
    references: [trackedLinks.id],
  }),
  partner: one(partners, {
    fields: [conversions.partnerId],
    references: [partners.id],
  }),
}));

// ---------- types ----------

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Partner = typeof partners.$inferSelect;
export type NewPartner = typeof partners.$inferInsert;
export type TrackedLink = typeof trackedLinks.$inferSelect;
export type NewTrackedLink = typeof trackedLinks.$inferInsert;
export type Click = typeof clicks.$inferSelect;
export type Conversion = typeof conversions.$inferSelect;
export type Payout = typeof payouts.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type CoverageProfile = typeof coverageProfiles.$inferSelect;
export type NewCoverageProfile = typeof coverageProfiles.$inferInsert;
export type GapAnalysis = typeof gapAnalyses.$inferSelect;
export type NewGapAnalysis = typeof gapAnalyses.$inferInsert;
