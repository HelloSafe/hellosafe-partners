import type { PersonaContent } from "../types";

export const BLOG_FR: PersonaContent = {
  slug: "blog",
  category: "Pour les éditeurs",
  hero: {
    eyebrow: "Pour les blogs voyage",
    title: "Transformez vos articles evergreen en revenu récurrent",
    subtitle:
      "Vous écrivez un guide PVT Canada, un comparatif Schengen, un dossier ski. Il rank sur Google, mais passé le mois de publication, il vous rapporte zéro. HelloSafe transforme chaque article en machine à commissions, mois après mois.",
  },
  pains: [
    {
      title: "Vos articles travaillent pour Google, pas pour vous",
      body: "Trafic stable, monétisation aléatoire. Les bannières AdSense paient 4 à 9 € le mille. Vous laissez 90 % de la valeur sur la table.",
    },
    {
      title: "Les programmes mono-assureur convertissent mal",
      body: "Vos lecteurs comparent avant d'acheter. Quand vous ne leur proposez qu'un contrat, ils ouvrent un onglet, comparent ailleurs, et la vente se fait sans vous.",
    },
    {
      title: "Distribuer une assurance demande un cadre légal lourd",
      body: "En France comme à l'étranger, distribuer une assurance impose registres, formations continues et licences pays par pays. Hors d'atteinte pour un blogueur indépendant qui veut simplement orienter ses lecteurs.",
    },
  ],
  benefits: [
    {
      badge: "Conversion",
      title: "Une marketplace, pas un revendeur",
      body: "Le lecteur compare en temps réel et souscrit dans la foulée. 10,8 % de conversion devis → vente, 3× les programmes mono-produit.",
    },
    {
      badge: "Revenu récurrent",
      title: "Cookie 90 jours + commission sur renouvellement",
      body: "Un article sur le PVT Canada vous paie pendant 12 à 24 mois. Pas de one-shot, du cumul.",
    },
    {
      badge: "Sub-ID par article",
      title: "Vous savez quel article fait quoi",
      body: "Un Sub-ID par contenu, granularité totale dans le dashboard. Ce qui marche, vous le doublez. Paiement chaque mois, sans seuil minimum.",
    },
    {
      badge: "Conformité distribuée",
      title: "Vous distribuez sous notre cadre réglementaire",
      body: "HelloSafe porte la conformité de la distribution d'assurance en France, Royaume-Uni, Australie, États-Unis et Canada. Vous concentrez votre énergie sur l'éditorial, pas sur les démarches administratives.",
    },
  ],
  proof: {
    quote:
      "Mon guide PVT Canada écrit en 2024 me rapporte aujourd'hui plus que toutes mes bannières AdSense combinées. Et chaque mois, le revenu monte avec les renouvellements.",
    author: "Sarah L.",
    role: "Blog voyage indépendante, 45k visites/mois",
    metric: "+18 % RPV vs ancien programme",
  },
  calc: {
    title: "Combien rapporte un article comme le vôtre",
    visitorsLabel: "Visites mensuelles sur l'article",
    visitorsDefault: 8000,
    ctrPct: 4,
    convPct: 10.8,
    basketEur: 79,
    commissionPct: 15,
    note: "Estimation basée sur les médianes du réseau HelloSafe en avril 2026.",
  },
  cta: {
    primary: "Créer mon compte blogueur",
    secondary: "Voir comment ça marche",
  },
};

export const BLOG_EN: PersonaContent = {
  slug: "blog",
  category: "For publishers",
  hero: {
    eyebrow: "For travel blogs",
    title: "Turn your evergreen articles into recurring revenue",
    subtitle:
      "You wrote a guide on Canada working holiday visas, a Schengen comparison, a ski-trip dossier. It ranks on Google but stops paying you the month after publication. HelloSafe turns each article into a commissions machine, month after month.",
  },
  pains: [
    {
      title: "Your articles work for Google, not for you",
      body: "Stable traffic, random monetization. AdSense banners pay €4–9 CPM. You're leaving 90% of the value on the table.",
    },
    {
      title: "Single-insurer programs convert poorly",
      body: "Your readers compare before buying. When you only show one contract, they open another tab, compare elsewhere, and the sale happens without you.",
    },
    {
      title: "No bandwidth to juggle 5 affiliate platforms",
      body: "You want to write, not switch between Impact, CJ and three dashboards that don't talk to each other.",
    },
  ],
  benefits: [
    {
      badge: "Conversion",
      title: "A marketplace, not a reseller",
      body: "Reader compares in real time and subscribes on the spot. 10.8% quote → sale conversion, 3× single-product programs.",
    },
    {
      badge: "Recurring revenue",
      title: "90-day cookie + commission on renewal",
      body: "An article on Canada working holiday pays you for 12 to 24 months. No one-shot, just compounding.",
    },
    {
      badge: "Sub-ID per article",
      title: "You know which article does what",
      body: "One Sub-ID per piece, full granularity in the dashboard. What works, you double down on.",
    },
    {
      badge: "No threshold",
      title: "Paid every month, no minimum",
      body: "€10, €1,000 or €50,000: payout on the 15th. No $250 threshold like US programs.",
    },
  ],
  proof: {
    quote:
      "My 2024 Canada working holiday guide pays me more today than all my AdSense banners combined. And the revenue grows every month with renewals.",
    author: "Sarah L.",
    role: "Independent travel blog, 45k visits/month",
    metric: "+18% RPV vs old program",
  },
  calc: {
    title: "What an article like yours can earn",
    visitorsLabel: "Monthly visits on the article",
    visitorsDefault: 8000,
    ctrPct: 4,
    convPct: 10.8,
    basketEur: 79,
    commissionPct: 15,
    note: "Estimate based on HelloSafe network medians, April 2026.",
  },
  cta: {
    primary: "Create my blogger account",
    secondary: "See how it works",
  },
};
