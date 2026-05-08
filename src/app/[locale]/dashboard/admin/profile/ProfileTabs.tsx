"use client";

import { useState } from "react";
import { BrandingForm } from "../../settings/branding/BrandingForm";
import { SoonPlaceholder } from "../../_shared/SoonPlaceholder";

type Tab = "account" | "brand" | "company" | "notifications";

const TABS: { id: Tab; label: string }[] = [
  { id: "account", label: "Compte" },
  { id: "brand", label: "Marque" },
  { id: "company", label: "Société" },
  { id: "notifications", label: "Notifications" },
];

export function ProfileTabs() {
  const [active, setActive] = useState<Tab>(() => {
    if (typeof window === "undefined") return "account";
    const url = new URL(window.location.href);
    const t = url.searchParams.get("tab") as Tab | null;
    return TABS.some((x) => x.id === t) ? (t as Tab) : "account";
  });

  const setTab = (t: Tab) => {
    setActive(t);
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    url.searchParams.set("tab", t);
    window.history.replaceState({}, "", url.toString());
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-ink-900">
        Mon profil
      </h1>
      <p className="mt-2 text-ink-700">
        Vos informations personnelles, votre marque agence et les coordonnées
        société utilisées pour la facturation.
      </p>

      <nav
        className="mt-8 flex gap-1 border-b border-surface-200"
        role="tablist"
      >
        {TABS.map((t) => {
          const on = active === t.id;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={on}
              onClick={() => setTab(t.id)}
              className={`px-4 h-10 text-sm font-medium transition-colors border-b-2 -mb-[2px] ${
                on
                  ? "border-brand-500 text-brand-700"
                  : "border-transparent text-ink-700 hover:text-brand-700"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </nav>

      <div className="mt-8">
        {active === "account" && (
          <SoonPlaceholder
            title="Compte"
            pitch="Modifier votre nom, e-mail, mot de passe et langue de l'interface. Pour l'instant, contactez-nous pour ces changements."
          />
        )}
        {active === "brand" && <BrandingForm />}
        {active === "company" && (
          <SoonPlaceholder
            title="Société"
            pitch="Raison sociale, SIREN/TVA, adresse de facturation. Ces informations apparaissent sur vos factures et nos relevés de commissions."
          />
        )}
        {active === "notifications" && (
          <SoonPlaceholder
            title="Notifications"
            pitch="Préférences e-mail : nouvelle conversion, paiement, nouveautés produit. Activez ou coupez chaque type de message."
          />
        )}
      </div>
    </div>
  );
}
