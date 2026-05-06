"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/Button";
import { DESTINATIONS, type DestinationKey } from "@/lib/links/destinations";
import { track } from "@/lib/analytics";

type LinkRow = {
  id: string;
  shortCode: string;
  label: string;
  destination: DestinationKey;
  language: string;
  campaign: string;
  subId: string;
  createdAt: string;
  clicks: number;
  sales: number;
  commissionCents: number;
  url: string;
};

export function LinksPanel() {
  const t = useTranslations("dashboard.links");
  const tDest = useTranslations("dashboard.links.destinations");
  const locale = useLocale();
  const [links, setLinks] = useState<LinkRow[] | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [form, setForm] = useState<{
    label: string;
    destination: DestinationKey;
    language: string;
    campaign: string;
    subId: string;
  }>({
    label: "",
    destination: "travel",
    language: locale === "en" ? "en" : "fr",
    campaign: "",
    subId: "",
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const reload = useCallback(async () => {
    const res = await fetch("/api/links", { cache: "no-store" });
    if (!res.ok) return;
    const d = await res.json();
    setLinks(d.links);
  }, []);

  // Initial load. `reload` is stable (useCallback with empty deps) and
  // sets state asynchronously after fetch.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    reload();
  }, [reload]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(data.error ?? "Erreur lors de la création du lien.");
        return;
      }
      setLinks((prev) => (prev ? [data.link, ...prev] : [data.link]));
      track("link_created", {
        destination: data.link.destination,
        partnerId: "self",
        campaign: data.link.campaign || undefined,
      });
      setForm({ ...form, label: "", campaign: "", subId: "" });
    } finally {
      setSubmitting(false);
    }
  };

  const copy = (id: string, url: string) => {
    navigator.clipboard?.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1600);
  };

  const fmt = (n: number) => new Intl.NumberFormat(locale).format(n);
  const fmtDate = (iso: string) =>
    new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(iso));

  return (
    <div className="space-y-10 max-w-7xl">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="mt-2 text-ink-700 max-w-2xl">{t("subtitle")}</p>
      </header>

      <section>
        <form
          onSubmit={submit}
          className="grid gap-5 rounded-2xl border border-surface-200 bg-white p-6 lg:grid-cols-2 xl:grid-cols-[1.2fr_1fr_1fr_1fr_auto] xl:items-end"
        >
          <Field label={t("form.label")}>
            <input
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              placeholder={t("form.labelPlaceholder")}
              className={inputCls}
            />
          </Field>
          <Field label={t("form.destination")}>
            <select
              value={form.destination}
              onChange={(e) =>
                setForm({ ...form, destination: e.target.value as DestinationKey })
              }
              className={inputCls}
            >
              {DESTINATIONS.map((d) => (
                <option key={d} value={d}>
                  {tDest(d)}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t("form.subid")}>
            <input
              value={form.subId}
              onChange={(e) => setForm({ ...form, subId: e.target.value })}
              placeholder={t("form.subidPlaceholder")}
              className={inputCls}
            />
          </Field>
          <Field label={t("form.campaign")}>
            <input
              value={form.campaign}
              onChange={(e) => setForm({ ...form, campaign: e.target.value })}
              placeholder="march-2026"
              className={inputCls}
            />
          </Field>
          <Button type="submit" className="xl:self-end" disabled={submitting}>
            {t("form.submit")} {submitting ? "…" : "→"}
          </Button>
          {err && (
            <p className="lg:col-span-2 xl:col-span-5 text-sm text-danger-600">
              {err}
            </p>
          )}
        </form>
      </section>

      <section>
        <h2 className="text-lg font-semibold">{t("history.title")}</h2>
        <div className="mt-4 overflow-hidden rounded-2xl border border-surface-200 bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-surface-50 text-ink-500">
                <tr className="text-left">
                  <Th>{t("history.columns.label")}</Th>
                  <Th>{t("history.columns.destination")}</Th>
                  <Th>{t("history.columns.subid")}</Th>
                  <Th>{t("history.columns.created")}</Th>
                  <Th className="text-right">{t("history.columns.clicks")}</Th>
                  <Th className="text-right">{t("history.columns.sales")}</Th>
                  <Th>{t("history.columns.url")}</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-200">
                {(links ?? []).map((l) => (
                  <tr key={l.id} className="hover:bg-surface-50 align-top">
                    <Td>
                      <p className="font-medium">{l.label}</p>
                      <p className="text-xs text-ink-500 font-mono mt-0.5">
                        code: {l.shortCode}
                      </p>
                    </Td>
                    <Td className="text-ink-500">{tDest(l.destination)}</Td>
                    <Td>
                      {l.subId ? (
                        <code className="font-mono text-[0.72rem] rounded bg-surface-100 text-ink-700 px-1.5 py-0.5">
                          {l.subId}
                        </code>
                      ) : (
                        <span className="text-ink-300 text-xs">·</span>
                      )}
                    </Td>
                    <Td className="text-ink-500">{fmtDate(l.createdAt)}</Td>
                    <Td className="text-right tabular-nums">{fmt(l.clicks)}</Td>
                    <Td className="text-right tabular-nums">{fmt(l.sales)}</Td>
                    <Td>
                      <div className="flex items-center gap-2 max-w-md">
                        <code className="truncate rounded bg-surface-100 px-2 py-1 text-xs text-ink-700 flex-1 font-mono">
                          {l.url}
                        </code>
                        <button
                          onClick={() => copy(l.id, l.url)}
                          className="shrink-0 rounded-lg border border-surface-300 bg-white px-2.5 h-8 text-xs font-medium hover:border-brand-300 hover:text-brand-700 transition-colors"
                        >
                          {copiedId === l.id
                            ? t("history.copied")
                            : t("history.copy")}
                        </button>
                      </div>
                    </Td>
                  </tr>
                ))}
                {links && links.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12">
                      <div className="max-w-md mx-auto text-center">
                        <div className="mx-auto w-14 h-14 rounded-2xl bg-brand-500/10 text-brand-700 flex items-center justify-center text-2xl">
                          🔗
                        </div>
                        <p className="mt-4 font-bold text-ink-900">
                          {locale === "en"
                            ? "No tracked link yet"
                            : "Pas encore de lien tracké"}
                        </p>
                        <p className="mt-2 text-sm text-ink-700 leading-relaxed">
                          {locale === "en"
                            ? "Use the form above to generate your first one — pick a label, a destination, and copy the URL. Each link tracks clicks, conversions and commission separately."
                            : "Utilisez le formulaire ci-dessus pour générer votre premier lien — choisissez un nom, une destination, copiez l'URL. Chaque lien track ses clics, conversions et commissions séparément."}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-surface-300 bg-white px-3.5 h-11 text-[0.95rem] focus-ring focus:border-brand-500";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-ink-700 mb-1.5">
        {label}
      </span>
      {children}
    </label>
  );
}

function Th({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`px-4 py-3 text-[0.72rem] font-semibold uppercase tracking-wider whitespace-nowrap ${className}`}
    >
      {children}
    </th>
  );
}
function Td({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={`px-4 py-3 ${className}`}>{children}</td>;
}
