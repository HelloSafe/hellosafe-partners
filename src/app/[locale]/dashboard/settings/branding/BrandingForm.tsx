"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";

type Branding = {
  agencyName: string;
  agencyLogoUrl: string | null;
  agencyBrandColor: string;
  agencyTagline: string | null;
};

export function BrandingForm() {
  const locale = useLocale();
  const isEn = locale === "en";
  const [data, setData] = useState<Branding | null>(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/account/branding", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setData(d.branding));
  }, []);

  if (!data) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  const save = async () => {
    setBusy(true);
    setSaved(false);
    try {
      const res = await fetch("/api/account/branding", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) setSaved(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">
          {isEn ? "Settings" : "Paramètres"}
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          {isEn ? "Agency branding" : "Identité de l'agence"}
        </h1>
        <p className="mt-2 text-ink-700">
          {isEn
            ? "These details appear at the top of every Coach analysis sheet you give to your clients."
            : "Ces éléments apparaissent en haut de chaque analyse Coach que vous remettez à vos clients."}
        </p>
      </header>

      <div className="rounded-2xl border border-surface-200 bg-white p-6 lg:p-8 space-y-6">
        <Field label={isEn ? "Agency name" : "Nom commercial"}>
          <input
            value={data.agencyName}
            onChange={(e) => setData({ ...data, agencyName: e.target.value })}
            className={inputCls}
            placeholder={isEn ? "e.g. Voyages Évasion" : "Ex : Voyages Évasion"}
          />
        </Field>
        <Field label={isEn ? "Tagline" : "Baseline"}>
          <input
            value={data.agencyTagline ?? ""}
            onChange={(e) =>
              setData({ ...data, agencyTagline: e.target.value || null })
            }
            placeholder={
              isEn
                ? "e.g. Tailored travel, since 2008"
                : "Ex : Conseil personnalisé depuis 2008"
            }
            className={inputCls}
          />
        </Field>
        <Field
          label={isEn ? "Logo URL" : "URL du logo"}
          hint={
            isEn
              ? "Direct URL to a PNG/SVG logo, ideally on transparent background."
              : "URL directe vers un logo PNG/SVG, idéalement sur fond transparent."
          }
        >
          <input
            type="url"
            value={data.agencyLogoUrl ?? ""}
            onChange={(e) =>
              setData({ ...data, agencyLogoUrl: e.target.value || null })
            }
            placeholder="https://…/logo.svg"
            className={inputCls}
          />
        </Field>
        <Field label={isEn ? "Brand color (hex)" : "Couleur de marque (hex)"}>
          <div className="flex gap-3 items-center">
            <input
              value={data.agencyBrandColor}
              onChange={(e) =>
                setData({ ...data, agencyBrandColor: e.target.value })
              }
              className={`${inputCls} font-mono`}
              placeholder="#563bff"
            />
            <input
              type="color"
              value={data.agencyBrandColor}
              onChange={(e) =>
                setData({ ...data, agencyBrandColor: e.target.value })
              }
              className="h-11 w-11 rounded-lg border border-surface-300 cursor-pointer"
            />
          </div>
        </Field>

        {/* Live preview */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-500 mb-2">
            {isEn ? "Live preview" : "Aperçu en direct"}
          </p>
          <div
            className="rounded-2xl px-6 py-5 text-white"
            style={{
              background: `linear-gradient(135deg, ${data.agencyBrandColor} 0%, #0b1031 100%)`,
            }}
          >
            <div className="flex items-center gap-4">
              {data.agencyLogoUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={data.agencyLogoUrl}
                  alt={data.agencyName}
                  className="h-10 w-auto bg-white rounded p-1"
                />
              ) : (
                <div className="h-10 w-10 rounded-lg bg-white/15 flex items-center justify-center font-bold">
                  {(data.agencyName ?? "·").slice(0, 1).toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-lg font-bold leading-tight">
                  {data.agencyName}
                </p>
                {data.agencyTagline && (
                  <p className="text-white/70 text-xs mt-0.5">
                    {data.agencyTagline}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={save}
          disabled={busy}
          className="h-11 px-6 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 disabled:opacity-50"
        >
          {busy
            ? isEn
              ? "Saving…"
              : "Enregistrement…"
            : isEn
            ? "Save branding"
            : "Enregistrer"}{" "}
          →
        </button>
        {saved && (
          <span className="text-sm text-success-600 font-semibold">
            ✓ {isEn ? "Saved" : "Enregistré"}
          </span>
        )}
      </div>
    </div>
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
  "w-full rounded-lg border border-surface-300 bg-white px-3.5 h-11 text-[0.95rem] focus-ring focus:border-brand-500";
