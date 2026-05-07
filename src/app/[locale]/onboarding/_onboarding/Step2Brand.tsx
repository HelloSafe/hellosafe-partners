"use client";

import { useTranslations } from "next-intl";
import { Field, inputCls } from "./ui";

/** Mutable state held by the parent OnboardingFlow. */
export type BrandState = {
  agencyName: string;
  agencyTagline: string;
  agencyLogoUrl: string;
  agencyBrandColor: string;
};

export function Step2Brand({
  state,
  setState,
  accent,
}: {
  state: BrandState;
  setState: (patch: Partial<BrandState>) => void;
  accent: string;
}) {
  const t = useTranslations("onboarding.step2");

  return (
    <div>
      <span className="inline-block text-xs font-semibold uppercase tracking-wider text-brand-700">
        {t("label")}
      </span>
      <h1 className="mt-3 text-3xl lg:text-4xl font-bold tracking-tight">
        {t("title")}
      </h1>
      <p className="mt-3 text-ink-700 max-w-2xl">{t("subtitle")}</p>

      <div className="mt-8 rounded-2xl border border-surface-200 bg-white p-6 lg:p-8 space-y-5">
        <Field label={t("fields.name")}>
          <input
            value={state.agencyName}
            onChange={(e) => setState({ agencyName: e.target.value })}
            placeholder={t("fields.namePlaceholder")}
            className={inputCls}
          />
        </Field>
        <Field label={t("fields.tagline")}>
          <input
            value={state.agencyTagline}
            onChange={(e) => setState({ agencyTagline: e.target.value })}
            placeholder={t("fields.taglinePlaceholder")}
            className={inputCls}
          />
        </Field>
        <Field label={t("fields.logo")} hint={t("fields.logoHint")}>
          <input
            type="url"
            value={state.agencyLogoUrl}
            onChange={(e) => setState({ agencyLogoUrl: e.target.value })}
            placeholder="https://…/logo.svg"
            className={inputCls}
          />
        </Field>
        <Field label={t("fields.color")}>
          <div className="flex gap-3 items-center">
            <input
              value={state.agencyBrandColor}
              onChange={(e) => setState({ agencyBrandColor: e.target.value })}
              className={`${inputCls} font-mono`}
              placeholder="#563BFF"
            />
            <input
              type="color"
              value={state.agencyBrandColor}
              onChange={(e) => setState({ agencyBrandColor: e.target.value })}
              className="h-11 w-12 rounded-xl border border-surface-300 cursor-pointer"
            />
          </div>
        </Field>
      </div>

      {/* Live preview */}
      <div className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-500 mb-2">
          {t("preview.label")}
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
                {state.agencyName || t("preview.placeholder")}
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
