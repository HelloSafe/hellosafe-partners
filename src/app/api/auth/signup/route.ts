import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users, partners } from "@/db/schema";
import { newId, newPartnerCode } from "@/lib/ids";

type Body = {
  email?: string;
  password?: string;
  companyName?: string;
  contactName?: string;
  website?: string;
  audience?: string;
  country?: string;
  monthlyVisitors?: string | number;
};

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const password = body.password?.trim();
  const companyName = body.companyName?.trim();
  const contactName = body.contactName?.trim();

  if (!email || !password || !companyName || !contactName) {
    return NextResponse.json(
      { error: "MISSING_FIELDS" },
      { status: 400 },
    );
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "PASSWORD_TOO_SHORT" }, { status: 400 });
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: "INVALID_EMAIL" }, { status: 400 });
  }

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (existing.length) {
    return NextResponse.json({ error: "EMAIL_ALREADY_USED" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const userId = newId();

  await db.insert(users).values({
    id: userId,
    email,
    passwordHash,
    name: contactName,
    role: "partner",
  });

  await db.insert(partners).values({
    id: newId(),
    userId,
    partnerCode: newPartnerCode(),
    companyName,
    contactName,
    website: body.website?.trim() || null,
    audience: body.audience?.trim() || null,
    country: body.country?.trim() || null,
    monthlyVisitors:
      typeof body.monthlyVisitors === "string"
        ? parseInt(body.monthlyVisitors, 10) || null
        : body.monthlyVisitors ?? null,
    status: "pending",
  });

  return NextResponse.json({ ok: true, status: "pending" }, { status: 201 });
}
