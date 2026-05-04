import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/db";
import { users, sessions, accounts, verifications } from "@/db/schema";

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
  // nextCookies must be the LAST plugin: it intercepts api calls in route
  // handlers / server actions and writes the session cookies to the outgoing
  // Next.js Response automatically.
  plugins: [nextCookies()],
});

export type AuthSession = typeof auth.$Infer.Session;
