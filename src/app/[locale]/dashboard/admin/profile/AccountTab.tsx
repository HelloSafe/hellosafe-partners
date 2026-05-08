"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { authClient } from "@/lib/auth-client";

type Profile = {
  contactName: string;
  email: string | null;
  emailVerified: boolean;
  partnerCode: string;
  memberSince: string; // ISO
};

type Toast = { kind: "ok" | "error"; text: string } | null;

export function AccountTab() {
  const t = useTranslations("dashboard.account.accountForm");

  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileToast, setProfileToast] = useState<Toast>(null);

  const [pwdCurrent, setPwdCurrent] = useState("");
  const [pwdNew, setPwdNew] = useState("");
  const [savingPwd, setSavingPwd] = useState(false);
  const [pwdToast, setPwdToast] = useState<Toast>(null);

  // Initial load
  useEffect(() => {
    fetch("/api/account/profile", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: Profile) => {
        setProfile(d);
        setName(d.contactName ?? "");
        setEmail(d.email ?? "");
      })
      .catch(() => {});
  }, []);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSavingProfile(true);
    setProfileToast(null);
    try {
      // 1) name (always — cheap)
      if (name.trim() !== profile.contactName) {
        const res = await fetch("/api/account/profile", {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ contactName: name.trim() }),
        });
        if (!res.ok) {
          setProfileToast({ kind: "error", text: t("errorGeneric") });
          setSavingProfile(false);
          return;
        }
      }
      // 2) email (only if changed) — Better Auth will send a verification mail
      const trimmedEmail = email.trim().toLowerCase();
      if (profile.email && trimmedEmail !== profile.email.toLowerCase()) {
        const r = await authClient.changeEmail({ newEmail: trimmedEmail });
        if (r.error) {
          const msg = String(r.error.message ?? "").toLowerCase();
          setProfileToast({
            kind: "error",
            text: msg.includes("already") || msg.includes("taken")
              ? t("errorEmailUsed")
              : t("errorGeneric"),
          });
          setSavingProfile(false);
          return;
        }
      }
      setProfileToast({ kind: "ok", text: t("saved") });
      setProfile({ ...profile, contactName: name.trim(), email: trimmedEmail });
    } catch {
      setProfileToast({ kind: "error", text: t("errorGeneric") });
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPwd(true);
    setPwdToast(null);
    const r = await authClient.changePassword({
      currentPassword: pwdCurrent,
      newPassword: pwdNew,
      revokeOtherSessions: true,
    });
    if (r.error) {
      const msg = String(r.error.message ?? "").toLowerCase();
      setPwdToast({
        kind: "error",
        text: msg.includes("incorrect") || msg.includes("invalid")
          ? t("errorPasswordCurrent")
          : t("errorGeneric"),
      });
    } else {
      setPwdCurrent("");
      setPwdNew("");
      setPwdToast({ kind: "ok", text: t("passwordChanged") });
    }
    setSavingPwd(false);
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ─── Section Contact ─────────────────────────────────────────────── */}
      <FormCard
        title={t("sectionContact")}
        body={t("sectionContactBody")}
        toast={profileToast}
      >
        <form onSubmit={saveProfile} className="space-y-5">
          <Field label={t("name")}>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label={t("email")} hint={t("emailHint")}>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label={t("language")} hint={t("languageHint")}>
            <select className={`${inputCls} text-ink-500`} disabled value="fr">
              <option value="fr">Français</option>
            </select>
          </Field>
          <button
            type="submit"
            disabled={savingProfile}
            className="h-10 px-5 rounded-lg bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 disabled:opacity-50 transition-colors"
          >
            {savingProfile ? "…" : t("save")}
          </button>
        </form>
      </FormCard>

      {/* ─── Section Password ────────────────────────────────────────────── */}
      <FormCard
        title={t("sectionPassword")}
        body={t("sectionPasswordBody")}
        toast={pwdToast}
      >
        <form onSubmit={changePassword} className="space-y-5">
          <Field label={t("currentPassword")}>
            <input
              required
              type="password"
              value={pwdCurrent}
              onChange={(e) => setPwdCurrent(e.target.value)}
              className={inputCls}
              autoComplete="current-password"
            />
          </Field>
          <Field label={t("newPassword")}>
            <input
              required
              minLength={8}
              type="password"
              value={pwdNew}
              onChange={(e) => setPwdNew(e.target.value)}
              className={inputCls}
              autoComplete="new-password"
            />
          </Field>
          <button
            type="submit"
            disabled={savingPwd}
            className="h-10 px-5 rounded-lg bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 disabled:opacity-50 transition-colors"
          >
            {savingPwd ? "…" : t("changePassword")}
          </button>
        </form>
      </FormCard>

      {/* ─── Section Meta ────────────────────────────────────────────────── */}
      <FormCard title={t("sectionMeta")}>
        <dl className="grid gap-4 sm:grid-cols-2">
          <Stat label={t("partnerCode")} value={profile.partnerCode} mono />
          <Stat
            label={t("memberSince")}
            value={new Intl.DateTimeFormat("fr-FR", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            }).format(new Date(profile.memberSince))}
          />
        </dl>
      </FormCard>
    </div>
  );
}

// ─── Local UI primitives ──────────────────────────────────────────────────────

const inputCls =
  "w-full rounded-lg border border-surface-300 bg-white px-3.5 h-11 text-[0.95rem] text-ink-900 focus-ring transition-colors focus:border-brand-500";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-ink-900 mb-1">
        {label}
      </span>
      {hint && (
        <span className="block text-xs text-ink-500 mb-1.5 leading-relaxed">
          {hint}
        </span>
      )}
      {children}
    </label>
  );
}

function FormCard({
  title,
  body,
  toast,
  children,
}: {
  title: string;
  body?: string;
  toast?: Toast;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-surface-200 bg-white p-6 lg:p-7">
      <header className="mb-5">
        <h2 className="text-lg font-bold text-ink-900">{title}</h2>
        {body && <p className="mt-1 text-sm text-ink-500 leading-relaxed">{body}</p>}
      </header>
      {toast && (
        <div
          className={`mb-4 rounded-lg px-3 py-2 text-sm ${
            toast.kind === "ok"
              ? "bg-success-50 text-success-700"
              : "bg-danger-50 text-danger-600"
          }`}
        >
          {toast.text}
        </div>
      )}
      {children}
    </section>
  );
}

function Stat({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wider text-ink-500">
        {label}
      </dt>
      <dd
        className={`mt-1 text-sm text-ink-900 ${mono ? "font-mono" : "font-medium"}`}
      >
        {value}
      </dd>
    </div>
  );
}
