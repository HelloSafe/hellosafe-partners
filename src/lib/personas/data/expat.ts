import type { PersonaContent } from "../types";

export const EXPAT_FR: PersonaContent = {
  slug: "expat",
  category: "Pour les conseillers expatriation",
  hero: {
    eyebrow: "Pour les conseillers expatriation et longue durée",
    title: "Le panier moyen le plus élevé du voyage, le client le plus fidèle",
    subtitle:
      "Vos clients partent 6, 12, 24 mois. Le panier moyen est de 600 à 2 000 €. Et ils renouvellent. Avec HelloSafe, vous bénéficiez d'une commission qui se cumule contrat après contrat — sans clawback sur les longues durées.",
  },
  pains: [
    {
      title: "Les programmes voyage classiques excluent les longs séjours",
      body: "Au-delà de 90 jours, la plupart des cartes et programmes mono-assureur ne couvrent plus. Vos clients partent avec un trou de couverture béant et ne le savent pas.",
    },
    {
      title: "Les contrats expatriés sont opaques",
      body: "Sécu détachée, CFE, mutuelle internationale, assurance privée — votre client ne sait plus qui rembourse quoi. Vous perdez du temps en pédagogie.",
    },
    {
      title: "Et vous touchez peu",
      body: "Les commissions sur expatriation sont souvent flat à 30 € par dossier. Pour un panier à 1 200 €, c'est dérisoire.",
    },
  ],
  benefits: [
    {
      badge: "Long-stay",
      title: "Contrats jusqu'à 5 ans, renouvelables",
      body: "Pas de plafond de 90 jours. Pas de clawback sur les renouvellements. Le client part 24 mois, vous êtes payé sur 24 mois.",
    },
    {
      badge: "Commission récurrente",
      title: "Vous touchez à chaque renouvellement, à vie",
      body: "Le client renouvelle son contrat ? Vous re-touchez la commission. Construisez un revenu cumulatif sur votre portefeuille.",
    },
    {
      badge: "Coach intégré",
      title: "Argumentez sécu / CFE / mutuelle / privée en 30 secondes",
      body: "L'outil Coach explique au client ce que sa CFE couvre vraiment et où sont les trous. Vous vendez de la clarté, pas du jargon.",
    },
    {
      badge: "Jusqu'à 20 %",
      title: "Sur un panier moyen de 1 200 €, ça change tout",
      body: "240 € par dossier, récurrent. 50 dossiers/an = 12 k€ qui se cumulent à votre activité conseil.",
    },
  ],
  proof: {
    quote:
      "Je vendais l'assurance en service additionnel à 30 € flat. Avec HelloSafe j'en suis à 220 € par dossier en moyenne, et la moitié de mon portefeuille a renouvelé l'an dernier — sans rien faire de plus.",
    author: "Marc T.",
    role: "Conseiller mobilité internationale indépendant",
    metric: "× 7 sur la commission par dossier",
  },
  calc: {
    title: "Le revenu d'un conseiller expat type",
    visitorsLabel: "Dossiers expatriation traités par mois",
    visitorsDefault: 8,
    ctrPct: 100,
    convPct: 70,
    basketEur: 1200,
    commissionPct: 18,
    note: "70 % des dossiers convertissent quand l'assurance est intégrée à la consultation. Récurrence non incluse — multipliez par 1,4 sur 12 mois.",
  },
  cta: {
    primary: "Devenir partenaire conseil",
    secondary: "Voir l'argumentaire CFE",
  },
};

export const EXPAT_EN: PersonaContent = {
  slug: "expat",
  category: "For expatriation advisors",
  hero: {
    eyebrow: "For expatriation and long-stay advisors",
    title: "Highest average basket in travel, the most loyal client",
    subtitle:
      "Your clients leave for 6, 12, 24 months. Average basket: €600 to €2,000. And they renew. With HelloSafe, you build a commission that compounds contract after contract — no clawback on long stays.",
  },
  pains: [
    {
      title: "Standard travel programs exclude long stays",
      body: "Beyond 90 days, most cards and single-insurer programs stop covering. Your clients leave with a coverage gap they don't know about.",
    },
    {
      title: "Expat contracts are opaque",
      body: "Detached social security, CFE, international top-up, private insurance — your client no longer knows who reimburses what. You waste time educating.",
    },
    {
      title: "And you barely get paid",
      body: "Expatriation commissions are often flat at €30 per booking. For a €1,200 basket, that's nothing.",
    },
  ],
  benefits: [
    {
      badge: "Long-stay",
      title: "Contracts up to 5 years, renewable",
      body: "No 90-day ceiling. No clawback on renewals. Client leaves for 24 months, you're paid over 24 months.",
    },
    {
      badge: "Recurring commission",
      title: "You earn on every renewal, for life",
      body: "Client renews their contract? You earn the commission again. Build cumulative revenue across your portfolio.",
    },
    {
      badge: "Built-in Coach",
      title: "Argue social-security / CFE / top-up / private in 30 seconds",
      body: "The Coach tool explains what your client's CFE actually covers and where the gaps are. You sell clarity, not jargon.",
    },
    {
      badge: "Up to 20%",
      title: "On a €1,200 average basket, it changes everything",
      body: "€240 per booking, recurring. 50 bookings/year = €12k stacked on top of your consulting fees.",
    },
  ],
  proof: {
    quote:
      "I used to sell insurance as an add-on at €30 flat. With HelloSafe I'm at €220 per booking on average, and half my portfolio renewed last year — without doing anything extra.",
    author: "Marc T.",
    role: "Independent international mobility advisor",
    metric: "× 7 commission per booking",
  },
  calc: {
    title: "What a typical expat advisor earns",
    visitorsLabel: "Expatriation cases per month",
    visitorsDefault: 8,
    ctrPct: 100,
    convPct: 70,
    basketEur: 1200,
    commissionPct: 18,
    note: "70% of cases convert when insurance is integrated into the consultation. Recurrence not included — multiply by 1.4 over 12 months.",
  },
  cta: { primary: "Become an advisor partner", secondary: "See the CFE talking points" },
};
