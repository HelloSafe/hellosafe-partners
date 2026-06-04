// Deliberately `middleware.ts`, NOT `proxy.ts`. Next 16 renamed this
// convention to `proxy` and pinned `proxy.ts` to the Node.js runtime (the
// `runtime` option throws there). OpenNext on Cloudflare Workers only
// supports EDGE middleware, so we keep the legacy `middleware` convention,
// which still runs on the edge runtime. Do NOT run the `middleware-to-proxy`
// codemod — it would force the Node runtime and break the Workers build.
import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intl = createMiddleware(routing);

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // FR-only validation phase: redirect any legacy /en/* link to the FR root.
  // Once EN is re-enabled, this branch can be removed.
  if (pathname === "/en" || pathname.startsWith("/en/")) {
    const url = req.nextUrl.clone();
    url.pathname = pathname === "/en" ? "/" : pathname.replace(/^\/en/, "");
    return NextResponse.redirect(url, 307);
  }

  return intl(req);
}

export const config = {
  // Skip locale handling for:
  // - api routes
  // - Next.js internals (_next, _vercel)
  // - the tracked-link redirect /r/*
  // - the embeddable widget routes /widget/*
  // - the Sentry tunnel route /monitoring
  // - any asset with a dot (images, .svg, favicon, etc.)
  matcher: ["/((?!api|_next|_vercel|r/|widget|monitoring|.*\\..*).*)"],
};
