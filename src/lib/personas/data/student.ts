import type { PersonaContent } from "../types";

export const STUDENT_FR: PersonaContent = {
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
};

export const STUDENT_EN: PersonaContent = {
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
};
