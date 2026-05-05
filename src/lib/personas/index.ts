/**
 * Public surface of the personas module. Mirrors the original
 * `src/lib/personas.ts` so existing imports `from "@/lib/personas"`
 * keep working unchanged.
 */

export type { PersonaSlug, Locale, PersonaContent } from "./types";
export { PERSONA_SLUGS } from "./types";
export { PERSONAS } from "./data";

import type { Locale, PersonaSlug } from "./types";
import { PERSONAS } from "./data";

export function getPersona(locale: string, slug: PersonaSlug) {
  const l: Locale = locale === "en" ? "en" : "fr";
  return PERSONAS[l][slug];
}
