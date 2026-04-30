"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import type { CoverageData, RelativeKind } from "@/lib/coverage-types";

const RELATIVE_OPTIONS: RelativeKind[] = [
  "self",
  "spouse_legal",
  "concubin",
  "children_under_25",
  "children_over_25",
  "parents",
  "friends",
];

const DEFAULT_DATA: CoverageData = {
  limits: {
    medical_expenses: {
      unlimited: false,
      amount: { cents: 250_000_00, currency: "EUR" },
    },
    repatriation: { covered: true, actualCosts: true },
    trip_cancellation: {
      cents: 8_000_00,
      currency: "EUR",
      perPerson: true,
      allCauses: true,
    },
    baggage: { cents: 2_000_00, currency: "EUR" },
    personal_liability: { cents: 4_500_000_00, currency: "EUR" },
    trip_delay: { cents: 500_00, currency: "EUR", afterHours: 4 },
    rental_car_excess: { cents: 0, currency: "EUR" },
    winter_sports: { covered: true, cap: { cents: 5_000_00, currency: "EUR" } },
  },
  constraints: {
    maxTripDurationDays: 60,
    maxAgeYears: 80,
    geographicalZone: "worldwide",
  },
  coveredRelatives: ["self", "spouse_legal", "children_under_25"],
  excludedRelatives: ["concubin", "children_over_25", "parents", "friends"],
  keyExclusions: [],
};

