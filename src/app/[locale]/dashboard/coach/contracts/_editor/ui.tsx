/** Shared form primitives for the contract editor. */

import { inputCls } from "./constants";

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

export function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <Field label={label}>
      <input
        type="number"
        min={0}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className={inputCls}
      />
    </Field>
  );
}

export function CheckboxField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (c: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-brand-500"
      />
      <span className="text-sm font-medium text-ink-900">{label}</span>
    </label>
  );
}
