import type { PersonaContent } from "../types";

export const AGENCY_FR: PersonaContent = {
  slug: "agency",
  category: "Pour les agences",
  hero: {
    eyebrow: "Pour les agences de voyage",
    title: "L'argument qui fait dire oui au client à la fin du RDV",
    subtitle:
      "Vos commerciaux vendent l'assurance en cochant une case en fin de devis — quand ils ont le temps. C'est 200 € par dossier qui partent à la concurrence. Le Coach HelloSafe rééquilibre la conversation et présente, en 30 secondes, ce qui manque dans la couverture actuelle du client.",
  },
  pains: [
    {
      title: "L'assurance, c'est la dernière ligne du devis",
      body: "Vos commerciaux n'ont ni le temps, ni les arguments. Le client coche \"je suis déjà couvert par ma carte\" et la vente passe.",
    },
    {
      title: "Vous ne savez pas vraiment ce que la carte de votre client couvre",
      body: "Visa Premier, World Elite, Revolut Metal — chaque carte a 18 garanties différentes, des plafonds différents, des exclusions cachées. Personne ne lit les CGV en RDV.",
    },
    {
      title: "Votre contrat agence est moins bien présenté que celui d'un comparateur en ligne",
      body: "Vos clients voient des slides PDF qui datent. Les comparateurs leur servent une UX 2026. Le déséquilibre est commercial, pas qualitatif.",
    },
  ],
  benefits: [
    {
      badge: "Coach de vente",
      title: "L'outil qui démontre les écarts en 30 secondes",
      body: "Le commercial saisit la carte du client + sa mutuelle + le pays de départ + son propre contrat agence — l'outil sort une page client-ready avec les trous, en rouge, et la recommandation à droite.",
    },
    {
      badge: "Blanc d'agence",
      title: "Logo, couleurs, nom commercial : tout est à vous",
      body: "Le récap remis au client porte votre marque. HelloSafe disparaît visuellement. C'est votre conseil, pas notre publicité.",
    },
    {
      badge: "Panier × 1,4",
      title: "Un client mieux conseillé prend la formule premium",
      body: "Sur les agences de notre réseau, le panier moyen monte de 79 € à 110 € quand le commercial utilise le Coach. Le client comprend ce qu'il achète.",
    },
    {
      badge: "Commission jusqu'à 20 %",
      title: "Et c'est récurrent",
      body: "Le client part en croisière chaque année ? Vous touchez à chaque renouvellement. Sans rien faire de plus.",
    },
  ],
  proof: {
    quote:
      "On a déployé le Coach sur les 12 agences en 3 semaines. Le commercial type vend maintenant l'assurance dans 7 dossiers sur 10, contre 3 avant. Ça change le compte de résultat.",
    author: "Voyages Marquis",
    role: "Réseau d'agences, 12 points de vente, 28 commerciaux",
    metric: "+180 k€ revenu annuel",
  },
  calc: {
    title: "Combien votre réseau peut générer en plus",
    visitorsLabel: "Dossiers voyage par mois (tous commerciaux)",
    visitorsDefault: 400,
    ctrPct: 100,
    convPct: 35,
    basketEur: 110,
    commissionPct: 18,
    note: "Hypothèse : 35 % des dossiers convertissent en vente d'assurance avec le Coach (vs 12 % sans, médiane réseau).",
  },
  cta: {
    primary: "Demander une démo Coach",
    secondary: "Voir l'outil",
  },
};

export const AGENCY_EN: PersonaContent = {
  slug: "agency",
  category: "For agencies",
  hero: {
    eyebrow: "For travel agencies",
    title: "The argument that gets the client to say yes at the end of the meeting",
    subtitle:
      "Your sales reps sell insurance by ticking a checkbox at the end of the quote — when they have time. That's €200 per booking walking out the door. The HelloSafe Coach rebalances the conversation and shows, in 30 seconds, what's missing in the client's current coverage.",
  },
  pains: [
    {
      title: "Insurance is the last line of the quote",
      body: "Your reps have neither the time nor the arguments. The client says \"I'm covered by my card\" and the sale is gone.",
    },
    {
      title: "You don't really know what your client's card covers",
      body: "Visa Premier, World Elite, Revolut Metal — each card has 18 different guarantees, different limits, hidden exclusions. Nobody reads the T&C in a meeting.",
    },
    {
      title: "Your in-house contract is presented worse than an online comparator's",
      body: "Your clients see dated PDF slides. Comparators serve them a 2026 UX. The imbalance is commercial, not qualitative.",
    },
  ],
  benefits: [
    {
      badge: "Sales coach",
      title: "The tool that demonstrates gaps in 30 seconds",
      body: "The rep enters the client's card + their top-up + departure country + your own agency contract — the tool outputs a client-ready page with the gaps in red, and the recommendation on the right.",
    },
    {
      badge: "Agency white-label",
      title: "Logo, colors, brand name: all yours",
      body: "The recap handed to the client carries your brand. HelloSafe disappears visually. It's your advice, not our ad.",
    },
    {
      badge: "Basket × 1.4",
      title: "A better-advised client picks the premium tier",
      body: "Across our network's agencies, the average basket goes from €79 to €110 when the rep uses the Coach. The client understands what they're buying.",
    },
    {
      badge: "Commission up to 20%",
      title: "And it's recurring",
      body: "Client cruises every year? You earn on every renewal. Without doing anything more.",
    },
  ],
  proof: {
    quote:
      "We deployed the Coach across all 12 agencies in 3 weeks. The typical rep now sells insurance on 7 out of 10 bookings, vs 3 before. That changes the P&L.",
    author: "Voyages Marquis",
    role: "Agency network, 12 stores, 28 reps",
    metric: "+€180k annual revenue",
  },
  calc: {
    title: "What your network can generate on top",
    visitorsLabel: "Travel bookings per month (all reps)",
    visitorsDefault: 400,
    ctrPct: 100,
    convPct: 35,
    basketEur: 110,
    commissionPct: 18,
    note: "Assumption: 35% of bookings convert into an insurance sale with the Coach (vs 12% without, network median).",
  },
  cta: { primary: "Request a Coach demo", secondary: "See the tool" },
};
