"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { Logo } from "@/components/ui/Logo";

type Persona =
  | "blog"
  | "agency"
  | "visa"
  | "creator"
  | "expat"
  | "student"
  | "cruise"
  | "other";

type State = {
  persona: Persona | null;
  agencyName: string;
  agencyTagline: string;
  agencyLogoUrl: string;
  agencyBrandColor: string;
};

const PERSONAS_FR: { id: Persona; label: string; sub: string; icon: string }[] = [
  { id: "blog", label: "Blog voyage", sub: "Articles, guides, SEO", icon: "✍️" },
  { id: "agency", label: "Agence de voyage", sub: "Bureau, OTA, distribution", icon: "🏢" },
  { id: "visa", label: "Spécialiste visa", sub: "Comparateur, immigration", icon: "🛂" },
  { id: "creator", label: "Créateur·rice", sub: "Instagram, YouTube, TikTok", icon: "📸" },
  { id: "expat", label: "Conseil expat", sub: "Mobilité internationale", icon: "🌍" },
  { id: "student", label: "Mobilité étudiante", sub: "PVT, études, séjours", icon: "🎓" },
  { id: "cruise", label: "Croisière & luxe", sub: "Premium, sur-mesure", icon: "🛳" },
  { id: "other", label: "Autre", sub: "Vous nous direz", icon: "✨" },
];

const PERSONAS_EN: { id: Persona; label: string; sub: string; icon: string }[] = [
  { id: "blog", label: "Travel blog", sub: "Articles, guides, SEO", icon: "✍️" },
  { id: "agency", label: "Travel agency", sub: "Storefront, OTA, distribution", icon: "🏢" },
  { id: "visa", label: "Visa specialist", sub: "Comparator, immigration", icon: "🛂" },
  { id: "creator", label: "Creator", sub: "Instagram, YouTube, TikTok", icon: "📸" },
  { id: "expat", label: "Expat advisor", sub: "International mobility", icon: "🌍" },
  { id: "student", label: "Student mobility", sub: "Working holiday, study", icon: "🎓" },
  { id: "cruise", label: "Cruise & luxury", sub: "Premium, bespoke trips", icon: "🛳" },
  { id: "other", label: "Other", sub: "Tell us later", icon: "✨" },
];