export function ContractEditor({
  mode,
  id,
}: {
  mode: "create" | "edit";
  id?: string;
}) {
  const locale = useLocale();
  const isEn = locale === "en";
  const router = useRouter();

  const [name, setName] = useState("");
  const [issuer, setIssuer] = useState("");
  const [notes, setNotes] = useState("");
  const [active, setActive] = useState(true);
  const [data, setData] = useState<CoverageData>(DEFAULT_DATA);
  const [busy, setBusy] = useState(false);
  const [importText, setImportText] = useState("");
  const [importing, setImporting] = useState(false);
  const [importedNotice, setImportedNotice] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(mode === "create");

  useEffect(() => {
    if (mode === "edit" && id) {
      fetch(`/api/coach/contracts/${id}`, { cache: "no-store" })
        .then((r) => r.json())
        .then((d) => {
          if (d.contract) {
            setName(d.contract.name);
            setIssuer(d.contract.issuer ?? "");
            setNotes(d.contract.notes ?? "");
            setActive(d.contract.active);
            setData(d.contract.data as CoverageData);
          }
          setLoaded(true);
        });
    }
  }, [mode, id]);

  if (!loaded) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  const submit = async () => {
    setBusy(true);
    try {
      const url = mode === "create"
        ? "/api/coach/contracts"
        : `/api/coach/contracts/${id}`;
      const method = mode === "create" ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, issuer, notes, active, data }),
      });
      if (res.ok) {
        router.push("/dashboard/coach/contracts" as never);
      }
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!id) return;
    if (!confirm(isEn ? "Delete this contract?" : "Supprimer ce contrat ?")) return;
    await fetch(`/api/coach/contracts/${id}`, { method: "DELETE" });
    router.push("/dashboard/coach/contracts" as never);
  };

  const importFromText = async () => {
    if (!importText.trim()) return;
    setImporting(true);
    setImportedNotice(null);
    try {
      const res = await fetch("/api/coach/contracts/extract", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: importText }),
      });
      const d = await res.json();
      if (d.ok) {
        if (!name) setName(d.suggestedName ?? "");
        if (!issuer && d.suggestedIssuer) setIssuer(d.suggestedIssuer);
        setData(d.data);
        setImportedNotice(d.notice);
      }
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={"/dashboard/coach/contracts" as never}
          className="text-sm text-ink-700 hover:text-brand-700"
        >
          ← {isEn ? "Back to contracts" : "Retour aux contrats"}
        </Link>
      </div>

      <header>
        <h1 className="text-3xl font-bold tracking-tight">
          {mode === "create"
            ? isEn
              ? "New agency contract"
              : "Nouveau contrat agence"
            : isEn
            ? "Edit contract"
            : "Modifier le contrat"}
        </h1>
        <p className="mt-2 text-ink-700">
          {isEn
            ? "Used by the Coach as the fourth coverage source. Numeric amounts in euros."
            : "Utilisé par le Coach comme quatrième source de couverture. Montants en euros."}
        </p>
      </header>

      {/* Quick import */}
      <section className="rounded-2xl border border-surface-200 bg-surface-50 p-5">
        <h2 className="font-semibold text-ink-900">
          {isEn ? "Import from contract text (mock)" : "Importer depuis le texte du contrat (mock)"}
        </h2>
        <p className="mt-1 text-sm text-ink-500">
          {isEn
            ? "Paste the general conditions of your contract. We'll pre-fill the form. You'll review and validate every value."
            : "Collez les conditions générales de votre contrat. On pré-remplit le formulaire. Vous vérifiez et validez chaque valeur."}
        </p>
        <textarea
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          rows={4}
          placeholder={isEn ? "Paste contract terms here…" : "Coller le texte du contrat ici…"}
          className="mt-3 w-full rounded-lg border border-surface-300 px-3 py-2 text-sm font-mono"
        />
        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            disabled={importing || importText.trim().length < 30}
            onClick={importFromText}
            className="h-9 px-4 rounded-lg border border-brand-500 text-brand-700 text-sm font-semibold hover:bg-brand-50 disabled:opacity-50"
          >
            {importing ? (isEn ? "Extracting…" : "Extraction…") : isEn ? "Pre-fill from text" : "Pré-remplir depuis le texte"}
          </button>
          {importedNotice && (
            <span className="text-xs text-warning-600">{importedNotice}</span>
          )}
        </div>
      </section>

      {/* Form */}
      <section className="rounded-2xl border border-surface-200 bg-white p-6 lg:p-8 space-y-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={isEn ? "Contract name" : "Nom du contrat"}>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label={isEn ? "Issuer / underwriter" : "Assureur émetteur"}>
            <input
              value={issuer}
              onChange={(e) => setIssuer(e.target.value)}
              placeholder="AXA, Allianz, Mutuaide…"
              className={inputCls}
            />
          </Field>
        </div>

        <details className="rounded-xl border border-surface-200 p-4 group" open>
          <summary className="font-semibold cursor-pointer">
            {isEn ? "Coverage limits" : "Plafonds garanties"}
          </summary>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <NumberField
              label={isEn ? "Medical expenses (€)" : "Frais médicaux (€)"}
              value={
                data.limits.medical_expenses && !data.limits.medical_expenses.unlimited
                  ? data.limits.medical_expenses.amount.cents / 100
                  : 0
              }
              onChange={(v) =>
                setData({
                  ...data,
                  limits: {
                    ...data.limits,
                    medical_expenses: {
                      unlimited: false,
                      amount: { cents: Math.round(v * 100), currency: "EUR" },
                    },
                  },
                })
              }
            />
            <NumberField
              label={isEn ? "Trip cancellation (€)" : "Annulation (€)"}
              value={(data.limits.trip_cancellation?.cents ?? 0) / 100}
              onChange={(v) =>
                setData({
                  ...data,
                  limits: {
                    ...data.limits,
                    trip_cancellation: {
                      ...(data.limits.trip_cancellation ?? {
                        currency: "EUR",
                        cents: 0,
                      }),
                      cents: Math.round(v * 100),
                      currency: "EUR",
                    },
                  },
                })
              }
            />
            <NumberField
              label={isEn ? "Baggage (€)" : "Bagages (€)"}
              value={(data.limits.baggage?.cents ?? 0) / 100}
              onChange={(v) =>
                setData({
                  ...data,
                  limits: {
                    ...data.limits,
                    baggage: { cents: Math.round(v * 100), currency: "EUR" },
                  },
                })
              }
            />
            <NumberField
              label={isEn ? "Personal liability (€)" : "Responsabilité civile (€)"}
              value={(data.limits.personal_liability?.cents ?? 0) / 100}
              onChange={(v) =>
                setData({
                  ...data,
                  limits: {
                    ...data.limits,
                    personal_liability: {
                      cents: Math.round(v * 100),
                      currency: "EUR",
                    },
                  },
                })
              }
            />
            <CheckboxField
              label={isEn ? "Repatriation covered" : "Rapatriement couvert"}
              checked={data.limits.repatriation?.covered ?? false}
              onChange={(c) =>
                setData({
                  ...data,
                  limits: {
                    ...data.limits,
                    repatriation: { covered: c, actualCosts: c },
                  },
                })
              }
            />
            <CheckboxField
              label={isEn ? "Winter sports covered" : "Sports d'hiver couverts"}
              checked={data.limits.winter_sports?.covered ?? false}
              onChange={(c) =>
                setData({
                  ...data,
                  limits: {
                    ...data.limits,
                    winter_sports: c
                      ? { covered: true, cap: { cents: 5_000_00, currency: "EUR" } }
                      : { covered: false },
                  },
                })
              }
            />
          </div>
        </details>

        <details className="rounded-xl border border-surface-200 p-4">
          <summary className="font-semibold cursor-pointer">
            {isEn ? "Constraints" : "Contraintes"}
          </summary>
          <div className="mt-5 grid gap-5 sm:grid-cols-3">
            <NumberField
              label={isEn ? "Max trip duration (days)" : "Durée max (jours)"}
              value={data.constraints.maxTripDurationDays ?? 0}
              onChange={(v) =>
                setData({
                  ...data,
                  constraints: { ...data.constraints, maxTripDurationDays: v },
                })
              }
            />
            <NumberField
              label={isEn ? "Max traveler age" : "Âge max du voyageur"}
              value={data.constraints.maxAgeYears ?? 0}
              onChange={(v) =>
                setData({
                  ...data,
                  constraints: { ...data.constraints, maxAgeYears: v },
                })
              }
            />
            <Field
              label={
                isEn
                  ? "Geographical zone"
                  : "Zone géographique"
              }
              hint={
                isEn
                  ? '"worldwide" or "worldwide_excluding_us_canada"'
                  : '« worldwide » ou « worldwide_excluding_us_canada »'
              }
            >
              <select
                value={data.constraints.geographicalZone ?? "worldwide"}
                onChange={(e) =>
                  setData({
                    ...data,
                    constraints: {
                      ...data.constraints,
                      geographicalZone: e.target.value,
                    },
                  })
                }
                className={inputCls}
              >
                <option value="worldwide">worldwide</option>
                <option value="worldwide_excluding_us_canada">
                  worldwide excl. US/Canada
                </option>
                <option value="EU+EHIC">EU + EHIC only</option>
              </select>
            </Field>
          </div>
        </details>

        <details className="rounded-xl border border-surface-200 p-4">
          <summary className="font-semibold cursor-pointer">
            {isEn ? "Companions covered" : "Proches couverts"}
          </summary>
          <p className="mt-2 text-xs text-ink-500">
            {isEn
              ? "Pick everyone the contract explicitly covers. Anyone unchecked will be flagged as not covered when the agent runs an analysis."
              : "Cochez chaque proche que le contrat couvre explicitement. Les non-cochés seront signalés non couverts dans l'analyse."}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {RELATIVE_OPTIONS.map((r) => {
              const on = data.coveredRelatives.includes(r);
              return (
                <button
                  type="button"
                  key={r}
                  onClick={() => {
                    const next = on
                      ? data.coveredRelatives.filter((x) => x !== r)
                      : [...data.coveredRelatives, r];
                    setData({ ...data, coveredRelatives: next });
                  }}
                  className={`rounded-lg border px-3 h-9 text-sm font-medium transition-colors ${
                    on
                      ? "border-brand-500 bg-brand-50 text-brand-700"
                      : "border-surface-300 text-ink-700"
                  }`}
                >
                  {on ? "✓ " : ""}
                  {r.replace(/_/g, " ")}
                </button>
              );
            })}
          </div>
        </details>

        <Field label={isEn ? "Notes (internal)" : "Notes (interne)"}>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={`${inputCls} h-auto py-2 resize-none`}
          />
        </Field>

        <CheckboxField
          label={isEn ? "Active (use in analyses)" : "Actif (utilisé dans les analyses)"}
          checked={active}
          onChange={setActive}
        />
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        {mode === "edit" && (
          <button
            onClick={remove}
            className="text-sm text-danger-600 hover:underline"
          >
            {isEn ? "Delete contract" : "Supprimer ce contrat"}
          </button>
        )}
        <button
          type="button"
          disabled={busy || !name.trim()}
          onClick={submit}
          className="ml-auto h-11 px-6 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 disabled:opacity-50"
        >
          {busy
            ? isEn
              ? "Saving…"
              : "Enregistrement…"
            : isEn
            ? "Save contract"
            : "Enregistrer"}{" "}
          →
        </button>
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

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <Field label={label}>
      <input
        type="number"
        min={0}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className={inputCls}
      />
    </Field>
  );
}

function CheckboxField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (c: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-brand-500"
      />
      <span className="text-sm font-medium text-ink-900">{label}</span>
    </label>
  );
}

const inputCls =
  "w-full rounded-lg border border-surface-300 bg-white px-3.5 h-11 text-[0.95rem] focus-ring focus:border-brand-500";
