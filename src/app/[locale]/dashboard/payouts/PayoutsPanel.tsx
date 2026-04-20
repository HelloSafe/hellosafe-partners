"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";

type Payout = {
  id: string;
  period: string;
  sales: number;
  grossCents: number;
  status: "paid" | "processing" | "pending";
  date: string | null;
};

type Data = {
  currentPeriod: string;
  totalPaidCents: number;
  current: Payout | null;
  payouts: Payout[];
};

export function PayoutsPanel() {
  const t = useTranslations("dashboard.payouts");
  const locale = useLocale();
  const [data, setData] = useState<Data | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/payouts", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (!d.error) setData(d as Data);
      });
  }, []);

  if (!data) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  const eur = (n: number) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(n);
  const fmtNum = (n: number) => new Intl.NumberFormat(locale).format(n);
  const fmtDate = (iso: string | null) =>
    iso
      ? new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(iso))
      : "·";
  const fmtPeriod = (period: string) => {
    const [y, m] = period.split("-").map(Number);
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "long",
    }).format(new Date(y, m - 1));
  };

  const pending = data.current;
  const totalPaid = Math.round(data.totalPaidCents / 100);

  return (
    <div className="space-y-10 max-w-7xl">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="mt-2 text-ink-700 max-w-2xl">{t("subtitle")}</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-ink-900 text-white p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-300">
            {t("nextPayout")}
          </p>
          <p className="mt-2 text-3xl font-bold">
            {pending ? eur(Math.round(pending.grossCents / 100)) : "·"}
          </p>
          <p className="mt-1 text-sm text-white/60">
            {pending ? fmtPeriod(pending.period) : ""}
          </p>
        </div>
        <div className="rounded-2xl border border-surface-200 bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">
            Cumul payé
          </p>
          <p className="mt-2 text-3xl font-bold">{eur(totalPaid)}</p>
          <p className="mt-1 text-sm text-ink-500">
            {data.payouts.filter((p) => p.status === "paid").length} virements
          </p>
        </div>
        <div className="rounded-2xl border border-surface-200 bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">
            Méthode
          </p>
          <p className="mt-2 text-xl font-semibold">À configurer</p>
          <p className="mt-1 text-sm text-ink-500">
            SEPA, Wire ou Wise
          </p>
        </div>
      </div>

      <section>
        <div className="overflow-hidden rounded-2xl border border-surface-200 bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-surface-50 text-ink-500">
                <tr className="text-left">
                  <Th>{t("columns.period")}</Th>
                  <Th className="text-right">{t("columns.sales")}</Th>
                  <Th className="text-right">{t("columns.gross")}</Th>
                  <Th>{t("columns.status")}</Th>
                  <Th>{t("columns.date")}</Th>
                  <Th>{t("columns.invoice")}</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-200">
                {data.payouts.map((p) => (
                  <tr key={p.id} className="hover:bg-surface-50">
                    <Td className="font-medium">{fmtPeriod(p.period)}</Td>
                    <Td className="text-right tabular-nums">{fmtNum(p.sales)}</Td>
                    <Td className="text-right tabular-nums font-semibold">
                      {eur(Math.round(p.grossCents / 100))}
                    </Td>
                    <Td>
                      <Badge status={p.status} t={t} />
                    </Td>
                    <Td className="text-ink-500">{fmtDate(p.date)}</Td>
                    <Td>
                      {p.status === "paid" ? (
                        <a
                          href="#"
                          className="text-brand-700 text-xs font-semibold hover:underline"
                        >
                          {t("downloadInvoice")} ↓
                        </a>
                      ) : (
                        <span className="text-ink-300 text-xs">·</span>
                      )}
                    </Td>
                  </tr>
                ))}
                {data.payouts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-sm text-ink-500">
                      Aucune conversion pour le moment. Vos premières commissions apparaîtront ici dès la première vente.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}

function Badge({
  status,
  t,
}: {
  status: "paid" | "processing" | "pending";
  t: (k: string) => string;
}) {
  const cls =
    status === "paid"
      ? "bg-success-50 text-success-600"
      : status === "processing"
      ? "bg-warning-50 text-warning-600"
      : "bg-surface-100 text-ink-500";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${status === "paid" ? "bg-success-600" : status === "processing" ? "bg-warning-500" : "bg-ink-300"}`}
      />
      {t(status)}
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
