import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { Link } from "@/i18n/navigation";
import { ArrowRightIcon, PersonaGlyph } from "./icons";

/** "Tu es..." persona cards section linking to /for/<slug>. */
export function ProfileSelector() {
  const t = useTranslations("landing.forWho");
  const items = t.raw("items") as {
    slug: string;
    label: string;
    tag: string;
    blurb: string;
  }[];
  return (
    <section className="ds-section">
      <Container>
        <div className="max-w-3xl">
          <span className="ds-corpo">{t("eyebrow")}</span>
          <h2 className="ds-h2 mt-3 text-ink-900">{t("title")}</h2>
          <p className="ds-body mt-4 text-ink-700">{t("subtitle")}</p>
        </div>
        <ul className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <li key={item.slug}>
              <Link
                href={`/for/${item.slug}` as never}
                className="hs-card-hover group flex flex-col h-full rounded-2xl border border-surface-200 bg-white p-6 hover:border-brand-300"
              >
                <div className="mb-4 flex h-28 items-center justify-center rounded-xl bg-gradient-to-br from-brand-50 via-white to-accent-50">
                  <PersonaGlyph slug={item.slug} />
                </div>
                <span className="inline-flex self-start items-center rounded-full bg-brand-50 px-2.5 py-1 text-[0.68rem] font-display font-bold uppercase tracking-wider text-brand-700">
                  {item.tag}
                </span>
                <h3 className="mt-4 text-lg font-semibold leading-snug text-ink-900">
                  {item.label}
                </h3>
                <p className="mt-2 text-sm text-ink-700 leading-relaxed flex-1">
                  {item.blurb}
                </p>
                <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-brand-700">
                  {t("linkLabel")}
                  <ArrowRightIcon className="transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
