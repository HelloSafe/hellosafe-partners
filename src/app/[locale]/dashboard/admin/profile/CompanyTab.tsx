"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

type Company = {
  companyName: string;
  legalForm: string | null;
  siret: string | null;
  vatNumber: string | null;
  billingStreet: string | null;
  billingPostalCode: string | null;
  billingCity: string | null;
  billingCountry: string | null;
};

const EMPTY: Company = {
  companyName: "",
  legalForm: null,
  siret: null,
  vatNumber: null,
  billingStreet: null,
  billingPostalCode: null,
  billingCity: null,
  billingCountry: null,
};

export function CompanyTab() {
  const t = useTranslations("dashboard.account.companyForm");
  const tg = useTranslations("dashboard.account.accountForm");
  const [data, setData] = useState<Company | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ kind: "ok" | "error"; text: string } | null>(
    null,
  );

  useEffect(() => {
    fetch("/api/account/company", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: Company) => setData({ ...EMPTY, ...d }))
      .catch(() => setData(EMPTY));
  }, []);

  if (!data) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  const set = (k: keyof Company) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setData({ ...data, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setToast(null);
    const res = await fetch("/api/account/company", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) setToast({ kind: "ok", text: t("saved") });
    else setToast({ kind: "error", text: tg("errorGeneric") });
    setSaving(false);
  };

  return (
    <form onSubmit={submit} className="space-y-8">
      {/* ─── Legal info ──────────────────────────────────────────────────── */}
      <section className="rounded-2xl border border-surface-200 bg-white p-6 lg:p-7">
        <header className="mb-5">
          <h2 className="text-lg font-bold text-ink-900">{t("sectionLegal")}</h2>
          <p className="mt-1 text-sm text-ink-500 leading-relaxed">
            {t("sectionLegalBody")}
          </p>
        </header>
        {toast && (
          <div
            className={`mb-4 rounded-lg px-3 py-2 text-sm ${
              toast.kind === "ok"
                ? "bg-success-50 text-success-700"
                : "bg-danger-50 text-danger-600"
            }`}
          >
            {toast.text}
          </div>
        )}
        <div className="space-y-5">
          <Field label={t("companyName")}>
            <input
              required
              value={data.companyName}
              onChange={set("companyName")}
              className={inputCls}
            />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label={t("legalForm")}>
              <input
                value={data.legalForm ?? ""}
                onChange={set("legalForm")}
                placeholder={t("legalFormPlaceholder")}
                className={inputCls}
              />
            </Field>
            <Field label={t("siret")}>
              <input
                value={data.siret ?? ""}
                onChange={set("siret")}
                className={`${inputCls} font-mono`}
              />
            </Field>
          </div>
          <Field label={t("vat")}>
            <input
              value={data.vatNumber ?? ""}
              onChange={set("vatNumber")}
              placeholder={t("vatPlaceholder")}
              className={`${inputCls} font-mono`}
            />
          </Field>
        </div>
      </section>

      {/* ─── Billing address ─────────────────────────────────────────────── */}
      <section className="rounded-2xl border border-surface-200 bg-white p-6 lg:p-7">
        <header className="mb-5">
          <h2 className="text-lg font-bold text-ink-900">{t("sectionAddress")}</h2>
        </header>
        <div className="space-y-5">
          <Field label={t("street")}>
            <input
              value={data.billingStreet ?? ""}
              onChange={set("billingStreet")}
              className={inputCls}
            />
          </Field>
          <div className="grid gap-5 sm:grid-cols-[140px_1fr]">
            <Field label={t("postalCode")}>
              <input
                value={data.billingPostalCode ?? ""}
                onChange={set("billingPostalCode")}
                className={inputCls}
              />
            </Field>
            <Field label={t("city")}>
              <input
                value={data.billingCity ?? ""}
                onChange={set("billingCity")}
                className={inputCls}
              />
            </Field>
          </div>
          <Field label={t("country")}>
            <input
              value={data.billingCountry ?? ""}
              onChange={set("billingCountry")}
              className={inputCls}
            />
          </Field>
        </div>
      </section>

      <button
        type="submit"
        disabled={saving}
        className="h-10 px-5 rounded-lg bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 disabled:opacity-50 transition-colors"
      >
        {saving ? "…" : t("save")}
      </button>
    </form>
  );
}

const inputCls =
  "w-full rounded-lg border border-surface-300 bg-white px-3.5 h-11 text-[0.95rem] text-ink-900 focus-ring transition-colors focus:border-brand-500";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-ink-900 mb-1">{label}</span>
      {children}
    </label>
  );
}
