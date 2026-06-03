"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { authClient } from "@/lib/auth-client";

/**
 * Step 1 of password reset: ask for the account email. Better Auth generates a
 * one-time token and emails a link back to /reset-password (the `redirectTo`).
 * We always show the same confirmation regardless of whether the email exists,
 * so the form can't be used to probe which addresses have accounts.
 */
export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const redirectTo = `${window.location.origin}/fr/reset-password`;
    await authClient.requestPasswordReset({ email, redirectTo });
    // Intentionally ignore the result: don't reveal account existence.
    setSent(true);
    setLoading(false);
  };

  if (sent) {
    return (
      <div className="mx-auto max-w-md text-center">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-700 text-2xl">
          ✉️
        </span>
        <h1 className="mt-4 text-2xl font-bold tracking-tight">
          Vérifie ta boîte mail
        </h1>
        <p className="mt-3 text-ink-700 leading-relaxed">
          Si un compte est associé à <strong>{email}</strong>, tu vas recevoir
          un lien pour choisir un nouveau mot de passe (valable 1 heure).
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block text-sm font-semibold text-brand-700 hover:underline"
        >
          ← Retour à la connexion
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-3xl font-bold tracking-tight text-center">
        Mot de passe oublié
      </h1>
      <p className="mt-2 text-center text-ink-700">
        Indique ton e-mail, on t&apos;envoie un lien de réinitialisation.
      </p>

      <form
        onSubmit={submit}
        className="mt-8 rounded-2xl border border-surface-200 bg-white p-8 space-y-5"
      >
        <label className="block">
          <span className="block text-sm font-medium text-ink-700 mb-1.5">
            E-mail
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg border border-surface-300 bg-white px-3.5 h-11 focus-ring focus:border-brand-500"
          />
        </label>
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          Envoyer le lien {loading ? "…" : "→"}
        </Button>
        <p className="text-center text-sm text-ink-500">
          <Link
            href="/login"
            className="text-brand-700 font-semibold hover:underline"
          >
            Retour à la connexion
          </Link>
        </p>
      </form>
    </div>
  );
}
