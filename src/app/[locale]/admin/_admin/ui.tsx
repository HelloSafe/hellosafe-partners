/** Shared presentational primitives for the admin dashboard. */

export function Th({
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

export function Td({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={`px-4 py-3 ${className}`}>{children}</td>;
}

export function StatusBadge({
  status,
}: {
  status: "pending" | "approved" | "rejected";
}) {
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

export function ConversionStatus({
  status,
}: {
  status: "pending" | "validated" | "cancelled";
}) {
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