export function OnboardingFlow() {
  const locale = useLocale();
  const isEn = locale === "en";
  const personas = isEn ? PERSONAS_EN : PERSONAS_FR;
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [state, setState] = useState<State>({
    persona: null,
    agencyName: "",
    agencyTagline: "",
    agencyLogoUrl: "",
    agencyBrandColor: "#563BFF",
  });

  // Pre-fill from existing branding if any.
  useEffect(() => {
    fetch("/api/account/onboarding", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) return;
        setState((s) => ({
          ...s,
          agencyName: d.agencyName ?? "",
          agencyTagline: d.agencyTagline ?? "",
          agencyLogoUrl: d.agencyLogoUrl ?? "",
          agencyBrandColor: d.agencyBrandColor ?? "#563BFF",
          persona: (d.persona as Persona) ?? null,
        }));
      });
  }, []);

  const canNext = useMemo(() => {
    if (step === 1) return state.persona !== null;
    if (step === 2) return state.agencyName.trim().length > 0;
    return true;
  }, [step, state]);

  const saveProgress = async (extra?: { complete?: boolean }) => {
    await fetch("/api/account/onboarding", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        persona: state.persona ?? undefined,
        agencyName: state.agencyName,
        agencyTagline: state.agencyTagline || null,
        agencyLogoUrl: state.agencyLogoUrl || null,
        agencyBrandColor: state.agencyBrandColor,
        ...(extra ?? {}),
      }),
    });
  };

  const finish = async () => {
    setBusy(true);
    try {
      await saveProgress({ complete: true });
      // Push to the right first-action by persona.
      const target = personaFirstAction(state.persona, isEn);
      router.push(target as never);
    } finally {
      setBusy(false);
    }
  };

  const skip = async () => {
    setBusy(true);
    try {
      await saveProgress({ complete: true });
      router.push("/dashboard" as never);
    } finally {
      setBusy(false);
    }
  };

  const accent = state.agencyBrandColor;

  return (
    <div className="min-h-dvh bg-surface-100">
      <header className="h-16 border-b border-surface-200 bg-white flex items-center px-6 lg:px-10">
        <Link href="/">
          <Logo />
        </Link>
        <span className="ml-3 rounded-full bg-brand-50 px-2 py-0.5 text-[0.68rem] font-bold uppercase tracking-wider text-brand-700">
          {isEn ? "Onboarding" : "Bienvenue"}
        </span>
        <button
          onClick={skip}
          disabled={busy}
          className="ml-auto text-sm text-ink-500 hover:text-ink-900"
        >
          {isEn ? "Skip onboarding →" : "Passer l'onboarding →"}
        </button>
      </header>

      <main className="px-6 lg:px-10 py-10 lg:py-16">
        <div className="max-w-3xl mx-auto">
          <ProgressBar step={step} total={3} />

          {step === 1 && (
            <Step1
              isEn={isEn}
              personas={personas}
              selected={state.persona}
              onSelect={(p) => setState({ ...state, persona: p })}
            />
          )}

          {step === 2 && (
            <Step2
              isEn={isEn}
              state={state}
              setState={setState}
              accent={accent}
            />
          )}

          {step === 3 && (
            <Step3 isEn={isEn} persona={state.persona} accent={accent} />
          )}

          <div className="mt-8 flex items-center justify-between gap-3">
            <button
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1 || busy}
              className="h-11 px-5 rounded-full border border-surface-300 text-sm font-semibold disabled:opacity-30"
            >
              ← {isEn ? "Back" : "Retour"}
            </button>
            {step < 3 ? (
              <button
                onClick={async () => {
                  if (canNext) {
                    await saveProgress();
                    setStep((s) => s + 1);
                  }
                }}
                disabled={!canNext || busy}
                className="h-11 px-6 rounded-full text-sm font-semibold text-white shadow-sm disabled:opacity-50 transition-all hover:brightness-110"
                style={{ background: accent }}
              >
                {isEn ? "Continue" : "Continuer"} →
              </button>
            ) : (
              <button
                onClick={finish}
                disabled={busy}
                className="h-11 px-6 rounded-full text-sm font-semibold text-white shadow-sm disabled:opacity-50 transition-all hover:brightness-110"
                style={{ background: accent }}
              >
                {busy
                  ? isEn
                    ? "Finishing…"
                    : "Finalisation…"
                  : isEn
                  ? "Open my dashboard →"
                  : "Ouvrir mon espace →"}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function personaFirstAction(p: Persona | null, isEn: boolean): string {
  // Send users to the most relevant first action by persona.
  if (!p) return "/dashboard";
  switch (p) {
    case "agency":
    case "expat":
    case "student":
    case "cruise":
      // These benefit most from the Coach.
      return "/dashboard/coach/new";
    case "blog":
    case "creator":
    case "visa":
    case "other":
    default:
      // These benefit from the link generator first.
      return "/dashboard/links";
  }
}

function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <ol className="flex items-center gap-2 mb-10">
      {Array.from({ length: total }, (_, i) => i + 1).map((i) => (
        <li
          key={i}
          className={`h-1.5 flex-1 rounded-full transition-colors ${
            i <= step ? "bg-brand-500" : "bg-surface-200"
          }`}
        />
      ))}
    </ol>
  );
}

