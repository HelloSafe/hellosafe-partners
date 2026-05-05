"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { Logo } from "@/components/ui/Logo";
import type { ConversionRow, PartnerRow } from "./_admin/types";
import { PartnersTable } from "./_admin/PartnersTable";
import { ConversionsTable } from "./_admin/ConversionsTable";
import { SimulateConversionForm } from "./_admin/SimulateConversionForm";

/**
 * Admin back-office. Two tabs (partners, conversions), an admin-only
 * helper to simulate a HelloSafe conversion postback for a given link
 * shortCode. Tables and helpers live under _admin/.
 */
export function AdminDashboard() {
  const locale = useLocale();
  const router = useRouter();
  const [partnersList, setPartners] = useState<PartnerRow[]>([]);
  const [conversions, setConversions] = useState<ConversionRow[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [tab, setTab] = useState<"partners" | "conversions">("partners");

  const reload = useCallback(async () => {
    const [p, c] = await Promise.all([
      fetch("/api/admin/partners", { cache: "no-store" }).then((r) => r.json()),
      fetch("/api/admin/conversions", { cache: "no-store" }).then((r) =>
        r.json(),
      ),
    ]);
    if (p.partners) setPartners(p.partners);
    if (c.conversions) setConversions(c.conversions);
  }, []);

  // Initial load. `reload` is stable (useCallback with empty deps) and
  // updates state asynchronously after fetch — the cascading-render concern
  // does not apply here.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    reload();
  }, [reload]);

  const update = async (id: string, status: "approved" | "rejected") => {
    setBusy(id);
    try {
      await fetch(`/api/admin/partners/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status }),
      });
      await reload();
    } finally {
      setBusy(null);
    }
  };

  const logout = async () => {
    const { authClient } = await import("@/lib/auth-client");
    await authClient.signOut();
    router.replace("/");
  };

  const fmtEur = (cents: number) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(Math.round(cents / 100));
  const fmtNum = (n: number) => new Intl.NumberFormat(locale).format(n);
  const fmtDate = (iso: string | null) =>
    iso
      ? new Intl.DateTimeFormat(locale, {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(new Date(iso))
      : "·";

  const pending = partnersList.filter((p) => p.status === "pending");

  return (
    <div className="min-h-dvh bg-surface-100">
      <header className="h-16 bg-white border-b border-surface-200 flex items-center gap-4 px-6">
        <Link href="/">
          <Logo />
        </Link>
        <span className="ml-2 rounded-md bg-danger-50 px-2 py-0.5 text-[0.68rem] font-bold uppercase tracking-wider text-danger-600">
          Admin
        </span>
        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/dashboard"
            className="text-sm text-ink-700 hover:text-brand-700 px-3 h-9 inline-flex items-center"
          >
            Dashboard partenaire →
          </Link>
          <button
            onClick={logout}
            className="px-3 h-9 rounded-lg text-sm text-ink-700 hover:bg-surface-100"
          >
            Déconnexion
          </button>
        </div>
      </header>

      <main className="p-6 lg:p-10 max-w-7xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Back-office HelloSafe Partners
          </h1>
          <p className="mt-2 text-ink-700">
            {pending.length > 0
              ? `${pending.length} partenaire${pending.length > 1 ? "s" : ""} en attente de validation`
              : "Tous les partenaires sont validés."}
          </p>
        </div>

        <div className="flex items-center gap-2 border-b border-surface-200">
          {(["partners", "conversions"] as const).map((k) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`px-4 h-10 text-sm font-semibold border-b-2 transition-colors ${
                tab === k
                  ? "border-brand-500 text-brand-700"
                  : "border-transparent text-ink-500 hover:text-ink-900"
              }`}
            >
              {k === "partners" ? "Partenaires" : "Conversions"}
              {k === "partners" && pending.length > 0 && (
                <span className="ml-2 rounded-full bg-warning-50 px-1.5 py-0.5 text-[0.68rem] font-bold text-warning-600">
                  {pending.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {tab === "partners" && (
          <PartnersTable
            partners={partnersList}
            busyId={busy}
            onUpdate={update}
            fmtNum={fmtNum}
            fmtEur={fmtEur}
          />
        )}

        {tab === "conversions" && (
          <>
            <div className="rounded-2xl border border-surface-200 bg-white p-6">
              <h3 className="font-semibold">Simuler une conversion (démo)</h3>
              <p className="text-sm text-ink-500 mt-1">
                Entre un <code>shortCode</code> de lien (visible dans le
                dashboard d&apos;un partenaire approuvé) pour déclencher une
                conversion validée comme si elle venait du postback HelloSafe.
              </p>
              <SimulateConversionForm onDone={reload} />
            </div>

            <ConversionsTable
              conversions={conversions}
              fmtDate={fmtDate}
              fmtEur={fmtEur}
            />
          </>
        )}
      </main>
    </div>
  );
}
