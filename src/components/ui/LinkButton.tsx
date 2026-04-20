import type { ComponentProps } from "react";
import { Link } from "@/i18n/navigation";
import { clsx } from "@/lib/clsx";

type Variant = "primary" | "secondary" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

type Props = ComponentProps<typeof Link> & {
  variant?: Variant;
  size?: Size;
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors focus-ring";

const variants: Record<Variant, string> = {
  primary: "bg-brand-500 text-white hover:bg-brand-600 shadow-sm",
  secondary:
    "bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-100",
  ghost: "text-ink-700 hover:bg-surface-100",
  outline:
    "border border-surface-300 bg-white text-ink-900 hover:border-brand-300 hover:text-brand-700",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-11 px-5 text-[0.95rem]",
  lg: "h-12 px-6 text-base",
};

export function LinkButton({
  className,
  variant = "primary",
  size = "md",
  ...props
}: Props) {
  return (
    <Link
      className={clsx(base, variants[variant], sizes[size], className)}
      {...props}
    />
  );
}
