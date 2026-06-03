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

/**
 * Authenticated dashboard chrome. The session is resolved server-side in the
 * layout (auth + partner-approval gating live there); this component only
 * renders the sidebar/header for an already-approved, onboarded partner.
 */
export function DashboardShell({
  session,
  children,
}: {
  session: DashboardSession;
  children: React.ReactNode;
}) {
  const t = useTranslations("dashboard.nav");
  const tc = useTranslations("common");
  const pathname = usePathname();
  const router = useRouter();

  // Identify for product analytics once we have the resolved session.
  useEffect(() => {
    identify(session.user.id, {
      email: session.user.email,
      role: session.user.role,
      partnerId: session.partner.id,
      companyName: session.partner.companyName,
    });
  }, [
    session.user.id,
    session.user.email,
    session.user.role,
    session.partner.id,
    session.partner.companyName,
  ]);

  const logout = async () => {
    track("logout", {});
    reset();
    const { authClient } = await import("@/lib/auth-client");
    await authClient.signOut();
    router.replace("/");
  };

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
