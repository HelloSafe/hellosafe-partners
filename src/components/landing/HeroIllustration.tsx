/**
 * Stylized hero illustrations for the public landing pages.
 *
 * Each variant is a self-contained mock UI (browser chrome + dashboard
 * card + floating badge), built in the same visual language as the home
 * Hero's HeroMockup. They are decorative — copy is locale-bound (FR) and
 * intentionally short so the surrounding hero text stays the focus.
 */

type IllustrationKind =
  | "tiers"
  | "process"
  | "support"
  | "blog"
  | "agency"
  | "visa"
  | "creator"
  | "student";

export function HeroIllustration({ kind }: { kind: IllustrationKind }) {
  return (
    <div className="relative">
      <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-brand-500/20 via-accent-500/15 to-success-500/20 blur-2xl" />
      <div className="hs-mockup relative rounded-[1.75rem] border border-white/60 p-3 lg:p-4">
        <BrowserChrome host={hostFor(kind)} />
        <div className="rounded-b-2xl bg-white p-5 lg:p-6">{renderBody(kind)}</div>
      </div>
      {renderBadge(kind)}
    </div>
  );
}

/* ----- Browser chrome (shared) ----- */

function BrowserChrome({ host }: { host: string }) {
  return (
    <div className="hs-mockup-bar flex items-center gap-2 rounded-t-2xl px-4 py-3 border-b border-surface-200">
      <span className="h-2.5 w-2.5 rounded-full bg-accent-500" />
      <span className="h-2.5 w-2.5 rounded-full bg-warning-500/80" />
      <span className="h-2.5 w-2.5 rounded-full bg-success-500" />
      <span className="ml-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs text-ink-500 border border-surface-200">
        <LockGlyph />
        {host}
      </span>
    </div>
  );
}

function hostFor(kind: IllustrationKind): string {
  switch (kind) {
    case "tiers":
      return "partners.hellosafe.com / payouts";
    case "process":
      return "partners.hellosafe.com / start";
    case "support":
      return "partners.hellosafe.com / aide";
    case "blog":
      return "blog-voyage.fr / pvt-canada";
    case "agency":
      return "partners.hellosafe.com / coach";
    case "visa":
      return "partners.hellosafe.com / certificate";
    case "creator":
      return "partners.hellosafe.com / links";
    case "student":
      return "partners.hellosafe.com / student";
  }
}

/* ----- Body + badge dispatch ----- */

function renderBody(kind: IllustrationKind) {
  switch (kind) {
    case "tiers":
      return <TiersBody />;
    case "process":
      return <ProcessBody />;
    case "support":
      return <SupportBody />;
    case "blog":
      return <BlogBody />;
    case "agency":
      return <AgencyBody />;
    case "visa":
      return <VisaBody />;
    case "creator":
      return <CreatorBody />;
    case "student":
      return <StudentBody />;
  }
}

function renderBadge(kind: IllustrationKind) {
  const badges: Record<IllustrationKind, { icon: string; label: string; value: string; tone: BadgeTone }> = {
    tiers: { icon: "€", label: "Paiement", value: "Le 15 chaque mois", tone: "success" },
    process: { icon: "⏱", label: "Mise en place", value: "Sous 24 heures", tone: "brand" },
    support: { icon: "✓", label: "Réponse moyenne", value: "Sous 2 heures", tone: "success" },
    blog: { icon: "✦", label: "Cookie d'attribution", value: "90 jours", tone: "brand" },
    agency: { icon: "📄", label: "Récap client", value: "Aux couleurs de votre marque", tone: "brand" },
    visa: { icon: "✓", label: "Délai d'émission", value: "90 secondes", tone: "success" },
    creator: { icon: "↑", label: "Sub-ID", value: "Un par publication", tone: "accent" },
    student: { icon: "🎓", label: "Reconnu par", value: "Ambassades CA, AU, US", tone: "brand" },
  };
  const b = badges[kind];
  const toneCls =
    b.tone === "success"
      ? "bg-success-50 text-success-600"
      : b.tone === "accent"
        ? "bg-accent-100 text-accent-900"
        : "bg-brand-50 text-brand-500";
  return (
    <div className="absolute -bottom-5 -left-5 hidden sm:flex items-center gap-3 rounded-2xl bg-white border border-surface-200 px-4 py-3 shadow-lg">
      <span
        className={`inline-flex h-9 w-9 items-center justify-center rounded-xl text-base ${toneCls}`}
      >
        {b.icon}
      </span>
      <div>
        <p className="text-[0.7rem] uppercase tracking-wider text-ink-500">
          {b.label}
        </p>
        <p className="font-display font-bold text-ink-900">{b.value}</p>
      </div>
    </div>
  );
}