function Step1({
  isEn,
  personas,
  selected,
  onSelect,
}: {
  isEn: boolean;
  personas: { id: Persona; label: string; sub: string; icon: string }[];
  selected: Persona | null;
  onSelect: (p: Persona) => void;
}) {
  return (
    <div>
      <span className="inline-block text-xs font-semibold uppercase tracking-wider text-brand-700">
        {isEn ? "Step 1 / 3" : "Étape 1 / 3"}
      </span>
      <h1 className="mt-3 text-3xl lg:text-4xl font-bold tracking-tight">
        {isEn
          ? "Which kind of partner are you?"
          : "Quel type de partenaire êtes-vous ?"}
      </h1>
      <p className="mt-3 text-ink-700 max-w-2xl">
        {isEn
          ? "We'll tailor the onboarding and your first action. Every Atlas tool — link generator, Coach, contracts, payouts — is available to everyone, regardless of profile."
          : "On adapte l'onboarding et votre première action. Tous les outils Atlas — générateur de liens, Coach, contrats, paiements — sont accessibles à tout le monde, peu importe votre profil."}
      </p>
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {personas.map((p) => {
          const on = selected === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelect(p.id)}
              className={`group flex items-start gap-4 rounded-2xl border-2 px-5 py-4 text-left transition-all ${
                on
                  ? "border-brand-500 bg-brand-50 shadow-sm"
                  : "border-surface-200 bg-white hover:border-brand-300 hover:-translate-y-0.5 hover:shadow-md"
              }`}
            >
              <span className="text-2xl">{p.icon}</span>
              <span className="flex-1">
                <span className="block font-semibold text-ink-900">
                  {p.label}
                </span>
                <span className="block text-sm text-ink-500 mt-0.5">{p.sub}</span>
              </span>
              <span
                className={`h-5 w-5 rounded-full border-2 transition-colors ${
                  on
                    ? "border-brand-500 bg-brand-500"
                    : "border-surface-300 group-hover:border-brand-300"
                }`}
              >
                {on && (
                  <svg viewBox="0 0 16 16" className="text-white" aria-hidden>
                    <path
                      d="M3 8.5l3 3 6-6.5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  </svg>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Step2({
  isEn,
  state,
  setState,
  accent,
}: {
  isEn: boolean;
  state: State;
  setState: (s: State) => void;
  accent: string;
}) {
  return (
    <div>
      <span className="inline-block text-xs font-semibold uppercase tracking-wider text-brand-700">
        {isEn ? "Step 2 / 3" : "Étape 2 / 3"}
      </span>
      <h1 className="mt-3 text-3xl lg:text-4xl font-bold tracking-tight">
        {isEn ? "Set your brand" : "Posez votre marque"}
      </h1>
      <p className="mt-3 text-ink-700 max-w-2xl">
        {isEn
          ? "These details appear on the recap sheet you hand (or email) to your client at the end of a Coach analysis. Editable later in Settings."
          : "Ces éléments apparaissent en haut du récap que vous remettez (ou envoyez) à votre client après une analyse Coach. Modifiables plus tard dans les paramètres."}
      </p>

      <div className="mt-8 rounded-2xl border border-surface-200 bg-white p-6 lg:p-8 space-y-5">
        <Field label={isEn ? "Brand / display name" : "Nom commercial"}>
          <input
            value={state.agencyName}
            onChange={(e) => setState({ ...state, agencyName: e.target.value })}
            placeholder={
              isEn ? "e.g. Voyages Évasion" : "Ex : Voyages Évasion"
            }
            className={inputCls}
          />
        </Field>
        <Field label={isEn ? "Tagline (optional)" : "Baseline (optionnel)"}>
          <input
            value={state.agencyTagline}
            onChange={(e) =>
              setState({ ...state, agencyTagline: e.target.value })
            }
            placeholder={
              isEn
                ? "e.g. Tailored travel since 2008"
                : "Ex : Conseil personnalisé depuis 2008"
            }
            className={inputCls}
          />
        </Field>
        <Field
          label={isEn ? "Logo URL (optional)" : "URL du logo (optionnel)"}
          hint={
            isEn
              ? "Direct link to a PNG/SVG, ideally on transparent background."
              : "Lien direct vers un PNG/SVG, idéalement sur fond transparent."
          }
        >
          <input
            type="url"
            value={state.agencyLogoUrl}
            onChange={(e) =>
              setState({ ...state, agencyLogoUrl: e.target.value })
            }
            placeholder="https://…/logo.svg"
            className={inputCls}
          />
        </Field>
        <Field label={isEn ? "Brand color" : "Couleur de marque"}>
          <div className="flex gap-3 items-center">
            <input
              value={state.agencyBrandColor}
              onChange={(e) =>
                setState({ ...state, agencyBrandColor: e.target.value })
              }
              className={`${inputCls} font-mono`}
              placeholder="#563BFF"
            />
            <input
              type="color"
              value={state.agencyBrandColor}
              onChange={(e) =>
                setState({ ...state, agencyBrandColor: e.target.value })
              }
              className="h-11 w-12 rounded-xl border border-surface-300 cursor-pointer"
            />
          </div>
        </Field>
      </div>

      {/* Live preview */}
      <div className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-500 mb-2">
          {isEn ? "Live preview" : "Aperçu en direct"}
        </p>
        <div
          className="rounded-2xl px-6 py-5 text-white shadow-md"
          style={{
            background: `linear-gradient(135deg, ${accent} 0%, #1E1863 100%)`,
          }}
        >
          <div className="flex items-center gap-4">
            {state.agencyLogoUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={state.agencyLogoUrl}
                alt={state.agencyName}
                className="h-10 w-auto bg-white rounded p-1"
              />
            ) : (
              <div className="h-10 w-10 rounded-lg bg-white/15 flex items-center justify-center font-bold">
                {(state.agencyName || "·").slice(0, 1).toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-lg font-bold leading-tight">
                {state.agencyName || (isEn ? "Your brand" : "Votre marque")}
              </p>
              {state.agencyTagline && (
                <p className="text-white/70 text-xs mt-0.5">
                  {state.agencyTagline}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Step3({
  isEn,
  persona,
  accent,
}: {
  isEn: boolean;
  persona: Persona | null;
  accent: string;
}) {
  // Suggest first action by persona.
  const suggestion = personaSuggestion(persona, isEn);

  return (
    <div>
      <span className="inline-block text-xs font-semibold uppercase tracking-wider text-brand-700">
        {isEn ? "Step 3 / 3" : "Étape 3 / 3"}
      </span>
      <h1 className="mt-3 text-3xl lg:text-4xl font-bold tracking-tight">
        {isEn ? "Your first move" : "Votre premier pas"}
      </h1>
      <p className="mt-3 text-ink-700 max-w-2xl">
        {isEn
          ? "We'll drop you straight into the action that gives you a sense of value within 60 seconds. You can always come back to the others from your dashboard."
          : "On vous emmène directement à l'action qui vous donnera un retour concret en moins de 60 secondes. Les autres outils restent accessibles depuis le dashboard."}
      </p>

      <div
        className="mt-8 rounded-3xl p-8 lg:p-10 text-white relative overflow-hidden shadow-md"
        style={{ background: `linear-gradient(135deg, ${accent} 0%, #1E1863 100%)` }}
      >
        <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="relative">
          <p className="text-[0.65rem] uppercase tracking-wider text-white/70 font-bold">
            {isEn ? "Recommended for you" : "Pour vous"}
          </p>
          <h2 className="mt-2 text-2xl lg:text-3xl font-bold leading-tight">
            {suggestion.title}
          </h2>
          <p className="mt-3 text-white/85 leading-relaxed max-w-xl">
            {suggestion.body}
          </p>
        </div>
      </div>

      <ul className="mt-8 grid gap-3 sm:grid-cols-2">
        <FeatureBadge
          title={isEn ? "Tracked links" : "Liens traqués"}
          body={isEn ? "Deep links + Sub-ID" : "Deep-links + Sub-ID"}
        />
        <FeatureBadge
          title="Coach"
          body={
            isEn
              ? "Coverage gap analyzer for any client"
              : "Analyseur d'écarts pour n'importe quel client"
          }
        />
        <FeatureBadge
          title={isEn ? "My contracts" : "Mes contrats"}
          body={isEn ? "Distribute your own product" : "Distribuez votre produit"}
        />
        <FeatureBadge
          title={isEn ? "Payouts" : "Paiements"}
          body={isEn ? "Up to 20% recurring commission" : "Jusqu'à 20 % de commission récurrente"}
        />
      </ul>
    </div>
  );
}

function personaSuggestion(p: Persona | null, isEn: boolean) {
  switch (p) {
    case "agency":
    case "expat":
    case "student":
    case "cruise":
      return {
        title: isEn
          ? "Run your first Coach analysis in 90 seconds"
          : "Lancez votre première analyse Coach en 90 secondes",
        body: isEn
          ? "Show a client what their card insurance, top-up and social security really cover — then where Atlas closes the gap. The output is brandable to your colors."
          : "Montrez à un client ce que sa carte, sa mutuelle et sa sécu couvrent vraiment — et où Atlas ferme le trou. Le récap est aux couleurs de votre marque.",
      };
    case "blog":
    case "creator":
      return {
        title: isEn
          ? "Generate your first tracked link"
          : "Générez votre premier lien traqué",
        body: isEn
          ? "Pick a destination page, add a Sub-ID for your article or story, and we hand you a link with 90-day attribution and recurring commission baked in."
          : "Choisissez une page de destination, ajoutez un Sub-ID pour votre article ou story, et on vous remet un lien avec attribution 90 jours et commission récurrente.",
      };
    case "visa":
      return {
        title: isEn
          ? "Plug Atlas into your visa funnel"
          : "Branchez Atlas sur votre funnel visa",
        body: isEn
          ? "Generate a link to the right visa-ready page (Schengen, working holiday, student) and have your visitors leave with a compliant certificate within 90 seconds."
          : "Générez un lien vers la bonne page visa-ready (Schengen, PVT, étudiant) et faites repartir vos visiteurs avec une attestation conforme en 90 secondes.",
      };
    default:
      return {
        title: isEn
          ? "Pick your tool — Atlas adapts to your workflow"
          : "Choisissez votre outil — Atlas s'adapte à votre flux",
        body: isEn
          ? "Tracked links, Coach, contracts, payouts: every tool is unlocked from day one."
          : "Liens traqués, Coach, contrats, paiements : tous les outils sont débloqués dès le premier jour.",
      };
  }
}

function FeatureBadge({ title, body }: { title: string; body: string }) {
  return (
    <li className="rounded-2xl border border-surface-200 bg-white px-4 py-3">
      <p className="font-semibold text-ink-900">{title}</p>
      <p className="text-sm text-ink-500 mt-0.5">{body}</p>
    </li>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-semibold text-ink-900 mb-1">
        {label}
      </span>
      {hint && <span className="block text-xs text-ink-500 mb-1.5">{hint}</span>}
      {children}
    </label>
  );
}

const inputCls =
  "w-full rounded-xl border border-surface-300 bg-white px-3.5 h-11 text-[0.95rem] focus-ring focus:border-brand-500";
