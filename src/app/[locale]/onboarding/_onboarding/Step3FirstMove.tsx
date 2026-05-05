"use client";

import { type Persona, personaSuggestion } from "./personas";
import { FeatureBadge } from "./ui";

export function Step3FirstMove({
  isEn,
  persona,
  accent,
}: {
  isEn: boolean;
  persona: Persona | null;
  accent: string;
}) {
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
        style={{
          background: `linear-gradient(135deg, ${accent} 0%, #1E1863 100%)`,
        }}
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
          body={
            isEn
              ? "Up to 20% recurring commission"
              : "Jusqu'à 20 % de commission récurrente"
          }
        />
      </ul>
    </div>
  );
}
