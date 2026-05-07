"use client";

import { useTranslations } from "next-intl";
import { type Persona, personaSuggestionSlot } from "./personas";
import { FeatureBadge } from "./ui";

export function Step3FirstMove({
  persona,
  accent,
}: {
  persona: Persona | null;
  accent: string;
}) {
  const t = useTranslations("onboarding.step3");
  const slot = personaSuggestionSlot(persona);

  return (
    <div>
      <span className="inline-block text-xs font-semibold uppercase tracking-wider text-brand-700">
        {t("label")}
      </span>
      <h1 className="mt-3 text-3xl lg:text-4xl font-bold tracking-tight">
        {t("title")}
      </h1>
      <p className="mt-3 text-ink-700 max-w-2xl">{t("subtitle")}</p>

      <div
        className="mt-8 rounded-3xl p-8 lg:p-10 text-white relative overflow-hidden shadow-md"
        style={{
          background: `linear-gradient(135deg, ${accent} 0%, #1E1863 100%)`,
        }}
      >
        <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="relative">
          <p className="text-[0.65rem] uppercase tracking-wider text-white/70 font-bold">
            {t("recommendedFor")}
          </p>
          <h2 className="mt-2 text-2xl lg:text-3xl font-bold leading-tight">
            {t(`suggestions.${slot}.title`)}
          </h2>
          <p className="mt-3 text-white/85 leading-relaxed max-w-xl">
            {t(`suggestions.${slot}.body`)}
          </p>
        </div>
      </div>

      <ul className="mt-8 grid gap-3 sm:grid-cols-2">
        <FeatureBadge
          title={t("features.links.title")}
          body={t("features.links.body")}
        />
        <FeatureBadge
          title={t("features.coach.title")}
          body={t("features.coach.body")}
        />
        <FeatureBadge
          title={t("features.contracts.title")}
          body={t("features.contracts.body")}
        />
        <FeatureBadge
          title={t("features.payouts.title")}
          body={t("features.payouts.body")}
        />
      </ul>
    </div>
  );
}
