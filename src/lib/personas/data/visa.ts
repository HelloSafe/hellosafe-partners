import type { PersonaContent } from "../types";

export const VISA_FR: PersonaContent = {
  slug: "visa",
  category: "Pour les spécialistes visa",
  hero: {
    eyebrow: "Pour les comparateurs visa et spécialistes immigration",
    title: "L'attestation visa délivrée en 90 secondes, à vos couleurs",
    subtitle:
      "Schengen exige 30 000 € de couverture, le PVT Canada en exige 100 000 €, l'Australie demande des plafonds illimités. Vos visiteurs sont prêts à acheter, vite. HelloSafe leur sert un certificat conforme avant qu'ils aient fini de saisir leur formulaire visa.",
  },
  pains: [
    {
      title: "Vos visiteurs achètent leur assurance en panique 48 h avant le rendez-vous au consulat",
      body: "Cette panique convertit. Mais elle convertit ailleurs si vous n'avez pas un parcours vraiment fluide.",
    },
    {
      title: "Une attestation refusée par le consulat = un dossier repoussé d'un mois",
      body: "Les services consulaires contrôlent les montants, la formulation, la zone géographique, la validité. Une attestation imprécise et le rendez-vous suivant tombe parfois un mois plus tard. Le visiteur revient vers vous, déçu et pressé.",
    },
    {
      title: "La distribution d'assurance est verrouillée par un cadre réglementaire lourd",
      body: "Inscription à un registre national, formation continue, licences pays par pays au Royaume-Uni, en Australie ou aux États-Unis : un comparateur visa indépendant ne peut pas porter cette charge seul.",
    },
  ],
  benefits: [
    {
      badge: "Conformité consulaire",
      title: "Attestations en lien direct avec les consulats",
      body: "HelloSafe maintient une relation suivie avec les consulats qui imposent une attestation d'assurance. Nos formats sont pré-validés (Schengen, Canada IEC, Australie WHV, États-Unis J-1, Inde, Thaïlande, Russie) et mis à jour à chaque évolution réglementaire.",
    },
    {
      badge: "Délai 90 secondes",
      title: "Le PDF arrive avant la fin du formulaire visa",
      body: "Souscription, paiement, certificat envoyé : 90 secondes médian. Vos visiteurs ne décrochent pas.",
    },
    {
      badge: "API + widget",
      title: "Intégration en moins d'une heure",
      body: "API REST claire, widget natif aux couleurs de votre site. Pas d'iframe bloquée, pas de redirection brutale. Postback S2S compatible Voluum, RedTrack, Impact, Partnerize.",
    },
    {
      badge: "Conformité distribuée",
      title: "Vous distribuez sous notre cadre réglementaire",
      body: "HelloSafe porte la conformité de la distribution d'assurance en France, Royaume-Uni, Australie, États-Unis et Canada. Vous concentrez votre énergie sur l'éditorial et la conversion, sans démarches administratives à mener de votre côté.",
    },
  ],
  proof: {
    quote:
      "L'API est propre, la doc est honnête, et l'équipe répond en moins d'une heure. On a remplacé notre ancien programme en 4 heures de dev. Ça ne nous est jamais arrivé.",
    author: "Romain D.",
    role: "Comparateur visa, CTO",
    metric: "< 4 h pour intégrer",
  },
  calc: {
    title: "Le revenu d'un comparateur visa moyen",
    visitorsLabel: "Visiteurs uniques mensuels intéressés par un visa",
    visitorsDefault: 60000,
    ctrPct: 6,
    convPct: 12,
    basketEur: 95,
    commissionPct: 18,
    note: "Visitors visa ont une intention d'achat très forte. Conversion observée 1,5× vs trafic général voyage.",
  },
  cta: {
    primary: "Créer mon compte partenaire",
    secondary: "Lire la doc API",
  },
};

export const VISA_EN: PersonaContent = {
  slug: "visa",
  category: "For visa specialists",
  hero: {
    eyebrow: "For visa comparators and immigration specialists",
    title: "Visa-ready certificate in 90 seconds, in your colors",
    subtitle:
      "Schengen requires €30,000 of coverage, Canada working holiday requires €100,000, Australia demands unlimited limits. Your visitors are ready to buy, fast. HelloSafe delivers a compliant certificate before they're done filling the visa form.",
  },
  pains: [
    {
      title: "Your visitors buy insurance in panic 48h before the consulate",
      body: "That panic converts. But it converts elsewhere if you don't have a truly fluid funnel.",
    },
    {
      title: "Single-insurer programs don't cover every visa type",
      body: "Schengen, working holiday, student, long-stay — requirements change. One contract is not enough.",
    },
    {
      title: "Custom integration takes 2 months",
      body: "You want to move fast. Pulling a developer to wire a comparator doesn't fit your roadmap.",
    },
  ],
  benefits: [
    {
      badge: "Visa-ready",
      title: "Compliant with every embassy",
      body: "Schengen, US J-1, Canada IEC, Australia WHV, India, Thailand — one funnel, one link, the certificate is accepted everywhere.",
    },
    {
      badge: "90-second SLA",
      title: "PDF arrives before the visa form is done",
      body: "Subscription, payment, certificate sent: 90 seconds median. Your visitors don't drop off.",
    },
    {
      badge: "API + widget",
      title: "Integrated in under an hour",
      body: "Clean REST API, native widget in your colors. No blocked iframe, no harsh redirect.",
    },
    {
      badge: "Postback",
      title: "Compatible with your tracking stack",
      body: "S2S to Voluum, RedTrack, Everflow, Impact, Partnerize. End-to-end attribution stays yours.",
    },
  ],
  proof: {
    quote:
      "The API is clean, the docs are honest, the team replies in under an hour. We replaced our old program in 4 hours of dev. That never happened to us before.",
    author: "Romain D.",
    role: "Visa comparator, CTO",
    metric: "< 4 h to integrate",
  },
  calc: {
    title: "Average visa comparator revenue",
    visitorsLabel: "Monthly unique visitors interested in a visa",
    visitorsDefault: 60000,
    ctrPct: 6,
    convPct: 12,
    basketEur: 95,
    commissionPct: 18,
    note: "Visa visitors carry very high intent. Conversion seen: 1.5× general travel traffic.",
  },
  cta: { primary: "Create my partner account", secondary: "Read API docs" },
};
