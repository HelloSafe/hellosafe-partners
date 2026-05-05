/** Shared presentational primitives for the onboarding flow. */

export const inputCls =
  "w-full rounded-xl border border-surface-300 bg-white px-3.5 h-11 text-[0.95rem] focus-ring focus:border-brand-500";

export function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <ol className="flex items-center gap-2 mb-10">
      {Array.from({ length: total }, (_, i) => i + 1).map((i) => (
        <li
          key={i}
          className={`h-1.5 flex-1 rounded-full transition-colors ${
            i <= step ? "bg-brand-500" : "bg-surface-200"
          }`}
        />
      ))}
    </ol>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-semibold text-ink-900 mb-1">
        {label}
      </span>
      {hint && <span className="block text-xs text-ink-500 mb-1.5">{hint}</span>}
      {children}
    </label>
  );
}

export function FeatureBadge({ title, body }: { title: string; body: string }) {
  return (
    <li className="rounded-2xl border border-surface-200 bg-white px-4 py-3">
      <p className="font-semibold text-ink-900">{title}</p>
      <p className="text-sm text-ink-500 mt-0.5">{body}</p>
    </li>
  );
}
