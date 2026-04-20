"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { GoogleButton } from "@/components/auth/GoogleButton";

type Msg = {
  type: "error" | "info";
  text: string;
};

export function SignupForm() {
  const t = useTranslations("auth.signup");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<Msg | null>(null);
  const [form, setForm] = useState({
    companyName: "",
    contactName: "",
    email: "",
    website: "",
    audience: "",
    country: "FR",
    monthlyVisitors: "50000",
    password: "",
  });

  const update =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm({ ...form, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const map: Record<string, string> = {
          EMAIL_ALREADY_USED: "Cet e-mail est déjà associé à un compte.",
          PASSWORD_TOO_SHORT: "Mot de passe : 8 caractères minimum.",
          INVALID_EMAIL: "E-mail invalide.",
          MISSING_FIELDS: "Tous les champs obligatoires ne sont pas remplis.",
        };
        setMsg({
          type: "error",
          text: map[data.error] ?? "Une erreur est survenue.",
        });
        setLoading(false);
        return;
      }
      router.push("/signup/pending");
    } catch {
      setMsg({ type: "error", text: "Connexion au serveur impossible." });
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] items-start">
      <div>
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">
          {t("title")}
        </h1>
        <p className="mt-3 text-ink-700">{t("subtitle")}</p>
        <div className="mt-6">
          <GoogleButton label="S'inscrire avec Google" />
        </div>
        <div className="mt-6 text-sm text-ink-500">
          {t("haveAccount")}{" "}
          <Link href="/login" className="text-brand-700 font-semibold hover:underline">
            {t("loginLink")}
          </Link>
        </div>
      </div>
      <form
        onSubmit={submit}
        className="rounded-2xl border border-surface-200 bg-white p-8 space-y-5"
      >
        {msg && (
          <div
            className={`rounded-lg px-3 py-2 text-sm ${msg.type === "error" ? "bg-danger-50 text-danger-600" : "bg-brand-50 text-brand-700"}`}
          >
            {msg.text}
          </div>
        )}
        <Field label={t("fields.companyName")}>
          <input
            required
            value={form.companyName}
            onChange={update("companyName")}
            className={inputCls}
          />
        </Field>
        <Field label={t("fields.contactName")}>
          <input
            required
            value={form.contactName}
            onChange={update("contactName")}
            className={inputCls}
          />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={t("fields.email")}>
            <input
              type="email"
              required
              value={form.email}
              onChange={update("email")}
              className={inputCls}
            />
          </Field>
          <Field label={t("fields.website")}>
            <input
              type="url"
              placeholder="https://"
              value={form.website}
              onChange={update("website")}
              className={inputCls}
            />
          </Field>
        </div>
        <Field label={t("fields.audience")}>
          <textarea
            rows={3}
            value={form.audience}
            onChange={update("audience")}
            placeholder={t("audiencePlaceholder")}
            className={`${inputCls} resize-none`}
          />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={t("fields.country")}>
            <select value={form.country} onChange={update("country")} className={inputCls}>
              {[
                "FR", "BE", "LU", "CH", "CA", "GB", "US", "ES", "IT", "DE", "NL", "PT",
              ].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t("fields.monthlyVisitors")}>
            <input
              type="number"
              value={form.monthlyVisitors}
              onChange={update("monthlyVisitors")}
              className={inputCls}
            />
          </Field>
        </div>
        <Field label={t("fields.password")}>
          <input
            type="password"
            required
            minLength={8}
            value={form.password}
            onChange={update("password")}
            className={inputCls}
          />
        </Field>
        <p className="text-xs text-ink-500 leading-relaxed">{t("terms")}</p>
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {t("submit")} {loading ? "…" : "→"}
        </Button>
      </form>
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-surface-300 bg-white px-3.5 h-11 text-[0.95rem] text-ink-900 placeholder-ink-300 focus-ring transition-colors focus:border-brand-500";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-ink-700 mb-1.5">
        {label}
      </span>
      {children}
    </label>
  );
}
