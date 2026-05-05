"use client";

import type { Persona, PersonaCard } from "./personas";

export function Step1Persona({
  isEn,
  personas,
  selected,
  onSelect,
}: {
  isEn: boolean;
  personas: PersonaCard[];
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
