/**
 * Reusable "coming soon" page block for dashboard sections that aren't built
 * yet. Keeps the sidebar nav usable without breaking the page on click.
 */
import { useTranslations } from "next-intl";

export function SoonPlaceholder({
  title,
  pitch,
  showRequestAccess = false,
}: {
  /** Section title shown above the soon block. */
  title: string;
  /** One short paragraph that previews what this section will do. */
  pitch?: string;
  /** Show a "Request access" CTA pointing to the partner mailbox. */
  showRequestAccess?: boolean;
}) {
  const t = useTranslations("dashboard.soon");
  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-ink-900">
        {title}
      </h1>
      {pitch && (
        <p className="text-ink-700 leading-relaxed max-w-2xl">{pitch}</p>
      )}
      <div className="rounded-2xl border border-dashed border-surface-300 bg-white p-8 text-center">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-warning-50 text-warning-600 text-2xl">
          ⏳
        </span>
        <h2 className="mt-4 text-lg font-bold text-ink-900">{t("title")}</h2>
        <p className="mt-2 text-sm text-ink-700 max-w-md mx-auto leading-relaxed">
          {t("body")}
        </p>
        {showRequestAccess && (
          <a
            href="mailto:partners@hellosafe.com?subject=Demande%20d%27acc%C3%A8s%20%E2%80%94%20Atlas"
            className="mt-5 inline-flex h-10 px-5 items-center justify-center rounded-lg bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition-colors"
          >
            {t("requestAccess")}
          </a>
        )}
      </div>
    </div>
  );
}
