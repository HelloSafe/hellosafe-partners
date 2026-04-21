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
        width={121}
        height={28}
        priority
        className="h-7 w-auto"
      />
      {withSuffix && (
        <span className="rounded-md bg-brand-50 px-1.5 py-0.5 text-[0.68rem] font-display font-bold uppercase tracking-wider text-brand-500 leading-none">
          {t("brandSuffix")}
        </span>
      )}
    </span>
  );
}
