"use client";

import { useState } from "react";
import { useRouter, Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { track } from "@/lib/analytics";

type Initial = {
  companyName: string;
  contactName: string;
  website: string;
  audience: string;
  country: string;
  monthlyVisitors: string;
};

/**
 * Final step for Google signups: collect company/site so the account can go
 * to review. On success the dashboard shows the "pending" card.
 */
export function CompleteProfileForm({ initial }: { initial: Initial }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [form, setForm] = useState<Initial>(initial);

  const update =
    (k: keyof Initial) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) =>
      setForm({ ...form, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch("/api/account/complete-profile", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const map: Record<string, string> = {
          MISSING_FIELDS: "Renseigne au moins la société et le contact.",
        };
        setErr(map[data.error] ?? "Une erreur est survenue.");
        setLoading(false);
        return;
      }
      track("profile_completed", {});
      router.push("/dashboard");
    } catch {
      setErr("Connexion au serveur impossible.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-surface-100">
      <header className="h-16 border-b border-surface-200 bg-white flex items-center px-6 lg:px-10">
        <Link href="/">
          <Logo />
        </Link>
        <span className="ml-3 rounded-full bg-brand-50 px-2 py-0.5 text-[0.68rem] font-bold uppercase tracking-wider text-brand-700">
          Dernière étape
        </span>
      </header>

      <main className="px-6 lg:px-10 py-10 lg:py-16">
        <div className="max-w-xl mx-auto">
          <h1 className="text-3xl font-bold tracking-tight">
            Complète ton profil
          </h1>
          <p className="mt-3 text-ink-700">
            Encore quelques infos sur ton activité et on envoie ton dossier à
            l&apos;équipe pour validation.
          </p>

          <form
            onSubmit={submit}
            className="mt-8 rounded-2xl border border-surface-200 bg-white p-8 space-y-5"
          >
            {err && (
              <div className="rounded-lg bg-danger-50 text-danger-600 px-3 py-2 text-sm">
                {err}
              </div>
            )}
            <Field label="Société">
              <input
                required
                value={form.companyName}
                onChange={update("companyName")}
                placeholder="Nom de ta société"
                className={inputCls}
              />
            </Field>
            <Field label="Contact">
              <input
                required
                value={form.contactName}
                onChange={update("contactName")}
                className={inputCls}
              />
            </Field>
            <Field label="Site web">
              <input
                type="url"
                placeholder="https://"
                value={form.website}
                onChange={update("website")}
                className={inputCls}
              />
            </Field>
            <Field label="Audience">
              <textarea
                rows={3}
                value={form.audience}
                onChange={update("audience")}
                placeholder="Décris ton audience : thématique, taille, zone…"
                className={`${inputCls} resize-none`}
              />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Pays">
                <select
                  value={form.country}
                  onChange={update("country")}
                  className={inputCls}
                >
                  {[
                    "FR", "BE", "LU", "CH", "CA", "GB", "US", "ES", "IT", "DE",
                    "NL", "PT",
                  ].map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Visiteurs / mois">
                <input
                  type="number"
                  value={form.monthlyVisitors}
                  onChange={update("monthlyVisitors")}
                  className={inputCls}
                />
              </Field>
            </div>
            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? "Envoi…" : "Envoyer pour validation →"}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-surface-300 bg-white px-3.5 h-11 text-[0.95rem] text-ink-900 placeholder-ink-300 focus-ring transition-colors focus:border-brand-500";

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
