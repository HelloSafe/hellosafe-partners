export type PersonaSlug = "blog" | "agency" | "visa" | "creator";

export type Locale = "fr" | "en";

export type PersonaContent = {
  slug: PersonaSlug;
  category: string;
  hero: { eyebrow: string; title: string; subtitle: string };
  pains: { title: string; body: string }[];
  benefits: { badge: string; title: string; body: string }[];
  proof: { quote: string; author: string; role: string; metric: string };
  calc: {
    title: string;
    visitorsLabel: string;
    visitorsDefault: number;
    ctrPct: number;
    convPct: number;
    basketEur: number;
    commissionPct: number;
    note: string;
  };
  cta: { primary: string; secondary: string };
};

export const PERSONA_SLUGS: PersonaSlug[] = ["blog", "agency", "visa", "creator"];
