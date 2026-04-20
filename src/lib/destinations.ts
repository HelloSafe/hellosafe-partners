export const DESTINATIONS = [
  "home",
  "travel",
  "schengen",
  "pvt",
  "longterm",
  "ski",
  "student",
] as const;

export type DestinationKey = (typeof DESTINATIONS)[number];

export const DESTINATION_SLUGS: Record<DestinationKey, string> = {
  home: "/",
  travel: "/travel-insurance",
  schengen: "/travel-insurance/schengen-visa",
  pvt: "/travel-insurance/working-holiday",
  longterm: "/travel-insurance/long-stay",
  ski: "/travel-insurance/ski",
  student: "/travel-insurance/student",
};

export function isDestination(v: unknown): v is DestinationKey {
  return typeof v === "string" && (DESTINATIONS as readonly string[]).includes(v);
}

/** Final URL on hellosafe.com that the /r redirect points to. */
export function buildHelloSafeUrl(params: {
  destination: DestinationKey;
  language: string;
  partnerCode: string;
  shortCode: string;
  campaign?: string;
  subId?: string;
  subIdOverride?: string;
}) {
  const slug = DESTINATION_SLUGS[params.destination];
  const ref = `${params.partnerCode}-${params.shortCode}`;
  const sp = new URLSearchParams({
    ref,
    utm_source: "hellosafe-partners",
    utm_medium: "affiliate",
    utm_campaign: params.campaign || "direct",
  });
  const sub = params.subIdOverride || params.subId;
  if (sub) sp.set("subid", sub);
  return `https://hellosafe.com/${params.language}${slug}?${sp.toString()}`;
}
