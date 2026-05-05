/** Personas the partner can self-declare during onboarding. */
export const VALID_PERSONAS = [
  "blog",
  "agency",
  "visa",
  "creator",
  "student",
  "other",
] as const;

export type Persona = (typeof VALID_PERSONAS)[number];