type BadgeTone = "brand" | "accent" | "success";

/* ----- /why-partner : Tier ladder ----- */

function TiersBody() {
  const tiers = [
    { name: "Starter", range: "0 – 20 ventes", rate: "10 %", current: false },
    { name: "Growth", range: "21 – 100 ventes", rate: "15 %", current: false },
    { name: "Scale", range: "101 – 300 ventes", rate: "18 %", current: true },
    { name: "Elite", range: "300+ ventes", rate: "20 %", current: false },
  ];
  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-ink-500">
            Palier en cours
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-ink-900">
            Scale · 18 % de commission
          </p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-[0.7rem] font-display font-bold uppercase text-brand-700 border border-brand-100">
          Mai 2026
        </span>
      </div>
      <ul className="mt-5 space-y-2">
        {tiers.map((t) => (
          <li
            key={t.name}
            className={`flex items-center justify-between rounded-xl px-3 py-2.5 border ${
              t.current
                ? "bg-brand-50 border-brand-200"
                : "bg-surface-50 border-surface-200"
            }`}
          >
            <span className="flex items-center gap-3">
              <span
                className={`h-2 w-2 rounded-full ${
                  t.current ? "bg-brand-500" : "bg-surface-300"
                }`}
              />
              <span
                className={`text-sm font-display font-bold ${
                  t.current ? "text-brand-700" : "text-ink-700"
                }`}
              >
                {t.name}
              </span>
              <span className="text-xs text-ink-500">{t.range}</span>
            </span>
            <span
              className={`font-display font-bold tabular-nums ${
                t.current ? "text-brand-700" : "text-ink-700"
              }`}
            >
              {t.rate}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-5 rounded-xl bg-success-50 border border-success-600/20 px-4 py-3 flex items-center justify-between">
        <span className="text-sm text-success-900 font-semibold">
          Prochain paiement
        </span>
        <span className="font-display font-bold text-success-900 tabular-nums">
          4 287,40 €
        </span>
      </div>
    </>
  );
}

/* ----- /how-it-works : 3-step process ----- */

function ProcessBody() {
  const steps = [
    { n: "01", label: "Inscription", state: "done" as const, time: "2 min" },
    { n: "02", label: "Validation manuelle", state: "done" as const, time: "24 h" },
    { n: "03", label: "Premier lien généré", state: "active" as const, time: "30 s" },
    { n: "04", label: "Première vente", state: "next" as const, time: "—" },
  ];
  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-ink-500">
            Bienvenue
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-ink-900">
            Carnets de Route
          </p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-success-50 px-2.5 py-1 text-[0.7rem] font-display font-bold uppercase text-success-900 border border-success-600/20">
          ● Actif
        </span>
      </div>
      <div className="mt-5 grid grid-cols-4 gap-1.5">
        {steps.map((s) => (
          <div key={s.n} className="flex flex-col items-center">
            <span
              className={`h-2 w-full rounded-full ${
                s.state === "done"
                  ? "bg-success-500"
                  : s.state === "active"
                    ? "bg-brand-500"
                    : "bg-surface-200"
              }`}
            />
          </div>
        ))}
      </div>
      <ol className="mt-5 space-y-2.5">
        {steps.map((s) => (
          <li
            key={s.n}
            className="flex items-center justify-between rounded-xl bg-surface-50 border border-surface-200 px-3 py-2.5"
          >
            <span className="flex items-center gap-3">
              <span
                className={`inline-flex h-7 w-7 items-center justify-center rounded-lg font-display font-bold text-xs ${
                  s.state === "done"
                    ? "bg-success-50 text-success-600"
                    : s.state === "active"
                      ? "bg-brand-500 text-white"
                      : "bg-surface-200 text-ink-500"
                }`}
              >
                {s.state === "done" ? "✓" : s.n}
              </span>
              <span
                className={`text-sm font-medium ${
                  s.state === "next" ? "text-ink-500" : "text-ink-900"
                }`}
              >
                {s.label}
              </span>
            </span>
            <span className="text-xs font-display font-bold tabular-nums text-ink-500">
              {s.time}
            </span>
          </li>
        ))}
      </ol>
    </>
  );
}

/* ----- /faq : Help center ----- */

function SupportBody() {
  const topics = [
    { label: "Tarifs et paliers de commission", count: 4 },
    { label: "Validation et inscription", count: 3 },
    { label: "Liens et tracking", count: 5 },
    { label: "Paiements et factures", count: 3 },
    { label: "Support client final", count: 2 },
  ];
  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-ink-500">
            Centre d&apos;aide
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-ink-900">
            17 réponses détaillées
          </p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-success-50 px-2.5 py-1 text-[0.7rem] font-display font-bold uppercase text-success-900 border border-success-600/20">
          ● 7j/7
        </span>
      </div>
      <div className="mt-5 rounded-xl border border-surface-200 bg-surface-50 px-4 py-3 flex items-center gap-3">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-white border border-surface-200 text-ink-500">
          🔍
        </span>
        <span className="text-sm text-ink-500">Rechercher une question…</span>
      </div>
      <ul className="mt-4 space-y-2">
        {topics.map((t) => (
          <li
            key={t.label}
            className="flex items-center justify-between rounded-xl bg-white border border-surface-200 px-3.5 py-2.5"
          >
            <span className="text-sm text-ink-900 font-medium">{t.label}</span>
            <span className="inline-flex items-center gap-2">
              <span className="text-xs text-ink-500 tabular-nums">
                {t.count}
              </span>
              <span className="text-ink-400">›</span>
            </span>
          </li>
        ))}
      </ul>
    </>
  );
}

