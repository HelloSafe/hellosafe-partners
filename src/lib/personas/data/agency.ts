import type { PersonaContent } from "../types";

export const AGENCY_FR: PersonaContent = {
  slug: "agency",
  category: "Pour les agences de voyage",
  hero: {
    eyebrow: "Pour les agences de voyage et les OTA",
    title: "Monétisez l'assurance voyage que vos clients vous réclament déjà",
    subtitle:
      "« Et pour l'assurance, je fais comment ? » Vos clients posent la question à chaque réservation. Aujourd'hui vous renvoyez vers leur banque ou un comparateur, et la commission part ailleurs. Avec HelloSafe, vous partagez un lien, votre client souscrit en ligne, et vous touchez une commission récurrente — sans devenir courtier.",
  },
  pains: [
    {
      title: "Vos clients demandent une assurance, vous n'avez rien à leur vendre",
      body: "La question tombe à chaque dossier. Faute d'offre, vous renvoyez vers la banque ou un comparateur, et la marge la plus facile de la réservation vous échappe.",
    },
    {
      title: "Distribuer une assurance, c'est un marathon réglementaire",
      body: "Immatriculation ORIAS, formation continue, responsabilité civile professionnelle, contrôles ACPR : devenir intermédiaire en assurance immobilise un poste entier pour une ligne de revenu annexe.",
    },
    {
      title: "Les contrats groupe sont rigides et chers",
      body: "Un seul assureur, des garanties figées, des plafonds qui ne collent ni au PVT ni à la croisière senior. Vos clients comparent, trouvent moins cher ailleurs, et repartent déçus.",
    },
  ],
  benefits: [
    {
      badge: "Zéro logiciel",
      title: "Un lien à partager, rien à installer",
      body: "Vous envoyez le Coach HelloSafe par WhatsApp, e-mail ou QR code en agence. Le client compare, choisit et souscrit seul. Aucun CRM à brancher, aucune formation à suivre.",
    },
    {
      badge: "Commission récurrente",
      title: "Cookie 90 jours + commission sur renouvellement",
      body: "Le client peut souscrire trois semaines après votre conseil, vous êtes toujours crédité. Et le contrat se renouvelle ? Vous touchez encore.",
    },
    {
      badge: "Conformité portée",
      title: "Pas d'ORIAS, pas de licence à porter",
      body: "HelloSafe porte la conformité de la distribution d'assurance. Vous orientez, nous distribuons : vous restez agent de voyage, jamais courtier.",
    },
    {
      badge: "À vos couleurs",
      title: "Un récap client à votre marque",
      body: "Logo, couleur, baseline : le comparatif que reçoit votre client porte votre identité, pas seulement la nôtre. Vous restez le conseiller de confiance.",
    },
  ],
  proof: {
    quote:
      "Je partage le lien du Coach HelloSafe par WhatsApp après chaque rendez-vous. Le client compare tranquille chez lui, souscrit, et je touche ma commission sans avoir rempli un seul formulaire ORIAS.",
    author: "Khadija B.",
    role: "Agence de voyage, 2 bureaux à Lyon",
    metric: "1 850 €/mois de commissions",
  },
  calc: {
    title: "Ce que rapporte une agence comme la vôtre",
    visitorsLabel: "Clients conseillés par mois",
    visitorsDefault: 350,
    ctrPct: 45,
    convPct: 14,
    basketEur: 110,
    commissionPct: 18,
    note: "Estimation hors renouvellements. Les recommandations en face-à-face cliquent bien plus que le trafic web froid.",
  },
  cta: {
    primary: "Créer mon compte agence",
    secondary: "Voir comment ça marche",
  },
};

export const AGENCY_EN: PersonaContent = {
  slug: "agency",
  category: "For travel agencies",
  hero: {
    eyebrow: "For travel agencies and OTAs",
    title: "Monetize the travel insurance your clients already ask you for",
    subtitle:
      "\"So what about insurance?\" Your clients ask at every booking. Today you send them to their bank or a comparison site, and the commission goes elsewhere. With HelloSafe, you share a link, your client subscribes online, and you earn a recurring commission — without becoming a broker.",
  },
  pains: [
    {
      title: "Your clients ask for insurance, you have nothing to sell them",
      body: "The question comes up on every file. With no offer, you point them to their bank or a comparison site, and the easiest margin of the booking slips away.",
    },
    {
      title: "Distributing insurance is a regulatory marathon",
      body: "Registration, continuous training, professional liability, regulator audits: becoming an insurance intermediary ties up a full role for a side line of revenue.",
    },
    {
      title: "Group contracts are rigid and expensive",
      body: "One insurer, fixed coverage, caps that fit neither a working-holiday nor a senior cruise. Your clients compare, find it cheaper elsewhere, and leave disappointed.",
    },
  ],
  benefits: [
    {
      badge: "Zero software",
      title: "A link to share, nothing to install",
      body: "Send the HelloSafe Coach by WhatsApp, email or in-store QR code. The client compares, picks and subscribes on their own. No CRM to wire, no training to sit through.",
    },
    {
      badge: "Recurring commission",
      title: "90-day cookie + commission on renewal",
      body: "Your client can subscribe three weeks after your advice and you're still credited. And when the contract renews? You earn again.",
    },
    {
      badge: "Compliance carried",
      title: "No license to hold yourself",
      body: "HelloSafe carries the compliance of insurance distribution. You refer, we distribute: you stay a travel agent, never a broker.",
    },
    {
      badge: "In your colors",
      title: "A client recap in your brand",
      body: "Logo, color, tagline: the comparison your client receives carries your identity, not just ours. You stay the trusted advisor.",
    },
  ],
  proof: {
    quote:
      "I share the HelloSafe Coach link on WhatsApp after every meeting. The client compares calmly at home, subscribes, and I get my commission without filling out a single regulatory form.",
    author: "Khadija B.",
    role: "Travel agency, 2 offices in Lyon",
    metric: "€1,850/month in commissions",
  },
  calc: {
    title: "What an agency like yours can earn",
    visitorsLabel: "Clients advised per month",
    visitorsDefault: 350,
    ctrPct: 45,
    convPct: 14,
    basketEur: 110,
    commissionPct: 18,
    note: "Estimate excluding renewals. Face-to-face recommendations click far more than cold web traffic.",
  },
  cta: {
    primary: "Create my agency account",
    secondary: "See how it works",
  },
};
