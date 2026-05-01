"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";

type Contract = {
  id: string;
  name: string;
  issuer: string | null;
  source: "seed" | "manual" | "imported" | "payload";
  active: boolean;
  notes: string | null;
  updatedAt: string;
};

export function ContractsList() {
  const locale = useLocale();
  const isEn = locale === "en";
  const [items, setItems] = useState<Contract[] | null>(null);

  useEffect(() => {
    fetch("/api/coach/contracts", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setItems(d.contracts ?? []));
  }, []);

  return (
    <div className="max-w-5xl space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">
            {isEn ? "Coach · contracts" : "Coach · contrats"}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            {isEn ? "Your distributed contracts" : "Vos contrats distribués"}
          </h1>
          <p className="mt-2 text-ink-700 max-w-2xl">
            {isEn
              ? "Configure each contract you currently distribute. The Coach picks them up as one of the coverage sources to compare against the traveler's existing protection."
              : "Configurez chaque contrat que vous distribuez aujourd'hui. Le Coach les utilise comme l'une des sources de couverture pour comparer avec la protection actuelle du voyageur."}
          </p>
        </div>
        <Link
          href={"/dashboard/coach/contracts/new" as never}
          className="h-11 px-5 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 inline-flex items-center"
        >
          + {isEn ? "New contract" : "Nouveau contrat"}
        </Link>
      </header>

      {!items && (
        <div className="flex items-center justify-center py-20">
          <div className="h-6 w-6 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
        </div>
      )}

      {items && items.length === 0 && (
        <div className="rounded-2xl border border-dashed border-surface-300 bg-surface-50 px-8 py-12 text-center">
          <p className="text-ink-700">
            {isEn
              ? "No contracts yet. Add one to get the Coach to compare it against the traveler's stack."
              : "Aucun contrat pour l'instant. Ajoutez-en un pour que le Coach le compare avec la couverture du voyageur."}
          </p>
        </div>
      )}

      {items && items.length > 0 && (
        <ul className="grid gap-4 md:grid-cols-2">
          {items.map((c) => (
            <li
              key={c.id}
              className="rounded-2xl border border-surface-200 bg-white p-5 hover:border-brand-300 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm uppercase tracking-wider text-ink-500 font-semibold">
                    {c.issuer ?? "—"}
                  </p>
                  <h3 className="mt-1 text-lg font-bold leading-tight truncate">
                    {c.name}
                  </h3>
                </div>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold ${
                    c.active
                      ? "bg-success-50 text-success-600"
                      : "bg-surface-100 text-ink-500"
                  }`}
                >
                  {c.active ? (isEn ? "Active" : "Actif") : isEn ? "Inactive" : "Inactif"}
                </span>
              </div>
              <p className="mt-3 text-xs text-ink-500">
                {isEn ? "Source" : "Source"}: {c.source}
              </p>
              <div className="mt-4 flex gap-2">
                <Link
                  href={`/dashboard/coach/contracts/${c.id}` as never}
                  className="text-sm font-semibold text-brand-700 hover:underline"
                >
                  {isEn ? "Edit" : "Modifier"} →
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
