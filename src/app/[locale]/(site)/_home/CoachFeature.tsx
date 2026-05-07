/**
 * Coach Atlas feature section on the home page. Sits between Gains and
 * ProfileSelector. Reuses the compact "hero" variant of the
 * CoachReportMockup so the whole section fits comfortably above the fold
 * on desktop.
 */
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/LinkButton";
import { CoachReportMockup } from "@/components/landing/CoachReportMockup";

export function CoachFeature() {
  const t = useTranslations("landing.coachFeature");
  const bullets = t.raw("bullets") as string[];
  return (
    <section className="ds-section bg-surface-50 border-y border-surface-200 relative overflow-hidden">
      <div className="absolute -top-40 -right-40 h-[28rem] w-[28rem] rounded-full bg-brand-200/30 blur-3xl" />
      <div className="absolute -bottom-32 -left-32 h-[24rem] w-[24rem] rounded-full bg-accent-200/20 blur-3xl" />
      <Container className="relative">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="max-w-xl">
            <span className="ds-corpo">{t("eyebrow")}</span>
            <h2 className="ds-h2 mt-3 text-ink-900">{t("title")}</h2>
            <p className="ds-body mt-5 text-ink-700">{t("body")}</p>
            <ul className="mt-7 space-y-3">
              {bullets.map((b) => (
                <li
                  key={b}
                  className="flex items-start gap-3 text-sm text-ink-700"
                >
                  <CheckIcon />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <LinkButton href={"/coach" as never} size="lg">
                {t("primaryCta")} →
              </LinkButton>
              <LinkButton href="/signup" variant="outline" size="lg">
                {t("secondaryCta")}
              </LinkButton>
            </div>
          </div>
          <CoachReportMockup variant="hero" />
        </div>
      </Container>
    </section>
  );
}

function CheckIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      aria-hidden
      className="mt-0.5 shrink-0 text-success-500"
    >
      <circle cx="9" cy="9" r="9" fill="currentColor" fillOpacity="0.12" />
      <path
        d="M5 9.5l3 3 5.5-6"
        stroke="currentColor"
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
