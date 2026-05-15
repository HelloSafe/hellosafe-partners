"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AccountTab } from "./AccountTab";
import { CompanyTab } from "./CompanyTab";

type Tab = "account" | "company";

export function ProfileTabs() {
  const t = useTranslations("dashboard.account");
  const tabs: { id: Tab; label: string }[] = [
    { id: "account", label: t("tabs.account") },
    { id: "company", label: t("tabs.company") },
  ];

  const [active, setActive] = useState<Tab>(() => {
    if (typeof window === "undefined") return "account";
    const url = new URL(window.location.href);
    const t = url.searchParams.get("tab") as Tab | null;
    return tabs.some((x) => x.id === t) ? (t as Tab) : "account";
  });

  const setTab = (next: Tab) => {
    setActive(next);
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    url.searchParams.set("tab", next);
    window.history.replaceState({}, "", url.toString());
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-ink-900">
        {t("title")}
      </h1>
      <p className="mt-2 text-ink-700 max-w-2xl">{t("subtitle")}</p>

      <nav
        className="mt-8 flex gap-1 border-b border-surface-200"
        role="tablist"
      >
        {tabs.map((tab) => {
          const on = active === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={on}
              onClick={() => setTab(tab.id)}
              className={`px-4 h-10 text-sm font-medium transition-colors border-b-2 -mb-[2px] ${
                on
                  ? "border-brand-500 text-brand-700"
                  : "border-transparent text-ink-700 hover:text-brand-700"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>

      <div className="mt-8">
        {active === "account" && <AccountTab />}
        {active === "company" && <CompanyTab />}
      </div>
    </div>
  );
}
