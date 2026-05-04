# Images à générer pour la home (HelloSafe Atlas)

> **STATUT — 2026-05 : ARCHIVÉ.** Décision produit : **on reste sur les mockups CSS pur** (hero dashboard, link builder, calculateur revenu, glyphs personas, etc.). Pas d'image bitmap, pas de Gemini, pas de stock. Cohérence DS et perfs Lighthouse garanties. Document conservé pour référence si la décision change.

> But initial : remplacer les visuels CSS / SVG par des vraies images générées via Gemini (ou banque d'images), puis les déposer dans `public/landing/` et brancher dans `src/app/[locale]/(site)/page.tsx`.
>
> **DS HelloSafe à respecter dans tous les prompts** :
> - Violet brand `#563BFF`
> - Orange accent `#FF7049`
> - Vert success `#20C997`
> - Bleu profond ink `#0C2543`
> - Surface `#F7F8FB`, blanc `#FFFFFF`
> - Style général : moderne, soft, gradients, peu de saturation, fond clair, ombre douce. Pas de photo lifestyle banale.

---

## 1. Hero — visuel principal

**Emplacement actuel** : `<HeroMockup />` dans `page.tsx`. C'est un faux dashboard CSS pour l'instant.

**Option A — remplacer le mockup CSS par un vrai screenshot 3D du dashboard partenaire**
- **Fichier** : `public/landing/hero-dashboard.png`
- **Dimensions** : 1280×960, format PNG transparent (pour bien s'intégrer au fond gradient violet du hero)
- **Prompt Gemini** :
  > A modern SaaS affiliate dashboard floating in 3D, slight isometric tilt, white background with soft purple `#563BFF` and orange `#FF7049` glow underneath. Inside the dashboard: a large total revenue number "4 287,40 €", a green "+18%" indicator, a sparkline chart in violet, three stat cards, and a list of recent commission entries with green dots. Modern Inter / Switzer typography. Soft shadows, glassmorphic feel, premium fintech aesthetic. Transparent background. No people. No logo. 4K render.

**Option B — illustration vectorielle abstraite** (plus safe)
- **Fichier** : `public/landing/hero-illustration.svg`
- **Prompt Gemini** :
  > Flat vector illustration, abstract data visualization for a travel-insurance affiliate platform. Floating cards showing percentages, charts and money amounts, connected by light dotted lines. Color palette: violet `#563BFF`, orange `#FF7049`, green `#20C997`, deep blue `#0C2543`, beige `#F7F8FB`. Soft gradient shadows. Light, optimistic mood. 1:1 ratio. No people. SVG-friendly, clean shapes.

---

## 2. Bandeau de logos partenaires

**Emplacement actuel** : `<LogosMarquee />`, affiche les noms en typo bold gris pâle.

**Mieux** : vrais logos SVG monochromes de blogs / créateurs / OTAs partenaires.

- **Fichiers** : `public/landing/partners/{slug}.svg` (un par partenaire, monochrome `#576A88`, hauteur 32px en référence)
- **Prompt Gemini** (1 prompt par marque, ou batch) :
  > Minimalist monochrome wordmark logo for a fictional French travel blog called "Le Routard Pro". Single color `#576A88`, no icon, modern serif or geometric sans-serif typography, transparent background, optimized for 200×40 px display. Output as clean SVG.
- À répéter pour : `Carnets de Route`, `Voyage Forever`, `GlobePass`, `Wanderlust FR`, `Backpacker Mag`, `Tripzy`, `Voyage Voyage`.

> ⚠️ Si vous voulez les **vrais** logos de blogs partenaires HelloSafe : récupérez-les en SVG noir sur les sites des partenaires + accord écrit avant de les afficher en bandeau.

---

## 3. Section "Tu es..." (ProfileSelector) — illustrations par persona

**Emplacement actuel** : `<PersonaGlyph />` dans `page.tsx`, ce sont des SVG vectoriels faits main, simples mais génériques.

**Mieux** : 7 illustrations vectorielles cohérentes (même style graphique).

- **Dossier** : `public/landing/personas/`
- **Fichiers** : `blog.svg`, `agency.svg`, `visa.svg`, `creator.svg`, `expat.svg`, `student.svg`, `cruise.svg`
- **Dimensions** : 256×256 carré, transparent
- **Prompt Gemini master** (à customiser par persona) :
  > Set of 7 minimalist isometric illustrations representing different travel-content audiences. Same visual style across the set: flat shapes with subtle gradient shadows, color palette violet `#563BFF`, orange `#FF7049`, green `#20C997`, deep blue `#0C2543`, light beige `#F7F8FB`. 256×256 px, transparent background, centered subject, no text, friendly and modern.
  >
  > 1. **blog** — open laptop on a coffee table with a travel article on screen and a small map illustration.
  > 2. **agency** — small storefront with a globe icon above the door, arrow pointing in.
  > 3. **visa** — a stamped passport with an attestation paper next to it.
  > 4. **creator** — smartphone in vertical mode showing a story/reel, with a camera icon and small heart bubbles.
  > 5. **expat** — a suitcase next to a globe, with a rotating arrow showing relocation.
  > 6. **student** — graduation cap on top of a globe, with a small plane circling.
  > 7. **cruise** — stylized cruise ship on calm water, with sun rays.

---

## 4. Témoignages — avatars

**Emplacement actuel** : composant `<Avatar />` qui affiche les initiales sur fond coloré.

**Mieux** : photos illustratives (générées, pas réelles, sauf si vous avez l'accord des partenaires).

- **Dossier** : `public/landing/avatars/`
- **Fichiers** : `sarah-l.jpg`, `romain-d.jpg`, `camille-m.jpg`
- **Dimensions** : 200×200 px JPG
- **Prompt Gemini** (1 par avatar) :
  > Photorealistic portrait of a French woman in her early 30s, smiling, soft natural lighting, neutral light beige background, professional but approachable look, wearing casual modern clothes. Eye contact with camera. Square framing, head and shoulders. High quality, no logos, no text.
  > (Sarah : femme 30 ans, brune, FR. Romain : homme 35 ans, FR, hipster tech. Camille : femme 28 ans, FR, look créatrice de contenu.)

> ⚠️ Génération photoréaliste : assurez-vous que vos prompts ne ressemblent à aucune personne réelle, et que le rendu reste synthétique. Ajoutez un disclaimer dans le footer ("avatars illustratifs, témoignages réels") si besoin.

---

## 5. CTA final — fond visuel

**Emplacement actuel** : `<FinalCta />`, fond `bg-hero-violet` + cercles flous.

**Optionnel — ajouter un visuel d'arrière-plan abstrait** :
- **Fichier** : `public/landing/cta-bg.png`
- **Dimensions** : 2400×1200 px PNG, opacité 30 % à appliquer en overlay
- **Prompt Gemini** :
  > Abstract dark violet `#140B7A` to brand violet `#563BFF` gradient background, with large blurred orbs of orange `#FF7049` glow in top-right and bottom-left corners. Subtle dotted grid pattern overlay. Premium, dark mode SaaS hero. No subjects, no text. Wide 2:1 ratio.

---

## Workflow d'intégration une fois les images livrées

1. Déposer les fichiers dans `public/landing/` (sous-dossiers `partners/`, `personas/`, `avatars/`).
2. Dans `src/app/[locale]/(site)/page.tsx` :
   - Remplacer `<HeroMockup />` par un `<Image src="/landing/hero-dashboard.png" ... />` (Next.js `next/image`).
   - Dans `LogosMarquee`, swapper les `<span>` par des `<Image>` vers `/landing/partners/*.svg`.
   - Dans `PersonaGlyph`, remplacer le `switch` par un `<Image src={`/landing/personas/${slug}.svg`} ... />`.
   - Dans `Avatar`, ajouter une prop optionnelle `src` qui, si fournie, affiche un `<Image>` au lieu des initiales.
3. Tester `npm run build` pour valider l'optimisation des images Next.
4. Lighthouse / PageSpeed pour vérifier que les images ne plombent pas le LCP.

---

## Checklist DS

À chaque livraison Gemini, vérifier :
- [ ] Couleurs respectent la palette HelloSafe (violet `#563BFF`, orange `#FF7049`, vert `#20C997`)
- [ ] Pas de personne réelle reconnaissable
- [ ] Fond transparent ou neutre clair
- [ ] Format / dimensions conformes
- [ ] Poids < 200 Ko par image (optimiser avec `squoosh` ou `tinypng`)
- [ ] SVG : nettoyer avec `svgo` avant commit
