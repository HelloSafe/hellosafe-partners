/** Canonical absolute URL of the app, no trailing slash. */
export function appUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    "http://localhost:3000"
  );
}
