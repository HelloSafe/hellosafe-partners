"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { Logo } from "@/components/ui/Logo";

type PartnerRow = {
  id: string;
  userId: string;
  partnerCode: string;
  companyName: string;
  contactName: string;
  website: string | null;
  audience: string | null;
  country: string | null;
  monthlyVisitors: number | null;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  approvedAt: string | null;
  email: string;
  clickCount: number;
  salesCount: number;
  commissionCents: number;
};

type ConversionRow = {
  id: string;
  externalOrderId: string;
  amountCents: number;
  commissionCents: number;
  currency: string;
  status: "pending" | "validated" | "cancelled";
  createdAt: string;
  validatedAt: string | null;
  partnerCompany: string;
  partnerCode: string;
  linkLabel: string | null;
  linkShortCode: string | null;
  subId: string | null;
};

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

  const update = async (
    id: string,
    status: "approved" | "rejected" | "pending",
  ) => {
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

  const simulateConversion = async (shortCode: string) => {
    setBusy(shortCode);
    try {
      await fetch("/api/admin/test-conversion", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ shortCode, status: "validated" }),
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

  const eur = (cents: number) =>
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
          <section className="overflow-hidden rounded-2xl border border-surface-200 bg-white">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-surface-50 text-ink-500">
                  <tr className="text-left">
                    <Th>Société</Th>
                    <Th>Contact</Th>
                    <Th>Site</Th>
                    <Th>Audience</Th>
                    <Th className="text-right">Clics</Th>
                    <Th className="text-right">Ventes</Th>
                    <Th className="text-right">Commissions</Th>
                    <Th>Statut</Th>
                    <Th>Actions</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-200">
                  {partnersList.map((p) => (
                    <tr key={p.id} className="hover:bg-surface-50 align-top">
                      <Td>
                        <p className="font-semibold">{p.companyName}</p>
                        <p className="text-xs text-ink-500 font-mono mt-0.5">
                          {p.partnerCode}
                        </p>
                      </Td>
                      <Td>
                        <p>{p.contactName}</p>
                        <p className="text-xs text-ink-500 mt-0.5">{p.email}</p>
                      </Td>
                      <Td className="max-w-xs">
                        {p.website ? (
                          <a
                            href={p.website}
                            target="_blank"
                            rel="noopener"
                            className="text-brand-700 hover:underline text-xs truncate block"
                          >
                            {p.website}
                          </a>
                        ) : (
                          <span className="text-ink-300 text-xs">·</span>
                        )}
                        <p className="text-xs text-ink-500 mt-0.5">
                          {p.country || "·"}
                          {p.monthlyVisitors
                            ? ` · ${fmtNum(p.monthlyVisitors)}/mo`
                            : ""}
                        </p>
                      </Td>
                      <Td className="max-w-sm">
                        <p className="text-xs text-ink-700 line-clamp-3">
                          {p.audience || "·"}
                        </p>
                      </Td>
                      <Td className="text-right tabular-nums">
                        {fmtNum(p.clickCount)}
                      </Td>
                      <Td className="text-right tabular-nums">
                        {fmtNum(p.salesCount)}
                      </Td>
                      <Td className="text-right tabular-nums font-semibold">
                        {eur(p.commissionCents)}
                      </Td>
                      <Td>
                        <StatusBadge status={p.status} />
                      </Td>
                      <Td>
                        <div className="flex flex-col gap-1">
                          {p.status !== "approved" && (
                            <button
                              disabled={busy === p.id}
                              onClick={() => update(p.id, "approved")}
                              className="rounded-lg bg-success-50 text-success-600 text-xs font-semibold px-2.5 h-7 hover:bg-success-600 hover:text-white transition-colors"
                            >
                              Approuver
                            </button>
                          )}
                          {p.status !== "rejected" && (
                            <button
                              disabled={busy === p.id}
                              onClick={() => update(p.id, "rejected")}
                              className="rounded-lg bg-danger-50 text-danger-600 text-xs font-semibold px-2.5 h-7 hover:bg-danger-600 hover:text-white transition-colors"
                            >
                              Rejeter
                            </button>
                          )}
                        </div>
                      </Td>
                    </tr>
                  ))}
                  {partnersList.length === 0 && (
                    <tr>
                      <td
                        colSpan={9}
                        className="px-4 py-10 text-center text-sm text-ink-500"
                      >
                        Aucun partenaire inscrit.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
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

            <section className="overflow-hidden rounded-2xl border border-surface-200 bg-white">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-surface-50 text-ink-500">
                    <tr className="text-left">
                      <Th>Date</Th>
                      <Th>Partenaire</Th>
                      <Th>Lien</Th>
                      <Th>Sub-ID</Th>
                      <Th>Order ID</Th>
                      <Th className="text-right">Montant</Th>
                      <Th className="text-right">Commission</Th>
                      <Th>Statut</Th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-200">
                    {conversions.map((c) => (
                      <tr key={c.id} className="hover:bg-surface-50">
                        <Td className="text-ink-500 text-xs">{fmtDate(c.createdAt)}</Td>
                        <Td>
                          <p className="font-medium">{c.partnerCompany}</p>
                          <p className="text-xs text-ink-500 font-mono">
                            {c.partnerCode}
                          </p>
                        </Td>
                        <Td>
                          {c.linkLabel ?? "·"}
                          {c.linkShortCode && (
                            <p className="text-xs text-ink-500 font-mono mt-0.5">
                              {c.linkShortCode}
                            </p>
                          )}
                        </Td>
                        <Td>
                          {c.subId ? (
                            <code className="font-mono text-xs rounded bg-surface-100 px-1.5 py-0.5">
                              {c.subId}
                            </code>
                          ) : (
                            <span className="text-ink-300 text-xs">·</span>
                          )}
                        </Td>
                        <Td>
                          <code className="font-mono text-xs">
                            {c.externalOrderId}
                          </code>
                        </Td>
                        <Td className="text-right tabular-nums">
                          {eur(c.amountCents)}
                        </Td>
                        <Td className="text-right tabular-nums font-semibold">
                          {eur(c.commissionCents)}
                        </Td>
                        <Td>
                          <ConversionStatus status={c.status} />
                        </Td>
                      </tr>
                    ))}
                    {conversions.length === 0 && (
                      <tr>
                        <td
                          colSpan={8}
                          className="px-4 py-10 text-center text-sm text-ink-500"
                        >
                          Pas encore de conversion. Utilise le formulaire
                          ci-dessus pour en simuler une.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function SimulateConversionForm({ onDone }: { onDone: () => Promise<void> }) {
  const [shortCode, setShortCode] = useState("");
  const [amount, setAmount] = useState("79");
  const [commission, setCommission] = useState("12");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/test-conversion", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          shortCode: shortCode.trim(),
          amount: Number(amount),
          commission: Number(commission),
          status: "validated",
        }),
      });
      const d = await res.json();
      if (!res.ok) {
        setMsg(`Erreur : ${d.error ?? res.status}`);
      } else {
        setMsg(`Conversion créée : ${d.externalOrderId}`);
        setShortCode("");
        await onDone();
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="mt-4 grid gap-3 sm:grid-cols-[1fr_100px_100px_auto]"
    >
      <input
        required
        value={shortCode}
        onChange={(e) => setShortCode(e.target.value)}
        placeholder="shortCode (ex: wr4h2cx5)"
        className="rounded-lg border border-surface-300 px-3 h-10 text-sm font-mono"
      />
      <input
        required
        type="number"
        step="1"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount €"
        className="rounded-lg border border-surface-300 px-3 h-10 text-sm"
      />
      <input
        required
        type="number"
        step="0.01"
        value={commission}
        onChange={(e) => setCommission(e.target.value)}
        placeholder="Commission €"
        className="rounded-lg border border-surface-300 px-3 h-10 text-sm"
      />
      <button
        type="submit"
        disabled={busy}
        className="rounded-lg bg-brand-500 text-white text-sm font-semibold px-4 h-10 hover:bg-brand-600 disabled:opacity-50"
      >
        Créer {busy ? "…" : "→"}
      </button>
      {msg && <p className="sm:col-span-4 text-xs text-ink-500">{msg}</p>}
    </form>
  );
}

function StatusBadge({ status }: { status: "pending" | "approved" | "rejected" }) {
  const map = {
    pending: { cls: "bg-warning-50 text-warning-600", label: "En attente" },
    approved: { cls: "bg-success-50 text-success-600", label: "Approuvé" },
    rejected: { cls: "bg-danger-50 text-danger-600", label: "Rejeté" },
  };
  const s = map[status];
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${s.cls}`}
    >
      {s.label}
    </span>
  );
}

function ConversionStatus({ status }: { status: "pending" | "validated" | "cancelled" }) {
  const map = {
    pending: { cls: "bg-surface-100 text-ink-500", label: "En attente" },
    validated: { cls: "bg-success-50 text-success-600", label: "Validée" },
    cancelled: { cls: "bg-danger-50 text-danger-600", label: "Annulée" },
  };
  const s = map[status];
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${s.cls}`}
    >
      {s.label}
    </span>
  );
}

function Th({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`px-4 py-3 text-[0.72rem] font-semibold uppercase tracking-wider whitespace-nowrap ${className}`}
    >
      {children}
    </th>
  );
}
function Td({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={`px-4 py-3 ${className}`}>{children}</td>;
}