/* ----- /for/blog : Article + tracked CTA ----- */

function BlogBody() {
  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-ink-500">
            Article publié
          </p>
          <p className="mt-1 font-display text-xl font-bold text-ink-900">
            Guide PVT Canada 2026
          </p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-[0.7rem] font-display font-bold uppercase text-brand-700 border border-brand-100">
          Sub-ID actif
        </span>
      </div>
      <div className="mt-5 rounded-xl border border-surface-200 bg-surface-50 p-4">
        <div className="space-y-1.5">
          <div className="h-2 w-full rounded-full bg-surface-200" />
          <div className="h-2 w-11/12 rounded-full bg-surface-200" />
          <div className="h-2 w-3/4 rounded-full bg-surface-200" />
        </div>
        <div className="mt-4 rounded-lg bg-white border border-brand-200 px-4 py-3 flex items-center justify-between">
          <span className="text-sm font-display font-bold text-ink-900">
            Comparer les assurances PVT
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-500 text-white text-xs font-semibold px-2.5 py-1">
            → Lien traqué
          </span>
        </div>
      </div>
      <ul className="mt-5 space-y-2">
        {[
          { src: "PVT Canada · Aurélie", v: "+89 €", t: "il y a 4 min" },
          { src: "Visa étudiant · Lucas", v: "+62 €", t: "il y a 22 min" },
          { src: "Renouvellement · Marie", v: "+47 €", t: "il y a 1 h" },
        ].map((row, i) => (
          <li
            key={i}
            className="flex items-center justify-between rounded-xl bg-surface-100 px-3 py-2 text-sm"
          >
            <span className="flex items-center gap-2 text-ink-700">
              <span className="h-2 w-2 rounded-full bg-success-500" />
              {row.src}
            </span>
            <span className="flex items-center gap-3">
              <span className="font-display font-bold text-ink-900 tabular-nums">
                {row.v}
              </span>
              <span className="text-xs text-ink-500">{row.t}</span>
            </span>
          </li>
        ))}
      </ul>
    </>
  );
}

/* ----- /for/agency : Coach analysis ----- */

