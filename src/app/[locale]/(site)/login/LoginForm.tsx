"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, Link, usePathname } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { GoogleButton } from "@/components/auth/GoogleButton";

export function LoginForm() {
  const t = useTranslations("auth.login");
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(
    params.get("oauth_error") ? "Échec de connexion via Google." : null,
  );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr("E-mail ou mot de passe invalide.");
        setLoading(false);
        return;
      }
      if (data.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch {
      setErr("Connexion au serveur impossible.");
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-3xl font-bold tracking-tight text-center">
        {t("title")}
      </h1>
      <p className="mt-2 text-center text-ink-700">{t("subtitle")}</p>

      <div className="mt-8">
        <GoogleButton label="Se connecter avec Google" />
      </div>
      <div className="my-6 flex items-center gap-3 text-xs text-ink-500">
        <span className="flex-1 h-px bg-surface-200" />
        <span className="uppercase tracking-wider">ou e-mail</span>
        <span className="flex-1 h-px bg-surface-200" />
      </div>

      <form
        onSubmit={submit}
        className="rounded-2xl border border-surface-200 bg-white p-8 space-y-5"
      >
        {err && (
          <div className="rounded-lg bg-danger-50 text-danger-600 px-3 py-2 text-sm">
            {err}
          </div>
        )}
        <label className="block">
          <span className="block text-sm font-medium text-ink-700 mb-1.5">
            {t("fields.email")}
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg border border-surface-300 bg-white px-3.5 h-11 focus-ring focus:border-brand-500"
          />
        </label>
        <label className="block">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-medium text-ink-700">
              {t("fields.password")}
            </span>
            <a href="#" className="text-xs text-brand-700 hover:underline">
              {t("forgot")}
            </a>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-lg border border-surface-300 bg-white px-3.5 h-11 focus-ring focus:border-brand-500"
          />
        </label>
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {t("submit")} {loading ? "…" : "→"}
        </Button>
        <p className="text-center text-sm text-ink-500">
          {t("noAccount")}{" "}
          <Link
            href="/signup"
            className="text-brand-700 font-semibold hover:underline"
          >
            {t("signupLink")}
          </Link>
        </p>
      </form>
    </div>
  );
}
