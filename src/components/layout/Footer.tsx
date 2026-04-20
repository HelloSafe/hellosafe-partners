import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/ui/Logo";

export function Footer() {
  const t = useTranslations("common.footer");
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-surface-200 bg-surface-50 mt-auto">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 py-14">
        <div className="grid gap-10 lg:grid-cols-[2fr_3fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-sm text-sm text-ink-500">{t("tagline")}</p>
            <p className="mt-6 text-xs text-ink-300">{t("internal")}</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div>
              <h3 className="text-[0.75rem] font-bold uppercase tracking-wider text-ink-500">
                {t("columns.program")}
              </h3>
              <ul className="mt-3 space-y-2 text-sm">
                <li><Link className="text-ink-700 hover:text-brand-700" href="/why-partner">{t("links.why")}</Link></li>
                <li><Link className="text-ink-700 hover:text-brand-700" href="/how-it-works">{t("links.how")}</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-[0.75rem] font-bold uppercase tracking-wider text-ink-500">
                {t("columns.resources")}
              </h3>
              <ul className="mt-3 space-y-2 text-sm">
                <li><Link className="text-ink-700 hover:text-brand-700" href="/faq">{t("links.faq")}</Link></li>
                <li><a className="text-ink-700 hover:text-brand-700" href="#">{t("links.contact")}</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-[0.75rem] font-bold uppercase tracking-wider text-ink-500">
                {t("columns.legal")}
              </h3>
              <ul className="mt-3 space-y-2 text-sm">
                <li><a className="text-ink-700 hover:text-brand-700" href="#">{t("links.terms")}</a></li>
                <li><a className="text-ink-700 hover:text-brand-700" href="#">{t("links.privacy")}</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-surface-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-ink-500">
          <span>{t("copyright", { year })}</span>
          <span className="font-mono text-ink-300">v0.1 · demo</span>
        </div>
      </div>
    </footer>
  );
}
