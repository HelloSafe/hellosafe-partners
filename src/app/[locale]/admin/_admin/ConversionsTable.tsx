"use client";

import type { ConversionRow } from "./types";
import { ConversionStatus, Td, Th } from "./ui";

export function ConversionsTable({
  conversions,
  fmtDate,
  fmtEur,
}: {
  conversions: ConversionRow[];
  fmtDate: (iso: string | null) => string;
  fmtEur: (cents: number) => string;
}) {
  return (
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
                  <code className="font-mono text-xs">{c.externalOrderId}</code>
                </Td>
                <Td className="text-right tabular-nums">
                  {fmtEur(c.amountCents)}
                </Td>
                <Td className="text-right tabular-nums font-semibold">
                  {fmtEur(c.commissionCents)}
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
                  Pas encore de conversion. Utilise le formulaire ci-dessus
                  pour en simuler une.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
