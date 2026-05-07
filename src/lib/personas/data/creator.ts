import type { PersonaContent } from "../types";

export const CREATOR_FR: PersonaContent = {
  slug: "creator",
  category: "Pour les créateurs",
  hero: {
    eyebrow: "Pour les créateurs voyage",
    title: "Une story Instagram, plusieurs ventes par jour",
    subtitle:
      "Votre lien bio est précieux, vos stories disparaissent en 24 h, et vos abonnés vous demandent constamment quelle assurance prendre. HelloSafe vous donne un lien unique avec Sub-ID par story, par série, par destination — vous saisissez quelle réponse a converti.",
  },
  pains: [
    {
      title: "Le lien bio ne suffit pas",
      body: "Vos abonnés vous écrivent en DM \"tu prends quelle assurance pour Bali ?\". Vous renvoyez vers un comparateur générique. La vente passe sans vous.",
    },
    {
      title: "Vos liens partagés en story disparaissent dans le navigateur d'Instagram",
      body: "Quand un abonné clique depuis Instagram, TikTok ou Facebook, il atterrit dans un navigateur embarqué qui bloque les cookies tiers. Une bonne partie de vos ventes ne vous est jamais attribuée. Sur certains comptes, c'est 30 à 50 % de revenu invisible.",
    },
    {
      title: "Distribuer une assurance demande un cadre légal lourd",
      body: "En France comme à l'étranger, distribuer une assurance impose registres, formations continues et licences pays par pays. Hors d'atteinte pour un créateur ou un freelance qui veut juste recommander une assurance utile à ses abonnés.",
    },
  ],
  benefits: [
    {
      badge: "Sub-ID par contenu",
      title: "Lien bio, stories, posts, DMs : tout est traqué",
      body: "Un Sub-ID par publication. Vous voyez en temps réel quelle story a converti, quelle destination a vendu.",
    },
    {
      badge: "Mobile-first",
      title: "Tracking préservé même depuis Instagram et TikTok",
      body: "Notre redirecteur détecte les navigateurs embarqués des réseaux sociaux, propose à l'abonné de poursuivre dans Safari ou Chrome, et conserve l'attribution côté serveur. Plusieurs partenaires nous remontent jusqu'à 30 à 50 % de conversions récupérées sur ces sources.",
    },
    {
      badge: "Cookie 90 jours",
      title: "Si l'achat se fait 2 mois après la story, c'est toujours vous",
      body: "Le voyage se prépare longtemps. La fenêtre d'attribution aussi.",
    },
    {
      badge: "Conformité distribuée",
      title: "Vous distribuez sous notre cadre réglementaire",
      body: "HelloSafe porte la conformité de la distribution d'assurance en France, Royaume-Uni, Australie, États-Unis et Canada. Vous concentrez votre énergie sur l'audience et le contenu, pas sur les démarches administratives.",
    },
  ],
  proof: {
    quote:
      "Je teste chaque format en Sub-ID — la story marche 3 fois mieux que le post, je l'ai compris en 2 semaines de data. Mon revenu HelloSafe paye mon prochain trip.",
    author: "Camille M.",
    role: "Créatrice Instagram voyage, 120k followers",
    metric: "3,1× CTR sur Instagram",
  },
  calc: {
    title: "Ce qu'une audience comme la vôtre peut générer",
    visitorsLabel: "Vues mensuelles cumulées (stories + posts + bio)",
    visitorsDefault: 250000,
    ctrPct: 1.4,
    convPct: 9,
    basketEur: 79,
    commissionPct: 15,
    note: "CTR observé sur Instagram : 1 à 2 % selon engagement. Conversion plus faible qu'un blog mais volume × 5.",
  },
  cta: {
    primary: "Créer mon compte créateur",
    secondary: "Voir le kit créatif",
  },
};

export const CREATOR_EN: PersonaContent = {
  slug: "creator",
  category: "For creators",
  hero: {
    eyebrow: "For travel creators",
    title: "One Instagram story, multiple sales per day",
    subtitle:
      "Your bio link is precious, your stories vanish in 24h, and your followers constantly ask which insurance to buy. HelloSafe gives you a single link with Sub-ID per story, per series, per destination — you find out which answer converted.",
  },
  pains: [
    {
      title: "The bio link isn't enough",
      body: "Your followers DM \"which insurance for Bali?\". You point them to a generic comparator. The sale happens without you.",
    },
    {
      title: "You don't know what works",
      body: "Monday story, Thursday post, Reels series — everything goes to the same link. Impossible to tell which format converts best.",
    },
    {
      title: "Single-insurer programs don't pay",
      body: "Flat 10%, €60 basket, 30-day cookie. For a creator whose audience compares before buying, that's laughable.",
    },
  ],
  benefits: [
    {
      badge: "Sub-ID per piece",
      title: "Bio link, stories, posts, DMs: all tracked",
      body: "One Sub-ID per piece. You see in real time which story converted, which destination sold.",
    },
    {
      badge: "Basket × 1.3",
      title: "Your followers pay less than buying direct",
      body: "Negotiated rates from HelloSafe volume. Followers thank you for finding cheaper. That's the trust that lasts.",
    },
    {
      badge: "90-day cookie",
      title: "If they buy 2 months after the story, it's still you",
      body: "Travel takes time to plan. So does the cookie.",
    },
    {
      badge: "Creative kit",
      title: "Banners, text-links, Reels templates ready",
      body: "10 IAB formats + 45 text templates + video assets in HelloSafe colors. You save the production hour.",
    },
  ],
  proof: {
    quote:
      "I test every format with a Sub-ID — stories convert 3× better than posts, I figured that out in 2 weeks of data. My HelloSafe revenue pays for my next trip.",
    author: "Camille M.",
    role: "Travel creator, 120k followers",
    metric: "3.1× CTR on Instagram",
  },
  calc: {
    title: "What an audience like yours can generate",
    visitorsLabel: "Monthly cumulative views (stories + posts + bio)",
    visitorsDefault: 250000,
    ctrPct: 1.4,
    convPct: 9,
    basketEur: 79,
    commissionPct: 15,
    note: "Instagram CTR observed: 1–2% based on engagement. Lower conversion than blog but volume × 5.",
  },
  cta: { primary: "Create my creator account", secondary: "See the creative kit" },
};
