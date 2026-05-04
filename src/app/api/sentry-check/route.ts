// Temporary: triggers a server error to verify Sentry ingestion.
// Remove once the first Sentry event is confirmed in the dashboard.
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  if (req.nextUrl.searchParams.get("fire") === "1") {
    throw new Error("Sentry ingestion test — safe to ignore");
  }
  return new Response("Add ?fire=1 to trigger a test error.", {
    headers: { "content-type": "text/plain" },
  });
}
