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
      title: "Vous ne savez pas ce qui marche",
      body: "Story du lundi, post du jeudi, série de Reels — tout part dans le même lien. Impossible de savoir quel format convertit le mieux.",
    },
    {
      title: "Les programmes mono-assureur ne payent pas",
      body: "10 % flat, panier 60 €, cookie 30 jours. Pour un créateur dont l'audience compare avant d'acheter, c'est dérisoire.",
    },
  ],
  benefits: [
    {
      badge: "Sub-ID par contenu",
      title: "Lien bio, stories, posts, DMs : tout est traqué",
      body: "Un Sub-ID par publication. Vous voyez en temps réel quelle story a converti, quelle destination a vendu.",
    },
    {
      badge: "Panier × 1,3",
      title: "Vos abonnés payent moins cher qu'en direct",
      body: "Tarifs négociés grâce au volume HelloSafe. Vos abonnés vous remercient d'avoir trouvé moins cher. C'est ça, la confiance qui dure.",
    },
    {
      badge: "Cookie 90 jours",
      title: "Si l'achat se fait 2 mois après la story, c'est toujours vous",
      body: "Le voyage se prépare longtemps. Le cookie aussi.",
    },
    {
      badge: "Kit créatif",
      title: "Bannières, text-links, templates Reels prêts",
      body: "10 formats IAB + 45 templates de phrase + assets vidéo aux couleurs HelloSafe. Vous gagnez l'heure de création.",
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
