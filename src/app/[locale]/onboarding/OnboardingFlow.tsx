"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { Logo } from "@/components/ui/Logo";
import {
  type Persona,
  PERSONAS_EN,
  PERSONAS_FR,
  personaFirstAction,
} from "./_onboarding/personas";
import { ProgressBar } from "./_onboarding/ui";
import { Step1Persona } from "./_onboarding/Step1Persona";
import { Step2Brand, type BrandState } from "./_onboarding/Step2Brand";
import { Step3FirstMove } from "./_onboarding/Step3FirstMove";

type State = BrandState & { persona: Persona | null };

/**
 * 3-step onboarding flow that runs after signup. Picks a persona, sets the
 * white-label brand, and lands the partner on the right first action. Each
 * step is its own component under _onboarding/.
 */
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
      const target = personaFirstAction(state.persona);
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
            <Step1Persona
              isEn={isEn}
              personas={personas}
              selected={state.persona}
              onSelect={(p) => setState({ ...state, persona: p })}
            />
          )}

          {step === 2 && (
            <Step2Brand
              isEn={isEn}
              state={state}
              setState={(patch) => setState({ ...state, ...patch })}
              accent={accent}
            />
          )}

          {step === 3 && (
            <Step3FirstMove isEn={isEn} persona={state.persona} accent={accent} />
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