function AgencyBody() {
  const rows = [
    { label: "Frais médicaux", state: "ok" as const, value: "4 500 000 €" },
    { label: "Rapatriement", state: "ok" as const, value: "Frais réels" },
    { label: "Annulation toutes causes", state: "warn" as const, value: "8 000 €" },
    { label: "Bagages", state: "ok" as const, value: "3 000 €" },
    { label: "Sports d'hiver", state: "miss" as const, value: "Non couvert" },
  ];
  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-ink-500">
            Analyse Coach
          </p>
          <p className="mt-1 font-display text-xl font-bold text-ink-900">
            Mme Martin · Bali, 18 jours
          </p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-brand-500 text-white px-2.5 py-1 text-[0.7rem] font-display font-bold uppercase">
          PDF prêt
        </span>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-2">
        <div className="rounded-xl bg-surface-50 border border-surface-200 p-3 text-center">
          <p className="font-display text-xl font-bold tabular-nums text-success-600">
            72
          </p>
          <p className="text-[0.65rem] uppercase tracking-wider text-ink-500 leading-tight mt-1">
            Score actuel
          </p>
        </div>
        <div className="rounded-xl bg-surface-50 border border-surface-200 p-3 text-center">
          <p className="font-display text-xl font-bold tabular-nums text-warning-600">
            2
          </p>
          <p className="text-[0.65rem] uppercase tracking-wider text-ink-500 leading-tight mt-1">
            Trous identifiés
          </p>
        </div>
        <div className="rounded-xl bg-surface-50 border border-surface-200 p-3 text-center">
          <p className="font-display text-xl font-bold tabular-nums text-brand-500">
            96
          </p>
          <p className="text-[0.65rem] uppercase tracking-wider text-ink-500 leading-tight mt-1">
            Score Atlas
          </p>
        </div>
      </div>
      <ul className="mt-4 space-y-1.5">
        {rows.map((r) => (
          <li
            key={r.label}
            className="flex items-center justify-between rounded-lg bg-surface-50 px-3 py-2 text-xs"
          >
            <span className="flex items-center gap-2 text-ink-700">
              <span
                className={`h-2 w-2 rounded-full ${
                  r.state === "ok"
                    ? "bg-success-500"
                    : r.state === "warn"
                      ? "bg-warning-500"
                      : "bg-danger-500"
                }`}
              />
              {r.label}
            </span>
            <span className="text-ink-500 tabular-nums">{r.value}</span>
          </li>
        ))}
      </ul>
    </>
  );
}

/* ----- /for/visa : Certificate ----- */

function VisaBody() {
  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-ink-500">
            Attestation conforme
          </p>
          <p className="mt-1 font-display text-xl font-bold text-ink-900">
            Visa Schengen · 30 jours
          </p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-success-50 px-2.5 py-1 text-[0.7rem] font-display font-bold uppercase text-success-900 border border-success-600/20">
          ✓ Validé
        </span>
      </div>
      <div className="mt-5 rounded-2xl border-2 border-dashed border-brand-200 bg-gradient-to-br from-brand-50 to-white p-5">
        <div className="flex items-center justify-between">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 text-white font-display font-bold">
            HS
          </span>
          <span className="text-[0.65rem] uppercase tracking-wider text-ink-500 font-display font-bold">
            Réf. HS-2026-04823
          </span>
        </div>
        <p className="mt-4 font-display font-bold text-ink-900 text-base">
          M. Camille Lefèvre
        </p>
        <p className="text-xs text-ink-500 mt-0.5">
          Né le 12/03/1994 · FR
        </p>
        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
          <div>
            <dt className="text-ink-500">Frais médicaux</dt>
            <dd className="font-semibold text-ink-900">100 000 €</dd>
          </div>
          <div>
            <dt className="text-ink-500">Rapatriement</dt>
            <dd className="font-semibold text-ink-900">Inclus</dd>
          </div>
          <div>
            <dt className="text-ink-500">Zone</dt>
            <dd className="font-semibold text-ink-900">Schengen</dd>
          </div>
          <div>
            <dt className="text-ink-500">Validité</dt>
            <dd className="font-semibold text-ink-900">04/06 – 03/07/2026</dd>
          </div>
        </dl>
      </div>
      <p className="mt-3 text-[0.7rem] text-ink-500 text-center">
        Émise en 87 secondes · acceptée par les ambassades Schengen
      </p>
    </>
  );
}

/* ----- /for/creator : Sub-ID per story ----- */

