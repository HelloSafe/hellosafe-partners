"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { reset, track } from "@/lib/analytics";

/**
 * Shown by the dashboard layout (server) when a signed-in user can't yet
 * access the dashboard: account pending review, rejected, or no partner
 * profile linked. The auth gate now lives in the RSC layout — this is just
 * the message + a logout button (which needs client interactivity).
 */
export function DashboardStatusCard({
  reason,
}: {
  reason: "pending" | "rejected" | "no_partner";
}) {
  const tc = useTranslations("common");
  const router = useRouter();

  const msg =
    reason === "rejected"
      ? {
          title: "Inscription non retenue",
          body: "Notre équipe n'a pas pu valider votre candidature. Contactez-nous si vous pensez qu'il s'agit d'une erreur.",
        }
      : reason === "no_partner"
      ? {
          title: "Profil partenaire introuvable",
          body: "Votre compte existe mais n'est pas associé à un profil partenaire. Contactez le support.",
        }
      : {
          title: "Compte en cours de validation",
          body: "Notre équipe vérifie votre dossier, vous recevrez un e-mail dès l'approbation (sous 24 h ouvrées).",
        };

  const logout = async () => {
    track("logout", {});
    reset();
    const { authClient } = await import("@/lib/auth-client");
    await authClient.signOut();
    router.replace("/");
  };

  return (
    <div className="flex items-center justify-center min-h-dvh bg-surface-100 px-6">
      <div className="max-w-md w-full rounded-2xl border border-surface-200 bg-white p-8 text-center">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-warning-50 text-warning-600 text-2xl">
          ⏳
        </span>
        <h1 className="mt-4 text-2xl font-bold">{msg.title}</h1>
        <p className="mt-3 text-ink-700 leading-relaxed">{msg.body}</p>
        <button
          onClick={logout}
          className="mt-6 inline-flex h-10 px-5 items-center justify-center rounded-lg border border-surface-300 text-sm font-semibold hover:bg-surface-50"
        >
          {tc("cta.logout")}
        </button>
      </div>
    </div>
  );
}
