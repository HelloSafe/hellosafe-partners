import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is not set. Create .env.local from .env.example and paste your Neon URL.",
  );
}

// Neon's HTTP driver (SQL over fetch). Runs identically on Node and on the
// Cloudflare Workers runtime — which is why the whole app can deploy to
// Workers. We dropped postgres-js (raw TCP) because Workers can't open TCP
// sockets the way it needs. Safe because nothing here uses interactive
// transactions: neither app code nor Better Auth's drizzle adapter.
const sql = neon(DATABASE_URL);

export const db = drizzle(sql, { schema });
export { schema };
