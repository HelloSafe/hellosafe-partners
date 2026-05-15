"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { Logo } from "@/components/ui/Logo";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { identify, reset, track } from "@/lib/analytics";

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
    persona: string | null;
    onboardedAt: string | null;
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
        // Approved but not yet onboarded → walk them through onboarding first.
        if (!d.partner.onboardedAt) {
          router.replace("/onboarding" as never);
          return;
        }
        const session = d as DashboardSession;
        identify(session.user.id, {
          email: session.user.email,
          role: session.user.role,
          partnerId: session.partner.id,
          companyName: session.partner.companyName,
        });
        setState({ phase: "ready", session });
      })
      .catch(() => router.replace("/login"));
    return () => {
      cancelled = true;
    };
  }, [router, pathname]);

  const logout = async () => {
    track("logout", {});
    reset();
    const { authClient } = await import("@/lib/auth-client");
    await authClient.signOut();
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

  type Leaf = {
    kind: "leaf";
    href: string;
    label: string;
    badge?: string;
    exact?: boolean;
    subtle?: boolean;
  };
  type Group = { kind: "group"; label: string; items: Leaf[] };
  const tools: Array<Leaf | Group> = [
    {
      kind: "leaf",
      href: "/dashboard",
      label: t("overview"),
      exact: true,
    },
    { kind: "leaf", href: "/dashboard/links", label: t("links") },
    {
      kind: "leaf",
      href: "/dashboard/perks",
      label: t("perks"),
      badge: "NEW",
    },
  ];
  const admin: Leaf[] = [
    { kind: "leaf", href: "/dashboard/admin/profile", label: t("profile") },
    { kind: "leaf", href: "/dashboard/admin/team", label: t("team") },
    { kind: "leaf", href: "/dashboard/admin/reporting", label: t("reporting") },
    { kind: "leaf", href: "/dashboard/payouts", label: t("payouts") },
    { kind: "leaf", href: "/dashboard/admin/api", label: t("api") },
  ];

  const adminActive = admin.some((i) => pathname.startsWith(i.href));

  return (
    <SessionContext.Provider value={session}>
      <div className="min-h-dvh bg-surface-100">
        <aside className="fixed inset-y-0 left-0 hidden lg:flex w-64 flex-col bg-white border-r border-surface-200">
          <div className="h-16 border-b border-surface-200 flex items-center px-6">
            <Link href="/">
              <Logo />
            </Link>
          </div>
          <nav className="flex-1 p-4 overflow-y-auto">
            {/* Tools block */}
            <div className="space-y-0.5">
              {tools.map((item, idx) =>
                item.kind === "leaf" ? (
                  <NavLeafLink key={item.href} item={item} pathname={pathname} />
                ) : (
                  <NavGroupBlock key={`g-${idx}`} group={item} pathname={pathname} />
                ),
              )}
            </div>

            {/* Admin block — collapsible */}
            <AdminBlock
              label={t("sections.admin")}
              items={admin}
              pathname={pathname}
              defaultOpen={adminActive}
            />

            {session.user.role === "admin" && (
              <Link
                href={"/admin" as never}
                className="mt-4 flex items-center px-3 h-9 rounded-lg text-xs font-semibold uppercase tracking-wider text-ink-500 hover:bg-surface-100"
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

// ─── Sidebar building blocks ─────────────────────────────────────────────────

type LeafItem = {
  kind: "leaf";
  href: string;
  label: string;
  badge?: string;
  exact?: boolean;
  subtle?: boolean;
};

type GroupItem = { kind: "group"; label: string; items: LeafItem[] };

function NavLeafLink({
  item,
  pathname,
  indent = false,
}: {
  item: LeafItem;
  pathname: string;
  indent?: boolean;
}) {
  const active = item.exact
    ? pathname === item.href
    : pathname.startsWith(item.href);
  const subtle = item.subtle ?? false;
  const sizeCls = subtle ? "h-8 ml-6 text-[0.8rem]" : "h-10";
  const inactiveCls = subtle
    ? "text-ink-500 hover:bg-surface-100 hover:text-ink-900"
    : "text-ink-700 hover:bg-surface-100";
  return (
    <Link
      href={item.href as never}
      className={`flex items-center px-3 rounded-lg font-medium transition-colors ${sizeCls} ${
        indent && !subtle ? "ml-3" : ""
      } ${
        active
          ? "bg-brand-50 text-brand-700"
          : inactiveCls
      } ${subtle ? "" : "text-sm"}`}
    >
      <span className="truncate">{item.label}</span>
      {item.badge && (
        <span
          className={`ml-auto text-[0.6rem] font-bold uppercase tracking-wider rounded-full px-1.5 py-0.5 ${
            item.badge === "BIENTÔT"
              ? "bg-surface-200 text-ink-700"
              : "bg-brand-500 text-white"
          }`}
        >
          {item.badge}
        </span>
      )}
    </Link>
  );
}

function NavGroupBlock({
  group,
  pathname,
}: {
  group: GroupItem;
  pathname: string;
}) {
  return (
    <div className="mt-3">
      <p className="px-3 mb-1 text-[0.68rem] font-semibold uppercase tracking-wider text-ink-500">
        {group.label}
      </p>
      <div className="space-y-0.5">
        {group.items.map((item) => (
          <NavLeafLink
            key={item.href}
            item={item}
            pathname={pathname}
            indent
          />
        ))}
      </div>
    </div>
  );
}

function AdminBlock({
  label,
  items,
  pathname,
  defaultOpen,
}: {
  label: string;
  items: LeafItem[];
  pathname: string;
  defaultOpen: boolean;
}) {
  // Derived-state pattern: the user can override the default with a manual
  // toggle. `null` means "follow the default"; once they click we lock the
  // override. Reset back to following the default if the page changes such
  // that defaultOpen would re-open the section.
  const [override, setOverride] = useState<boolean | null>(null);
  const open = override ?? defaultOpen;

  return (
    <div className="mt-6 pt-4 border-t border-surface-200">
      <button
        type="button"
        onClick={() => setOverride(!open)}
        className="w-full flex items-center px-3 h-9 rounded-lg text-[0.68rem] font-semibold uppercase tracking-wider text-ink-500 hover:bg-surface-100 transition-colors"
        aria-expanded={open}
      >
        <span>{label}</span>
        <svg
          className={`ml-auto transition-transform ${open ? "rotate-180" : ""}`}
          width="10"
          height="6"
          viewBox="0 0 10 6"
          aria-hidden
        >
          <path
            d="M1 1l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {open && (
        <div className="mt-1 space-y-0.5">
          {items.map((item) => (
            <NavLeafLink key={item.href} item={item} pathname={pathname} indent />
          ))}
        </div>
      )}
    </div>
  );
}
