"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { track } from "@/lib/analytics";

type Msg = {
  type: "error" | "info";
  text: string;
};

// The signup profile selector reuses the onboarding persona slugs so the choice
// drives the matched testimonial below and is persisted on the created account
// (by /api/auth/signup), which pre-selects onboarding step 1. "other" is left
// out on purpose — it has no testimonial and we want a strong, matched quote.
type ProfileKey = "blog" | "agency" | "visa" | "creator";
const PROFILE_KEYS: ProfileKey[] = ["blog", "agency", "visa", "creator"];
const PROFILE_ICON: Record<ProfileKey, string> = {
  blog: "✍️",
  agency: "🏢",
  visa: "🛂",
  creator: "📸",
};

export function SignupForm() {
  const t = useTranslations("auth.signup");
  // Persona labels + the matched testimonial reuse the onboarding copy (single
  // source of truth) so signup and onboarding step 1 stay in sync.
  const tp = useTranslations("onboarding.personas");
  const tq = useTranslations("onboarding.testimonial");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<Msg | null>(null);
  const [persona, setPersona] = useState<ProfileKey | null>(null);
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

  // Drives the social-proof quote. Falls back to a strong default until the
  // visitor picks a profile, then swaps live.
  const quote = tq.raw(`byPersona.${persona ?? "blog"}`) as {
    quote: string;
    author: string;
    role: string;
    metric: string;
  };

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
        body: JSON.stringify({ ...form, ...(persona ? { persona } : {}) }),
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
      // Best-effort: PostHog will only fire if the visitor has consented.
      // We don't have the partner id at this point (the wrapper returned
      // ok but no body); we'll re-identify on next page load via /api/auth/me.
      track("signup_completed", { partnerId: "pending" });
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

        {/* Profile selector — drives the matched testimonial below and is sent
            with the form so the new account's onboarding step 1 is pre-selected. */}
        <div className="mt-6">
          <span className="block text-sm font-medium text-ink-700 mb-2">
            {t("profileQuestion")}
          </span>
          <div className="flex flex-wrap gap-2">
            {PROFILE_KEYS.map((key) => {
              const on = persona === key;
              return (
                <button
                  key={key}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setPersona(on ? null : key)}
                  className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-all ${
                    on
                      ? "border-brand-500 bg-brand-50 text-brand-700 shadow-sm"
                      : "border-surface-300 bg-white text-ink-700 hover:border-brand-300 hover:-translate-y-0.5"
                  }`}
                >
                  <span aria-hidden>{PROFILE_ICON[key]}</span>
                  {tp(`${key}.label`)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Persona-matched social proof. Defaults to the blog quote until a
            profile is picked, then swaps live to nudge completion. */}
        <figure className="mt-6 relative rounded-2xl border border-surface-200 bg-white p-5 shadow-sm">
          <span className="absolute -top-3 left-5 inline-flex items-center rounded-full bg-success-50 border border-success-600/30 px-3 py-1 text-[0.68rem] font-display font-bold uppercase tracking-wider text-success-900">
            {quote.metric}
          </span>
          <span className="block text-xs font-semibold uppercase tracking-wider text-brand-700">
            {tq("eyebrow")}
          </span>
          <blockquote className="mt-2.5 text-[0.95rem] text-ink-900 leading-relaxed">
            «&nbsp;{quote.quote}&nbsp;»
          </blockquote>
          <figcaption className="mt-4 pt-4 border-t border-surface-200 flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-brand-700 font-display font-bold">
              {quote.author.slice(0, 1)}
            </span>
            <span>
              <span className="block text-sm font-display font-bold text-ink-900">
                {quote.author}
              </span>
              <span className="block text-xs text-ink-500">{quote.role}</span>
            </span>
          </figcaption>
        </figure>

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
