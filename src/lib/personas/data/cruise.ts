import type { PersonaContent } from "../types";

export const CRUISE_FR: PersonaContent = {
  slug: "cruise",
  category: "Pour les croisières et voyages haut de gamme",
  hero: {
    eyebrow: "Pour les croisières, voyages de luxe et groupes",
    title: "Annulation à 100 %, bagages 5 000 €, RC 4,5 millions — pour des paniers à 8 000 €",
    subtitle:
      "Vos clients partent en croisière, en safari, en circuit haut de gamme. Le moindre imprévu — covid d'un parent, deuil, accident à J-3 — fait perdre 10 000 € à votre client si l'assurance est mal calibrée. Et il vous en voudra. HelloSafe ferme le risque sans alourdir le devis.",
  },
  pains: [
    {
      title: "Sur un panier à 8 000 €, l'annulation à 50 % ne suffit plus",
      body: "Vos clients ont peur de perdre des sommes importantes. Une assurance à 200 € de prime qui couvre 100 % du panier, c'est une évidence — encore faut-il qu'on la leur présente.",
    },
    {
      title: "Le client ne lit pas son contrat carte",
      body: "Visa Premium plafonne souvent l'annulation à 5 000 € par voyage. Au-delà, pas couvert. Le client ne le réalise qu'au moment du sinistre.",
    },
    {
      title: "Les contrats croisière proposés par les compagnies sont chers et standards",
      body: "20 à 30 % du devis pour une assurance qui exclut la moitié des cas. Vous pouvez faire mieux que ça pour votre client.",
    },
  ],
  benefits: [
    {
      badge: "Annulation 100 %",
      title: "Plafond ajusté au panier réel",
      body: "Croisière à 8 000 €, circuit Afrique à 12 000 € — l'assurance HelloSafe couvre la totalité, sans plafond bête.",
    },
    {
      badge: "Toutes causes",
      title: "Toutes causes justifiées : covid, deuil, accident, professionnelle",
      body: "Pas d'exclusion sournoise. La causes-toutes-causes existe pour les paniers premium.",
    },
    {
      badge: "Compagnons",
      title: "Conjoint, concubin, enfants tous âges, parents",
      body: "Pas de clause discriminante \"concubin non marié exclu\" comme la plupart des cartes. Le client part en groupe, vous protégez le groupe.",
    },
    {
      badge: "20 % de commission",
      title: "Sur un panier à 8 000 €, c'est sérieux",
      body: "240 à 480 € de commission par dossier croisière. Et c'est récurrent.",
    },
  ],
  proof: {
    quote:
      "Sur les croisières et les voyages premium, le client ne discute plus le prix de l'assurance quand on lui montre le Coach. Il signe. Et il revient l'année suivante.",
    author: "Caroline B.",
    role: "Agence de voyages haut de gamme",
    metric: "Panier moyen × 1,8 vs avant",
  },
  calc: {
    title: "Le potentiel sur un portefeuille croisière",
    visitorsLabel: "Dossiers croisière / luxe par mois",
    visitorsDefault: 20,
    ctrPct: 100,
    convPct: 60,
    basketEur: 280,
    commissionPct: 20,
    note: "Panier moyen assurance croisière haut de gamme : 200 à 350 € de prime. Hypothèse médiane.",
  },
  cta: {
    primary: "Devenir partenaire croisière",
    secondary: "Voir le Coach",
  },
};

export const CRUISE_EN: PersonaContent = {
  slug: "cruise",
  category: "For cruise and luxury travel",
  hero: {
    eyebrow: "For cruises, luxury travel and groups",
    title: "100% cancellation, €5,000 baggage, €4.5M liability — for €8,000 baskets",
    subtitle:
      "Your clients book cruises, safaris, premium itineraries. The smallest hiccup — a parent's covid, bereavement, accident at D-3 — costs your client €10,000 if the insurance is miscalibrated. And they'll blame you. HelloSafe closes the risk without bloating the quote.",
  },
  pains: [
    {
      title: "On a €8,000 basket, 50% cancellation isn't enough",
      body: "Your clients fear losing big sums. €200 of premium covering 100% of the basket is a no-brainer — provided someone shows it to them.",
    },
    {
      title: "Clients don't read their card contract",
      body: "Visa Premium often caps cancellation at €5,000 per trip. Above that, no coverage. Clients only realize when the claim hits.",
    },
    {
      title: "Cruise-line insurance is overpriced and standard",
      body: "20–30% of the quote for insurance that excludes half the cases. You can do better for your client.",
    },
  ],
  benefits: [
    {
      badge: "100% cancellation",
      title: "Limit matched to the actual basket",
      body: "€8,000 cruise, €12,000 Africa circuit — HelloSafe insurance covers it all, no stupid cap.",
    },
    {
      badge: "All causes",
      title: "All justified causes: covid, bereavement, accident, work-related",
      body: "No sneaky exclusions. The all-causes guarantee exists for premium baskets.",
    },
    {
      badge: "Companions",
      title: "Spouse, partner, all-age children, parents",
      body: "No sneaky \"unmarried partner excluded\" clause like most cards. Your client travels in a group, you protect the group.",
    },
    {
      badge: "20% commission",
      title: "On an €8,000 basket, it adds up",
      body: "€240 to €480 per cruise booking. And it's recurring.",
    },
  ],
  proof: {
    quote:
      "On cruises and premium trips, the client no longer haggles over the insurance price when we show the Coach. They sign. And they come back the next year.",
    author: "Caroline B.",
    role: "Premium travel agency",
    metric: "Avg basket × 1.8 vs before",
  },
  calc: {
    title: "Cruise portfolio potential",
    visitorsLabel: "Cruise / luxury bookings per month",
    visitorsDefault: 20,
    ctrPct: 100,
    convPct: 60,
    basketEur: 280,
    commissionPct: 20,
    note: "Premium cruise insurance basket: €200–350 in premium. Median assumption.",
  },
  cta: { primary: "Become a cruise partner", secondary: "See the Coach" },
};
