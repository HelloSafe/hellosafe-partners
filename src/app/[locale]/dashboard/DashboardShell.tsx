"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { Logo } from "@/components/ui/Logo";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";

export type DashboardSession = {
  user: {
    id: string;
    email: string;
    name: string | null;
    role: "partner" | "admin";
  };
  partner: {
    id: string;
    partnerCode: string;
    companyName: string;
    contactName: string;
    status: "pending" | "approved" | "rejected";
  };
};

const SessionContext = createContext<DashboardSession | null>(null);

export function useDashboardSession(): DashboardSession {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useDashboardSession must be used inside DashboardShell");
  }
  return ctx;
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations("dashboard.nav");
  const tc = useTranslations("common");
  const pathname = usePathname();
  const router = useRouter();
  const [state, setState] = useState<
    | { phase: "loading" }
    | { phase: "pending"; reason: "pending" | "rejected" | "no_partner"; me: DashboardSession | null }
    | { phase: "ready"; session: DashboardSession }
  >({ phase: "loading" });

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        if (!d?.user) {
          router.replace("/login");
          return;
        }
        if (!d.partner) {
          setState({ phase: "pending", reason: "no_partner", me: d });
          return;
        }
        if (d.partner.status === "pending") {
          setState({
            phase: "pending",
            reason: "pending",
            me: d as DashboardSession,
          });
          return;
        }
        if (d.partner.status === "rejected") {
          setState({
            phase: "pending",
            reason: "rejected",
            me: d as DashboardSession,
          });
          return;
        }
        setState({ phase: "ready", session: d as DashboardSession });
      })
      .catch(() => router.replace("/login"));
    return () => {
      cancelled = true;
    };
  }, [router, pathname]);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/");
  };

  if (state.phase === "loading") {
    return (
      <div className="flex items-center justify-center min-h-dvh">
        <div className="h-6 w-6 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (state.phase === "pending") {
    const msg =
      state.reason === "rejected"
        ? {
            title: "Inscription non retenue",
            body: "Notre équipe n'a pas pu valider votre candidature. Contactez-nous si vous pensez qu'il s'agit d'une erreur.",
          }
        : state.reason === "no_partner"
        ? {
            title: "Profil partenaire introuvable",
            body: "Votre compte existe mais n'est pas associé à un profil partenaire. Contactez le support.",
          }
        : {
            title: "Compte en cours de validation",
            body: "Notre équipe vérifie votre dossier, vous recevrez un e-mail dès l'approbation (sous 24 h ouvrées).",
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

  const { session } = state;

  const nav = [
    { href: "/dashboard", label: t("overview"), exact: true },
    { href: "/dashboard/links", label: t("links") },
    { href: "/dashboard/payouts", label: t("payouts") },
  ];

  return (
    <SessionContext.Provider value={session}>
      <div className="min-h-dvh bg-surface-100">
        <aside className="fixed inset-y-0 left-0 hidden lg:flex w-64 flex-col bg-white border-r border-surface-200">
          <div className="h-16 border-b border-surface-200 flex items-center px-6">
            <Link href="/">
              <Logo />
            </Link>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {nav.map((item) => {
              const active = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-3 h-10 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? "bg-brand-50 text-brand-700"
                      : "text-ink-700 hover:bg-surface-100"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            {session.user.role === "admin" && (
              <Link
                href={"/admin" as never}
                className="flex items-center px-3 h-10 rounded-lg text-sm font-medium text-ink-700 hover:bg-surface-100"
              >
                Admin
              </Link>
            )}
          </nav>
          <div className="p-4 border-t border-surface-200 space-y-3">
            <div className="rounded-lg bg-surface-100 p-3 text-xs">
              <p className="font-semibold text-ink-900 truncate">
                {session.partner.companyName}
              </p>
              <p className="mt-0.5 text-ink-500 truncate">{session.user.email}</p>
              <p className="mt-2 font-mono text-[0.68rem] text-ink-500">
                ID: {session.partner.partnerCode}
              </p>
            </div>
            <button
              onClick={logout}
              className="w-full text-left px-3 h-9 rounded-lg text-sm text-ink-700 hover:bg-surface-100"
            >
              {tc("cta.logout")}
            </button>
          </div>
        </aside>
        <div className="lg:pl-64">
          <header className="h-16 bg-white border-b border-surface-200 flex items-center gap-4 px-6">
            <Link href="/" className="lg:hidden">
              <Logo withSuffix={false} />
            </Link>
            <div className="ml-auto flex items-center gap-2">
              <LanguageSwitcher />
              <button
                onClick={logout}
                className="lg:hidden px-3 h-9 rounded-lg text-sm text-ink-700 hover:bg-surface-100"
              >
                {tc("cta.logout")}
              </button>
            </div>
          </header>
          <main className="p-6 lg:p-10">{children}</main>
        </div>
      </div>
    </SessionContext.Provider>
  );
}
