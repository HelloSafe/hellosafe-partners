import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/db";
import { users, sessions, accounts, verifications, partners } from "@/db/schema";
import { newId, newPartnerCode } from "@/lib/ids";
import { derivePartnerIdentity } from "@/lib/partners/identity";
import { send } from "@/lib/mail";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

export const auth = betterAuth({
  appName: "HelloSafe Partners",
  baseURL: APP_URL,
  secret: process.env.BETTER_AUTH_SECRET ?? process.env.SESSION_SECRET,
  database: drizzleAdapter(db, {
    provider: "pg",
    // With usePlural: true, Better Auth looks up models by their plural names
    // ("users", "sessions", ...) in this schema map.
    schema: {
      users,
      sessions,
      accounts,
      verifications,
    },
    usePlural: true,
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 8,
    // Email verification can be enabled later when we wire Resend.
    requireEmailVerification: false,
    // Password reset: Better Auth generates the token + URL; we just deliver
    // it. `url` already points at our /reset-password page (via the redirectTo
    // passed by the client) with the validated token appended.
    sendResetPassword: async ({ user, url }) => {
      await send({
        to: user.email,
        template: "reset-password",
        data: { name: user.name, resetUrl: url },
        locale: "fr",
      });
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      // Only enable when both env vars are present.
      enabled: Boolean(
        process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
      ),
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "partner",
        input: false, // not settable via signUp API
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        // Single source of truth for partner provisioning. Every account that
        // is created through the auth API — email/password OR Google OAuth —
        // gets its own `partners` row with an affiliate code here, so the
        // affiliate ID exists from minute one regardless of signup method.
        //
        // Admins are seeded directly against the DB (not via this API path),
        // so they never trigger this hook. The email/password signup route
        // runs AFTER this and enriches the row with the form fields; OAuth
        // users land with `profileCompletedAt` NULL and are walked through
        // /complete-profile before their account goes to review.
        after: async (user) => {
          const { companyName, contactName } = derivePartnerIdentity(user);
          try {
            await db.insert(partners).values({
              id: newId(),
              userId: user.id,
              partnerCode: newPartnerCode(),
              companyName,
              contactName,
              status: "pending",
              // profileCompletedAt intentionally left NULL.
            });
          } catch (err) {
            // Never let partner provisioning break the auth flow itself. A
            // unique-violation here means the row already exists, which is
            // fine; anything else is logged for investigation.
            console.error("[auth] partner provisioning failed", err);
          }

          // Welcome email — best-effort, must not block account creation.
          send({
            to: user.email,
            template: "welcome",
            data: { name: contactName, loginUrl: `${APP_URL}/login` },
            locale: "fr",
          }).catch((e) => console.error("[mail] welcome failed", e));
        },
      },
    },
  },
  session: {
    // Long sessions for the demo / dev experience: don't re-login every day.
    expiresIn: 60 * 60 * 24 * 365, // 1 year
    updateAge: 60 * 60 * 24, // refresh once per day
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 min in-cookie cache to skip DB on hot paths
    },
  },
  advanced: {
    cookiePrefix: "hsp",
    // Cookies must be visible to all subpaths.
    defaultCookieAttributes: {
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    },
  },
  rateLimit: {
    // Production-only by default — keeps `npm run dev` snappy when poking
    // the auth surface manually.
    enabled: process.env.NODE_ENV === "production",
    storage: "memory",
    customRules: {
      // Brute-force protection on email login. 5 attempts per 5 minutes
      // per IP is the OWASP-ish floor.
      "/sign-in/email": { window: 300, max: 5 },
      // Cap social signin churn to absorb popup loops.
      "/sign-in/social": { window: 60, max: 10 },
      // Forgot-password / verification email floods.
      "/request-password-reset": { window: 600, max: 3 },
      "/send-verification-email": { window: 600, max: 3 },
    },
  },
  // nextCookies must be the LAST plugin: it intercepts api calls in route
  // handlers / server actions and writes the session cookies to the outgoing
  // Next.js Response automatically.
  plugins: [nextCookies()],
});

export type AuthSession = typeof auth.$Infer.Session;
