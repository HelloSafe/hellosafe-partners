"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Logo } from "@/components/ui/Logo";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { LinkButton } from "@/components/ui/LinkButton";
import { useState, useEffect } from "react";

export function Header() {
  const t = useTranslations("common");
  const pathname = usePathname();
  const [loggedIn, setLoggedIn] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setLoggedIn(Boolean(d?.user));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  // Close mobile menu on navigation. The "reset transient UI state when URL
  // changes" pattern; safe here because `open` is local UI state.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open.
  useEffect(() => {
    if (typeof document === "undefined") return;
    const original = document.body.style.overflow;
    document.body.style.overflow = open ? "hidden" : original;
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  const nav = [
    { href: "/coach", label: t("nav.coach"), highlight: true },
    { href: "/why-partner", label: t("nav.why") },
    { href: "/how-it-works", label: t("nav.how") },
    { href: "/products", label: t("nav.products") },
  ] as const;

  return (
    <header className="sticky top-0 z-40 border-b border-surface-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-6 lg:gap-6 lg:px-10">
        <Link
          href="/"
          className="shrink-0"
          onClick={() => setOpen(false)}
          aria-label={t("brand")}
        >
          <Logo />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1 flex-1">
          {nav.map((item) => {
            const active = pathname.startsWith(item.href);
            const highlight = "highlight" in item && item.highlight;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 h-9 inline-flex items-center gap-1.5 rounded-full text-sm font-medium transition-colors ${
                  active
                    ? "text-brand-500 bg-brand-50"
                    : highlight
                      ? "text-brand-700 bg-brand-50/60 hover:bg-brand-50"
                      : "text-ink-700 hover:text-brand-500 hover:bg-surface-100"
                }`}
              >
                {highlight && (
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent-500" />
                )}
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop CTAs + lang */}
        <div className="hidden lg:flex items-center gap-2 ml-auto">
          <LanguageSwitcher />
          {loggedIn ? (
            <LinkButton href="/dashboard" size="sm">
              {t("cta.goToDashboard")}
            </LinkButton>
          ) : (
            <>
              <LinkButton href="/login" variant="ghost" size="sm">
                {t("cta.login")}
              </LinkButton>
              <LinkButton href="/signup" size="sm">
                {t("cta.becomePartner")}
              </LinkButton>
            </>
          )}
        </div>

        {/* Mobile right side: primary CTA + burger */}
        <div className="flex lg:hidden items-center gap-2 ml-auto">
          {loggedIn ? (
            <LinkButton href="/dashboard" size="sm">
              {t("cta.goToDashboard")}
            </LinkButton>
          ) : (
            <LinkButton href="/signup" size="sm">
              {t("cta.signup")}
            </LinkButton>
          )}
          <button
            type="button"
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-surface-200 bg-white text-ink-900 transition-colors hover:bg-surface-100 focus-ring"
          >
            <BurgerIcon open={open} />
          </button>
        </div>
      </div>

      {/* Mobile sheet */}
      {open && (
        <div id="mobile-nav" className="lg:hidden fixed inset-x-0 top-16 bottom-0 z-30">
          <button
            type="button"
            aria-label="Fermer"
            className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="relative bg-white border-b border-surface-200 shadow-xl">
            <nav className="px-6 py-5 flex flex-col gap-1">
              {nav.map((item) => {
                const active = pathname.startsWith(item.href);
                const highlight = "highlight" in item && item.highlight;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-4 py-3 rounded-2xl text-base font-display font-semibold transition-colors flex items-center gap-2 ${
                      active
                        ? "text-brand-500 bg-brand-50"
                        : highlight
                          ? "text-brand-700 bg-brand-50/60"
                          : "text-ink-900 hover:bg-surface-100"
                    }`}
                  >
                    {highlight && (
                      <span className="inline-block h-2 w-2 rounded-full bg-accent-500" />
                    )}
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="px-6 py-5 border-t border-surface-200 flex flex-col gap-3">
              {!loggedIn && (
                <LinkButton
                  href="/login"
                  variant="outline"
                  size="md"
                  className="w-full justify-center"
                >
                  {t("cta.login")}
                </LinkButton>
              )}
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs uppercase tracking-wider font-display font-bold text-ink-500">
                  {t("nav.lang")}
                </span>
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function BurgerIcon({ open }: { open: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden>
      <path
        d={open ? "M5 5l10 10M15 5l-10 10" : "M3 6h14M3 14h14"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
