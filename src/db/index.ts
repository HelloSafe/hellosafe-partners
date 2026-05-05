import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is not set. Create .env.local from .env.example and paste your Neon URL.",
  );
}

// Reuse the same client across hot reloads in dev.
declare global {
  var __hspDbClient: ReturnType<typeof postgres> | undefined;
}

const client =
  global.__hspDbClient ??
  postgres(DATABASE_URL, {
    max: 5,
    idle_timeout: 20,
    // Neon's pooled connections require SSL; the URL should include sslmode=require.
  });

if (process.env.NODE_ENV !== "production") {
  global.__hspDbClient = client;
}

export const db = drizzle(client, { schema });
export { schema };
