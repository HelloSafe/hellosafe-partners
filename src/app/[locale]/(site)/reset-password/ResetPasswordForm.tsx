"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { authClient } from "@/lib/auth-client";

/**
 * Step 2 of password reset. Better Auth's callback validated the token and
 * redirected here with `?token=…` (or `?error=INVALID_TOKEN` when it's bad or
 * expired). We post the new password with that token to `resetPassword`.
 */
export function ResetPasswordForm() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token");
  const linkError = params.get("error");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // Bad/expired/missing token → dead end with a path back.
  if (linkError || !token) {
    return (
      <div className="mx-auto max-w-md text-center">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-danger-50 text-danger-600 text-2xl">
          ⚠️
        </span>
        <h1 className="mt-4 text-2xl font-bold tracking-tight">
          Lien invalide ou expiré
        </h1>
        <p className="mt-3 text-ink-700 leading-relaxed">
          Ce lien de réinitialisation n&apos;est plus valable. Demandes-en un
          nouveau, il te sera envoyé par e-mail.
        </p>
        <Link
          href="/forgot-password"
          className="mt-6 inline-block text-sm font-semibold text-brand-700 hover:underline"
        >
          Renvoyer un lien
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="mx-auto max-w-md text-center">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-700 text-2xl">
          ✅
        </span>
        <h1 className="mt-4 text-2xl font-bold tracking-tight">
          Mot de passe mis à jour
        </h1>
        <p className="mt-3 text-ink-700 leading-relaxed">
          Tu peux maintenant te connecter avec ton nouveau mot de passe.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block text-sm font-semibold text-brand-700 hover:underline"
        >
          Aller à la connexion →
        </Link>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (password.length < 8) {
      setErr("Mot de passe : 8 caractères minimum.");
      return;
    }
    if (password !== confirm) {
      setErr("Les deux mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    const { error } = await authClient.resetPassword({
      newPassword: password,
      token,
    });
    if (error) {
      setErr(
        "Impossible de réinitialiser le mot de passe. Le lien a peut-être expiré.",
      );
      setLoading(false);
      return;
    }
    setDone(true);
    setLoading(false);
    // Soft redirect after a beat so the success state is seen.
    setTimeout(() => router.push("/login"), 2500);
  };

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-3xl font-bold tracking-tight text-center">
        Nouveau mot de passe
      </h1>
      <p className="mt-2 text-center text-ink-700">
        Choisis un mot de passe d&apos;au moins 8 caractères.
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
        <label className="block">
          <span className="block text-sm font-medium text-ink-700 mb-1.5">
            Nouveau mot de passe
          </span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="w-full rounded-lg border border-surface-300 bg-white px-3.5 h-11 focus-ring focus:border-brand-500"
          />
        </label>
        <label className="block">
          <span className="block text-sm font-medium text-ink-700 mb-1.5">
            Confirme le mot de passe
          </span>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            minLength={8}
            className="w-full rounded-lg border border-surface-300 bg-white px-3.5 h-11 focus-ring focus:border-brand-500"
          />
        </label>
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          Mettre à jour {loading ? "…" : "→"}
        </Button>
      </form>
    </div>
  );
}
