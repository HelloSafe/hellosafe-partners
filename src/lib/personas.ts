export type PersonaSlug =
  | "blog"
  | "agency"
  | "visa"
  | "creator"
  | "expat"
  | "student"
  | "cruise";

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

export const PERSONA_SLUGS: PersonaSlug[] = [
  "blog",
  "agency",
  "visa",
  "creator",
  "expat",
  "student",
  "cruise",
];

export const PERSONAS: Record<Locale, Record<PersonaSlug, PersonaContent>> = {
  fr: {
    blog: {
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
          title: "Pas le temps de gérer 5 plateformes d'affiliation",
          body: "Vous voulez écrire, pas jongler entre Impact, CJ et 3 dashboards qui ne se parlent pas.",
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
          body: "Un Sub-ID par contenu, granularité totale dans le dashboard. Ce qui marche, vous le doublez.",
        },
        {
          badge: "Sans seuil",
          title: "Payé chaque mois, sans minimum",
          body: "10 €, 1 000 € ou 50 000 € : virement le 15 du mois. Pas de seuil de 250 $ comme chez les programmes US.",
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
    },
    agency: {
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
    },
    visa: {
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
          title: "Les programmes mono-assureur ne couvrent pas tous les types de visa",
          body: "Schengen, PVT, étudiant, longue durée, working holiday — les exigences changent. Un seul contrat ne suffit pas.",
        },
        {
          title: "Une intégration custom prend 2 mois",
          body: "Vous voulez aller vite. Embarquer un dev pour brancher un comparateur ne rentre pas dans votre roadmap.",
        },
      ],
      benefits: [
        {
          badge: "Visa-ready",
          title: "Conforme à toutes les ambassades",
          body: "Schengen, USA J-1, Canada IEC, Australie WHV, Inde, Thaïlande — un seul parcours, un seul lien, l'attestation est acceptée partout.",
        },
        {
          badge: "Délai 90 secondes",
          title: "Le PDF arrive avant la fin du formulaire visa",
          body: "Souscription, paiement, certificat envoyé : 90 secondes médian. Vos visiteurs ne décrochent pas.",
        },
        {
          badge: "API + widget",
          title: "Intégration en moins d'une heure",
          body: "API REST claire, widget natif aux couleurs de votre site. Pas d'iframe bloquée, pas de redirection brutale.",
        },
        {
          badge: "Postback",
          title: "Compatible avec votre stack tracking",
          body: "S2S vers Voluum, RedTrack, Everflow, Impact, Partnerize. Vous gardez votre attribution end-to-end.",
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
    },
    creator: {
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
    },
    expat: {
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
    },
    student: {
      slug: "student",
      category: "Pour les étudiants à l'étranger",
      hero: {
        eyebrow: "Pour les conseillers en mobilité étudiante",
        title: "Le visa étudiant, c'est l'assurance d'abord",
        subtitle:
          "Vos étudiants partent au Canada, en Australie, en Espagne. Sans attestation d'assurance, pas de visa. Avec HelloSafe, c'est traité en 2 minutes — et vous touchez sur chaque dossier, à chaque renouvellement annuel.",
      },
      pains: [
        {
          title: "L'assurance étudiant traîne souvent jusqu'au dernier moment",
          body: "L'étudiant et ses parents découvrent l'exigence visa 2 semaines avant le départ. Stress, achat en panique, vente captée par le premier comparateur trouvé.",
        },
        {
          title: "La sécu étudiante mutualisée ne couvre pas hors EU",
          body: "Au Canada, en Australie, aux US, votre étudiant n'a quasiment aucun remboursement de la sécurité sociale française. La famille ne le réalise pas toujours.",
        },
        {
          title: "Les commissions sur l'assurance étudiante sont basses",
          body: "Programmes mono-assureur à 8 % de 80 € : 6 € par dossier. Insultant pour un service qui sécurise toute une année.",
        },
      ],
      benefits: [
        {
          badge: "Visa-ready",
          title: "Conforme aux exigences ambassades",
          body: "Plafond illimité Australie, 100 000 € PVT Canada, attestation étudiant Schengen — un seul lien, le bon document.",
        },
        {
          badge: "1 à 5 ans renouvelable",
          title: "L'étudiant fait son master ? Vous êtes payé chaque année",
          body: "Pas de clawback. Le contrat se renouvelle, vous touchez à nouveau.",
        },
        {
          badge: "Coach pour les parents",
          title: "Rassurez la famille en 30 secondes",
          body: "L'outil Coach montre aux parents ce que la sécu et leur mutuelle ne couvrent pas — et ce que HelloSafe ajoute. La décision se prend à table, pas dans la panique.",
        },
        {
          badge: "Jusqu'à 20 %",
          title: "Sur un panier moyen de 450 €",
          body: "80 €/dossier minimum, récurrent. Et chaque étudiant qui rentre en parle à la promotion suivante.",
        },
      ],
      proof: {
        quote:
          "Je vois 80 dossiers par an de mobilité étudiante. Avec le Coach, je convertis 75 % en vente d'assurance, sans pression — c'est la famille qui demande quand elle voit ce que la sécu ne couvre pas.",
        author: "Inès R.",
        role: "Conseillère en mobilité étudiante",
        metric: "75 % de taux de conversion familles",
      },
      calc: {
        title: "Ce que ça représente pour un conseiller étudiant",
        visitorsLabel: "Dossiers étudiants par mois",
        visitorsDefault: 12,
        ctrPct: 100,
        convPct: 75,
        basketEur: 450,
        commissionPct: 18,
        note: "Récurrence sur multi-année à 60 % — non incluse dans le calcul, c'est du bonus.",
      },
      cta: {
        primary: "Devenir partenaire mobilité étudiante",
        secondary: "Voir l'outil Coach",
      },
    },
    cruise: {
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
    },
  },
  en: {
    blog: {
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
    },
    agency: {
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
    },
    visa: {
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
    },
    creator: {
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
    },
    expat: {
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
    },
    student: {
      slug: "student",
      category: "For student mobility",
      hero: {
        eyebrow: "For student mobility advisors",
        title: "The student visa is insurance first",
        subtitle:
          "Your students leave for Canada, Australia, Spain. No insurance certificate, no visa. With HelloSafe, it's handled in 2 minutes — and you get paid on every booking, on every annual renewal.",
      },
      pains: [
        {
          title: "Student insurance gets pushed to the last minute",
          body: "The student and their parents discover the visa requirement 2 weeks before departure. Stress, panic-buy, sale captured by the first comparator they find.",
        },
        {
          title: "French student social security doesn't cover outside the EU",
          body: "In Canada, Australia, the US, your student gets almost zero reimbursement from French social security. The family doesn't always realize.",
        },
        {
          title: "Student insurance commissions are low",
          body: "Single-insurer programs at 8% of €80: €6 per booking. Insulting for a service that secures an entire year.",
        },
      ],
      benefits: [
        {
          badge: "Visa-ready",
          title: "Compliant with embassy requirements",
          body: "Unlimited Australia, €100,000 Canada working holiday, Schengen student certificate — one link, the right document.",
        },
        {
          badge: "1 to 5 years renewable",
          title: "Student doing a master's? You're paid every year",
          body: "No clawback. The contract renews, you earn again.",
        },
        {
          badge: "Coach for parents",
          title: "Reassure the family in 30 seconds",
          body: "The Coach tool shows parents what social security and their top-up don't cover — and what HelloSafe adds. The decision happens at the kitchen table, not in panic.",
        },
        {
          badge: "Up to 20%",
          title: "On a €450 average basket",
          body: "€80/booking minimum, recurring. And every student who comes back tells the next class.",
        },
      ],
      proof: {
        quote:
          "I see 80 student mobility cases per year. With the Coach, 75% convert into an insurance sale, with no pressure — the family asks, after seeing what social security doesn't cover.",
        author: "Inès R.",
        role: "Student mobility advisor",
        metric: "75% family conversion rate",
      },
      calc: {
        title: "What it represents for a student advisor",
        visitorsLabel: "Student bookings per month",
        visitorsDefault: 12,
        ctrPct: 100,
        convPct: 75,
        basketEur: 450,
        commissionPct: 18,
        note: "Multi-year renewal at 60% — not included in the calc, that's bonus.",
      },
      cta: { primary: "Become a student-mobility partner", secondary: "See the Coach" },
    },
    cruise: {
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
    },
  },
};

export function getPersona(locale: string, slug: PersonaSlug): PersonaContent {
  const l: Locale = locale === "en" ? "en" : "fr";
  return PERSONAS[l][slug];
}
