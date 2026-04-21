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

  const nav = [
    { href: "/why-partner", label: t("nav.why") },
    { href: "/how-it-works", label: t("nav.how") },
    { href: "/faq", label: t("nav.faq") },
  ] as const;

  return (
    <header className="sticky top-0 z-40 border-b border-surface-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-6 lg:px-10">
        <Link href="/" className="shrink-0">
          <Logo />
        </Link>
        <nav className="hidden lg:flex items-center gap-1 flex-1">
          {nav.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 h-9 inline-flex items-center rounded-full text-sm font-medium transition-colors ${
                  active
                    ? "text-brand-500 bg-brand-50"
                    : "text-ink-700 hover:text-brand-500 hover:bg-surface-100"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2 ml-auto">
          <LanguageSwitcher />
          {loggedIn ? (
            <LinkButton href="/dashboard" size="sm">
              {t("cta.goToDashboard")}
            </LinkButton>
          ) : (
            <>
              <LinkButton href="/login" variant="ghost" size="sm" className="hidden sm:inline-flex">
                {t("cta.login")}
              </LinkButton>
              <LinkButton href="/signup" size="sm">
                {t("cta.becomePartner")}
              </LinkButton>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