function CreatorBody() {
  const subs = [
    { id: "story-bali-mai", clicks: 412, sales: 18, eur: "+ 198 €" },
    { id: "reel-pvt-canada", clicks: 287, sales: 11, eur: "+ 142 €" },
    { id: "post-thai-2026", clicks: 198, sales: 6, eur: "+ 71 €" },
    { id: "story-perou", clicks: 122, sales: 3, eur: "+ 38 €" },
  ];
  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-ink-500">
            Performance par publication
          </p>
          <p className="mt-1 font-display text-xl font-bold text-ink-900">
            7 derniers jours
          </p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-accent-100 px-2.5 py-1 text-[0.7rem] font-display font-bold uppercase text-accent-900 border border-accent-200">
          + 18 % vs s-1
        </span>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-2">
        <div className="rounded-xl bg-surface-50 border border-surface-200 p-3 text-center">
          <p className="font-display text-xl font-bold tabular-nums text-brand-500">
            1 019
          </p>
          <p className="text-[0.65rem] uppercase tracking-wider text-ink-500 leading-tight mt-1">
            Clics
          </p>
        </div>
        <div className="rounded-xl bg-surface-50 border border-surface-200 p-3 text-center">
          <p className="font-display text-xl font-bold tabular-nums text-accent-500">
            38
          </p>
          <p className="text-[0.65rem] uppercase tracking-wider text-ink-500 leading-tight mt-1">
            Souscriptions
          </p>
        </div>
        <div className="rounded-xl bg-surface-50 border border-surface-200 p-3 text-center">
          <p className="font-display text-xl font-bold tabular-nums text-success-600">
            449 €
          </p>
          <p className="text-[0.65rem] uppercase tracking-wider text-ink-500 leading-tight mt-1">
            Commissions
          </p>
        </div>
      </div>
      <ul className="mt-4 space-y-1.5">
        {subs.map((s) => (
          <li
            key={s.id}
            className="flex items-center justify-between rounded-lg bg-surface-50 px-3 py-2 text-xs"
          >
            <span className="font-mono text-ink-700">{s.id}</span>
            <span className="flex items-center gap-3">
              <span className="text-ink-500 tabular-nums">
                {s.clicks} · {s.sales}
              </span>
              <span className="font-display font-bold text-success-600 tabular-nums">
                {s.eur}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </>
  );
}

/* ----- /for/student : Visa-ready certificate ----- */

function StudentBody() {
  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-ink-500">
            Attestation étudiante
          </p>
          <p className="mt-1 font-display text-xl font-bold text-ink-900">
            PVT Canada · 12 mois
          </p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-success-50 px-2.5 py-1 text-[0.7rem] font-display font-bold uppercase text-success-900 border border-success-600/20">
          ✓ Conforme
        </span>
      </div>
      <div className="mt-5 rounded-2xl border-2 border-dashed border-brand-200 bg-gradient-to-br from-brand-50 to-white p-5">
        <div className="flex items-center justify-between">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 text-white font-display font-bold">
            HS
          </span>
          <span className="text-[0.65rem] uppercase tracking-wider text-ink-500 font-display font-bold">
            Réf. HS-2026-12784
          </span>
        </div>
        <p className="mt-4 font-display font-bold text-ink-900 text-base">
          Mlle Léa Dubois
        </p>
        <p className="text-xs text-ink-500 mt-0.5">
          Étudiante · née le 21/06/2003
        </p>
        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
          <div>
            <dt className="text-ink-500">Couverture</dt>
            <dd className="font-semibold text-ink-900">2 000 000 CAD</dd>
          </div>
          <div>
            <dt className="text-ink-500">Maternité</dt>
            <dd className="font-semibold text-ink-900">Incluse</dd>
          </div>
          <div>
            <dt className="text-ink-500">Zone</dt>
            <dd className="font-semibold text-ink-900">Canada (10 prov.)</dd>
          </div>
          <div>
            <dt className="text-ink-500">Durée</dt>
            <dd className="font-semibold text-ink-900">12 mois</dd>
          </div>
        </dl>
      </div>
      <div className="mt-4 flex items-center justify-center gap-3 text-[0.65rem] uppercase tracking-wider font-display font-bold text-ink-500">
        <span>🇨🇦 IEC</span>
        <span className="text-ink-300">·</span>
        <span>🇦🇺 WHV</span>
        <span className="text-ink-300">·</span>
        <span>🇺🇸 J-1</span>
        <span className="text-ink-300">·</span>
        <span>🇳🇿 WHS</span>
      </div>
    </>
  );
}

/* ----- Inline lock glyph (matches home Hero) ----- */

function LockGlyph() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden className="text-ink-300">
      <rect x="2.5" y="5.5" width="7" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.2" fill="none" />
      <path d="M4 5.5V4a2 2 0 014 0v1.5" stroke="currentColor" strokeWidth="1.2" fill="none" />
    </svg>
  );
}
