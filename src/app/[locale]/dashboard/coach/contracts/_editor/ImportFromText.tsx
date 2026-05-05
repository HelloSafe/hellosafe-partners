"use client";

export function ImportFromText({
  isEn,
  importText,
  setImportText,
  importing,
  onImport,
  importedNotice,
}: {
  isEn: boolean;
  importText: string;
  setImportText: (v: string) => void;
  importing: boolean;
  onImport: () => void;
  importedNotice: string | null;
}) {
  return (
    <section className="rounded-2xl border border-surface-200 bg-surface-50 p-5">
      <h2 className="font-semibold text-ink-900">
        {isEn
          ? "Import from contract text (mock)"
          : "Importer depuis le texte du contrat (mock)"}
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
          onClick={onImport}
          className="h-9 px-4 rounded-lg border border-brand-500 text-brand-700 text-sm font-semibold hover:bg-brand-50 disabled:opacity-50"
        >
          {importing
            ? isEn
              ? "Extracting…"
              : "Extraction…"
            : isEn
            ? "Pre-fill from text"
            : "Pré-remplir depuis le texte"}
        </button>
        {importedNotice && (
          <span className="text-xs text-warning-600">{importedNotice}</span>
        )}
      </div>
    </section>
  );
}
