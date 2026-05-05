/**
 * Edge-runtime DB client. Vercel Edge runs in a Workers-like sandbox
 * (no Node `net` module), so postgres-js (used in src/db/index.ts) is
 * out. Neon's serverless driver speaks SQL over fetch, which works on
 * Edge.
 *
 * Use this client ONLY in routes that declare `runtime = "edge"`. Most
 * of the app should keep importing from "@/db" (Node, postgres-js) for
 * better latency on multi-statement transactions.
 */

import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is not set (edge client).");
}

const sql = neon(DATABASE_URL);
export const dbEdge = drizzle(sql, { schema });
