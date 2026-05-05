/**
 * Persona definitions for the onboarding wizard. Drives:
 *  - the cards shown in Step1
 *  - the first-action redirect at finish
 *  - the suggestion copy in Step3
 */

export type Persona =
  | "blog"
  | "agency"
  | "visa"
  | "creator"
  | "student"
  | "other";

export type PersonaCard = {
  id: Persona;
  label: string;
  sub: string;
  icon: string;
};

export const PERSONAS_FR: PersonaCard[] = [
  { id: "blog", label: "Blog voyage", sub: "Articles, guides, SEO", icon: "✍️" },
  { id: "agency", label: "Agence de voyage", sub: "Bureau, OTA, distribution", icon: "🏢" },
  { id: "visa", label: "Spécialiste visa", sub: "Comparateur, immigration", icon: "🛂" },
  { id: "creator", label: "Créateur·rice", sub: "Instagram, YouTube, TikTok", icon: "📸" },
  { id: "student", label: "Mobilité étudiante", sub: "PVT, études, séjours", icon: "🎓" },
  { id: "other", label: "Autre", sub: "Vous nous direz", icon: "✨" },
];

export const PERSONAS_EN: PersonaCard[] = [
  { id: "blog", label: "Travel blog", sub: "Articles, guides, SEO", icon: "✍️" },
  { id: "agency", label: "Travel agency", sub: "Storefront, OTA, distribution", icon: "🏢" },
  { id: "visa", label: "Visa specialist", sub: "Comparator, immigration", icon: "🛂" },
  { id: "creator", label: "Creator", sub: "Instagram, YouTube, TikTok", icon: "📸" },
  { id: "student", label: "Student mobility", sub: "Working holiday, study", icon: "🎓" },
  { id: "other", label: "Other", sub: "Tell us later", icon: "✨" },
];

/** Send the user to the most relevant first action by persona. */
export function personaFirstAction(p: Persona | null): string {
  if (!p) return "/dashboard";
  switch (p) {
    case "agency":
    case "student":
      return "/dashboard/coach/new";
    case "blog":
    case "creator":
    case "visa":
    case "other":
    default:
      return "/dashboard/links";
  }
}

/** Recommendation copy shown on Step 3 ("first move"). */
export function personaSuggestion(p: Persona | null, isEn: boolean) {
  switch (p) {
    case "agency":
    case "student":
      return {
        title: isEn
          ? "Run your first Coach analysis in 90 seconds"
          : "Lancez votre première analyse Coach en 90 secondes",
        body: isEn
          ? "Show a client what their card insurance, top-up and social security really cover, then where Atlas closes the gap. The output is brandable to your colors."
          : "Montrez à un client ce que sa carte, sa mutuelle et sa sécu couvrent vraiment, et où Atlas ferme le trou. Le récap est aux couleurs de votre marque.",
      };
    case "blog":
    case "creator":
      return {
        title: isEn
          ? "Generate your first tracked link"
          : "Générez votre premier lien traqué",
        body: isEn
          ? "Pick a destination page, add a Sub-ID for your article or story, and we hand you a link with 90-day attribution and recurring commission baked in."
          : "Choisissez une page de destination, ajoutez un Sub-ID pour votre article ou story, et nous vous remettons un lien avec attribution 90 jours et commission récurrente.",
      };
    case "visa":
      return {
        title: isEn
          ? "Plug Atlas into your visa funnel"
          : "Branchez Atlas sur votre funnel visa",
        body: isEn
          ? "Generate a link to the right visa-ready page (Schengen, working holiday, student) and have your visitors leave with a compliant certificate within 90 seconds."
          : "Générez un lien vers la bonne page visa-ready (Schengen, PVT, étudiant) et faites repartir vos visiteurs avec une attestation conforme en 90 secondes.",
      };
    default:
      return {
        title: isEn
          ? "Pick your tool — Atlas adapts to your workflow"
          : "Choisissez votre outil, Atlas s'adapte à votre flux",
        body: isEn
          ? "Tracked links, Coach, contracts, payouts: every tool is unlocked from day one."
          : "Liens traqués, Coach, contrats, paiements : tous les outils sont débloqués dès le premier jour.",
      };
  }
}
