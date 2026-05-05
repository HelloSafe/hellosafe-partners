"use client";

import type { PartnerRow } from "./types";
import { StatusBadge, Td, Th } from "./ui";

export function PartnersTable({
  partners,
  busyId,
  onUpdate,
  fmtNum,
  fmtEur,
}: {
  partners: PartnerRow[];
  busyId: string | null;
  onUpdate: (id: string, status: "approved" | "rejected") => Promise<void>;
  fmtNum: (n: number) => string;
  fmtEur: (cents: number) => string;
}) {
  return (
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
            {partners.map((p) => (
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
                  {fmtEur(p.commissionCents)}
                </Td>
                <Td>
                  <StatusBadge status={p.status} />
                </Td>
                <Td>
                  <div className="flex flex-col gap-1">
                    {p.status !== "approved" && (
                      <button
                        disabled={busyId === p.id}
                        onClick={() => onUpdate(p.id, "approved")}
                        className="rounded-lg bg-success-50 text-success-600 text-xs font-semibold px-2.5 h-7 hover:bg-success-600 hover:text-white transition-colors"
                      >
                        Approuver
                      </button>
                    )}
                    {p.status !== "rejected" && (
                      <button
                        disabled={busyId === p.id}
                        onClick={() => onUpdate(p.id, "rejected")}
                        className="rounded-lg bg-danger-50 text-danger-600 text-xs font-semibold px-2.5 h-7 hover:bg-danger-600 hover:text-white transition-colors"
                      >
                        Rejeter
                      </button>
                    )}
                  </div>
                </Td>
              </tr>
            ))}
            {partners.length === 0 && (
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
  );
}
