import { NextRequest, NextResponse } from "next/server";
import {
  postbackFromHelloSafe,
  PostbackError,
} from "@/lib/postback/service";
import { PostbackPayloadSchema } from "@/lib/postback/validators";
import {
  clientIp,
  postbackLimiter,
  rateLimitResponse,
} from "@/lib/ratelimit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  // Defense in depth: ratelimit before checking the bearer so a leaked
  // token can't be used to flood the endpoint either.
  const verdict = await postbackLimiter(clientIp(req));
  if (!verdict.success) return rateLimitResponse(verdict);

  // Bearer token auth — issued to HelloSafe's backoffice.
  const secret = process.env.POSTBACK_SECRET;
  const auth = req.headers.get("authorization");
  if (!secret || !auth || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const raw = await req.json().catch(() => ({}));
  const parsed = PostbackPayloadSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "MISSING_FIELDS", required: ["ref", "externalOrderId"] },
      { status: 400 },
    );
  }

  try {
    const out = await postbackFromHelloSafe(parsed.data);
    return NextResponse.json(
      { ok: true, ...out },
      { status: out.action === "created" ? 201 : 200 },
    );
  } catch (e) {
    if (e instanceof PostbackError) {
      return NextResponse.json({ error: e.code }, { status: e.httpStatus });
    }
    throw e;
  }
}
