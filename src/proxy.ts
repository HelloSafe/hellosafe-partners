import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Skip locale handling for:
  // - api routes
  // - Next.js internals (_next, _vercel)
  // - the tracked-link redirect /r/*
  // - the Sentry tunnel route /monitoring
  // - any asset with a dot (images, .svg, favicon, etc.)
  matcher: ["/((?!api|_next|_vercel|r/|monitoring|.*\\..*).*)"],
};
