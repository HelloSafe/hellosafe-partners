import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users, partners } from "@/db/schema";
import { createSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const password = body.password;
  if (!email || !password) {
    return NextResponse.json({ error: "MISSING_FIELDS" }, { status: 400 });
  }

  const rows = await db
    .select({
      id: users.id,
      passwordHash: users.passwordHash,
      role: users.role,
      partnerStatus: partners.status,
    })
    .from(users)
    .leftJoin(partners, eq(partners.userId, users.id))
    .where(eq(users.email, email))
    .limit(1);

  const row = rows[0];
  if (!row || !row.passwordHash) {
    return NextResponse.json(
      { error: "INVALID_CREDENTIALS" },
      { status: 401 },
    );
  }
  const ok = await bcrypt.compare(password, row.passwordHash);
  if (!ok) {
    return NextResponse.json(
      { error: "INVALID_CREDENTIALS" },
      { status: 401 },
    );
  }

  await createSession(row.id);

  return NextResponse.json({
    ok: true,
    role: row.role,
    partnerStatus: row.partnerStatus ?? null,
  });
}
