import Image from "next/image";
import { useTranslations } from "next-intl";

export function Logo({
  className = "",
  withSuffix = true,
}: {
  className?: string;
  withSuffix?: boolean;
}) {
  const t = useTranslations("common");
  return (
    <span
      className={`inline-flex items-center gap-2 font-semibold text-ink-900 ${className}`}
    >
      <Image
        src="/hellosafe-logo.svg"
        alt={t("brand")}
        width={156}
        height={36}
        priority
        className="h-9 w-auto"
      />
      {withSuffix && (
        <span className="rounded-md bg-brand-50 px-2 py-1 text-[0.8rem] font-display font-bold uppercase tracking-wider text-brand-500 leading-none">
          {t("brandSuffix")}
        </span>
      )}
    </span>
  );
}
