/**
 * ISO 3166-1 alpha-2 country list, restricted to the destinations actually
 * sold by travel insurance products. Names come from Intl.DisplayNames at
 * runtime so they're locale-aware. Flags via flagcdn.com.
 *
 * Excluded: dependencies / micro-territories that don't appear on the
 * HelloSafe public app dropdown (kept the list small to keep the search
 * snappy).
 */

export const COUNTRY_CODES = [
  "AF", "ZA", "AL", "DZ", "DE", "AD", "AO", "AI", "AG", "SA", "AR", "AM",
  "AW", "AU", "AT", "AZ", "BS", "BH", "BD", "BB", "BE", "BZ", "BJ", "BM",
  "BT", "BY", "BO", "BA", "BW", "BR", "BN", "BG", "BF", "BI", "KH", "CM",
  "CA", "CV", "CL", "CN", "CY", "CO", "KM", "CG", "CD", "KP", "KR", "CR",
  "CI", "HR", "CU", "CW", "DK", "DJ", "DM", "DO", "EG", "SV", "AE", "EC",
  "ER", "ES", "EE", "US", "ET", "FJ", "FI", "FR", "GA", "GM", "GE", "GH",
  "GI", "GR", "GD", "GL", "GP", "GU", "GT", "GG", "GN", "GW", "GQ", "GY",
  "GF", "HT", "HN", "HK", "HU", "BV", "IM", "JE", "VG", "VI", "FK", "FO",
  "MH", "PN", "SB", "TC", "IN", "ID", "IR", "IQ", "IE", "IS", "IL", "IT",
  "JM", "JP", "JO", "KZ", "KE", "KG", "KI", "KW", "RE", "LA", "LS", "LV",
  "LB", "LR", "LY", "LI", "LT", "LU", "MO", "MK", "MG", "MY", "MW", "MV",
  "ML", "MT", "MA", "MQ", "MU", "MR", "YT", "MX", "FM", "MD", "MC", "MN",
  "ME", "MS", "MZ", "MM", "NA", "NR", "NP", "NI", "NE", "NG", "NU", "NO",
  "NC", "NZ", "OM", "UG", "UZ", "PK", "PW", "PS", "PA", "PG", "PY", "NL",
  "BQ", "PE", "PH", "PL", "PF", "PR", "PT", "QA", "CF", "RO", "GB", "RU",
  "RW", "EH", "KN", "SM", "PM", "VC", "SH", "LC", "SV", "WS", "ST", "SN",
  "RS", "SC", "SL", "SG", "SX", "SK", "SI", "SO", "SD", "SS", "LK", "SE",
  "CH", "SR", "SJ", "SZ", "SY", "TJ", "TW", "TZ", "TD", "CZ", "TF", "TH",
  "TL", "TG", "TK", "TO", "TT", "TN", "TM", "TR", "TV", "UA", "UY", "VU",
  "VA", "VE", "VN", "WF", "YE", "ZM", "ZW",
] as const;

export type CountryCode = (typeof COUNTRY_CODES)[number];

export type Country = { code: string; name: string };

/**
 * Builds the localized country list. Calls Intl.DisplayNames at runtime
 * so it's always in the right language without a translation file per
 * locale.
 */
export function listCountries(locale: string = "fr"): Country[] {
  const dn = new Intl.DisplayNames([locale], { type: "region" });
  return COUNTRY_CODES.map((code) => ({ code, name: dn.of(code) ?? code }))
    .sort((a, b) => a.name.localeCompare(b.name, locale));
}

/** URL of the flag SVG for a given ISO alpha-2 code. */
export function flagUrl(code: string, kind: "svg" | "w40" = "w40"): string {
  const c = code.toLowerCase();
  if (kind === "svg") return `https://flagcdn.com/${c}.svg`;
  return `https://flagcdn.com/w40/${c}.png`;
}
