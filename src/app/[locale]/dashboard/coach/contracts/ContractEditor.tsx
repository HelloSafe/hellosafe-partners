"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import type { CoverageData } from "@/lib/coach/coverage-types";
import { CompanionsSection } from "./_editor/CompanionsSection";
import { ConstraintsSection } from "./_editor/ConstraintsSection";
import { DEFAULT_DATA, inputCls } from "./_editor/constants";
import { ImportFromText } from "./_editor/ImportFromText";
import { LimitsSection } from "./_editor/LimitsSection";
import { CheckboxField, Field } from "./_editor/ui";

/**
 * Editor for partner-distributed contracts that the Coach uses as one of
 * the coverage sources. Two modes:
 *   - "create": empty form starting from a sensible default.
 *   - "edit": loads an existing contract by id.
 *
 * Sub-sections (limits / constraints / companions / import) live under
 * _editor/ so the sections can grow independently.
 */
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
      const url =
        mode === "create"
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
              ? "New distributed contract"
              : "Nouveau contrat à distribuer"
            : isEn
            ? "Edit contract"
            : "Modifier le contrat"}
        </h1>
        <p className="mt-2 text-ink-700">
          {isEn
            ? "Used by the Coach as one of the coverage sources to compare against the traveler's existing protection. Numeric amounts in euros."
            : "Utilisé par le Coach comme l'une des sources de couverture, comparée à la protection actuelle du voyageur. Montants en euros."}
        </p>
      </header>

      <ImportFromText
        isEn={isEn}
        importText={importText}
        setImportText={setImportText}
        importing={importing}
        onImport={importFromText}
        importedNotice={importedNotice}
      />

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

        <LimitsSection isEn={isEn} data={data} setData={setData} />
        <ConstraintsSection isEn={isEn} data={data} setData={setData} />
        <CompanionsSection isEn={isEn} data={data} setData={setData} />

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
