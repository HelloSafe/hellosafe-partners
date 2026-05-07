/**
 * Mockup of the Coach Atlas analysis report, used on the /coach landing
 * page. Two variants:
 *  - "hero"  → compact, fits the right column of the hero grid
 *  - "demo"  → full report with the 3-column row layout that mirrors
 *    the in-product RowCard component
 *
 * Copy is pulled from the `coach.demo.*` translation namespace so the
 * mockup stays in sync with the page text.
 */
import { useTranslations } from "next-intl";

type Severity = "critical" | "warning" | "ok";

type Row = {
  label: string;
  current: string;
  gap: string;
  answer: string;
  severity: Severity;
};

export function CoachReportMockup({
  variant,
}: {
  variant: "hero" | "demo";
}) {
  const t = useTranslations("coach.demo");
  const rows = t.raw("rows") as Row[];
  if (variant === "hero") {
    return <HeroMock rows={rows} t={t} />;
  }
  return <DemoMock rows={rows} t={t} />;
}

/* ----- Hero variant: compact analysis card with score gauge + 3 row hints ----- */

function HeroMock({
  rows,
  t,
}: {
  rows: Row[];
  t: ReturnType<typeof useTranslations>;
}) {
  const sample = rows.slice(0, 3);
  return (
    <div className="relative">
      <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-brand-500/20 via-accent-500/15 to-success-500/20 blur-2xl" />
      <div className="hs-mockup relative rounded-[1.75rem] border border-white/60 p-3 lg:p-4">
        <BrowserChrome host="partners.hellosafe.com / coach / new" />
        <div className="rounded-b-2xl bg-white p-5 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-ink-500">
                {t("summaryLabel")}
              </p>
              <p className="mt-1 font-display text-xl font-bold text-ink-900">
                Mme Martin · Bali, 18 jours
              </p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-success-50 px-2.5 py-1 text-[0.7rem] font-display font-bold uppercase text-success-900 border border-success-600/20">
              ● Live
            </span>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3 text-center">
            <ScoreCard label={t("scoreLabel")} value="72" tone="warning" />
            <CountCard label={t("criticalLabel")} value="2" tone="critical" />
            <CountCard label={t("warningLabel")} value="1" tone="warning" />
          </div>
          <ul className="mt-5 space-y-2">
            {sample.map((row) => (
              <li
                key={row.label}
                className="flex items-center justify-between rounded-xl bg-surface-50 border border-surface-200 px-3 py-2.5"
              >
                <span className="flex items-center gap-2 text-sm text-ink-700">
                  <SeverityDot s={row.severity} />
                  {row.label}
                </span>
                <span className="text-xs text-ink-500 truncate max-w-[14rem] text-right">
                  {row.severity === "ok"
                    ? row.gap
                    : row.gap.split(" — ")[0]}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-5 rounded-xl bg-brand-50 border border-brand-100 px-4 py-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-brand-700">
              {t("scoreHint")}
            </span>
            <span className="font-display font-bold text-brand-700 tabular-nums">
              96 →
            </span>
          </div>
        </div>
      </div>
      <div className="absolute -bottom-5 -left-5 hidden sm:flex items-center gap-3 rounded-2xl bg-white border border-surface-200 px-4 py-3 shadow-lg">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-500 text-base">
          📄
        </span>
        <div>
          <p className="text-[0.7rem] uppercase tracking-wider text-ink-500">
            Récap PDF
          </p>
          <p className="font-display font-bold text-ink-900">
            Aux couleurs de votre marque
          </p>
        </div>
      </div>
    </div>
  );
}

/* ----- Demo variant: full report with 3-col rows mirroring the in-product RowCard ----- */

function DemoMock({
  rows,
  t,
}: {
  rows: Row[];
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <div className="relative">
      <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-brand-500/20 via-accent-500/15 to-success-500/20 blur-2xl" />
      <div className="hs-mockup relative rounded-[1.75rem] border border-white/60 p-3 lg:p-4">
        <BrowserChrome host="partners.hellosafe.com / coach / a8c4f2" />
        <div className="rounded-b-2xl bg-white p-5 lg:p-7">
          {/* Brand bar */}
          <div className="flex items-center justify-between border-b border-surface-200 pb-4">
            <div className="flex items-center gap-3">
              <span
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-white font-display font-bold"
                style={{ background: "#563bff" }}
              >
                VM
              </span>
              <div>
                <p className="font-display font-bold text-ink-900 text-sm leading-tight">
                  Voyages Marquis
                </p>
                <p className="text-[0.65rem] text-ink-500">
                  Diagnostic d&apos;assurance · Mme Martin
                </p>
              </div>
            </div>
            <span className="text-[0.65rem] uppercase tracking-wider text-ink-500 font-display font-bold">
              Réf. HS-2026-04823
            </span>
          </div>
          {/* Summary strip */}
          <div className="mt-5 grid grid-cols-3 gap-2.5">
            <ScoreCard label={t("scoreLabel")} value="72" tone="warning" />
            <CountCard label={t("criticalLabel")} value="2" tone="critical" />
            <CountCard label={t("warningLabel")} value="1" tone="warning" />
          </div>
          {/* Row cards */}
          <div className="mt-5 space-y-2.5">
            {rows.map((row) => (
              <RowCard key={row.label} row={row} />
            ))}
          </div>
          {/* Footer */}
          <p className="mt-5 pt-4 border-t border-surface-200 text-[0.65rem] text-ink-500 leading-relaxed">
            {t("footer")}
          </p>
        </div>
      </div>
      <div className="absolute -bottom-5 -right-5 hidden sm:flex items-center gap-3 rounded-2xl bg-white border border-surface-200 px-4 py-3 shadow-lg">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-success-50 text-success-600 text-base">
          ✓
        </span>
        <div>
          <p className="text-[0.7rem] uppercase tracking-wider text-ink-500">
            Téléchargeable
          </p>
          <p className="font-display font-bold text-ink-900">
            PDF prêt à imprimer
          </p>
        </div>
      </div>
    </div>
  );
}

/* ----- Building blocks ----- */

function RowCard({ row }: { row: Row }) {
  const tone = row.severity;
  return (
    <div className="grid grid-cols-3 rounded-xl border border-surface-200 overflow-hidden text-[0.7rem] leading-snug">
      <div className="px-3 py-2.5 bg-surface-50 border-r border-surface-200">
        <p className="text-[0.55rem] uppercase tracking-wider font-display font-bold text-ink-500">
          Couverture actuelle
        </p>
        <p className="mt-1.5 font-display font-bold text-ink-900 text-[0.78rem]">
          {row.label}
        </p>
        <p className="mt-1 text-ink-700 text-[0.68rem]">{row.current}</p>
      </div>
      <div
        className={`px-3 py-2.5 border-r border-surface-200 ${
          tone === "critical"
            ? "bg-danger-50/40"
            : tone === "warning"
              ? "bg-warning-50/40"
              : "bg-success-50/30"
        }`}
      >
        <p
          className={`text-[0.55rem] uppercase tracking-wider font-display font-bold ${
            tone === "critical"
              ? "text-danger-600"
              : tone === "warning"
                ? "text-warning-600"
                : "text-success-600"
          }`}
        >
          {tone === "critical"
            ? "Écart critique"
            : tone === "warning"
              ? "Alerte"
              : "Déjà couvert"}
        </p>
        <p className="mt-1.5 text-ink-700 text-[0.68rem] leading-snug">
          {row.gap}
        </p>
      </div>
      <div className="px-3 py-2.5 bg-white">
        <p className="text-[0.55rem] uppercase tracking-wider font-display font-bold text-brand-700">
          Réponse HelloSafe
        </p>
        <p className="mt-1.5 font-semibold text-ink-900 text-[0.7rem] leading-snug">
          {row.answer}
        </p>
      </div>
    </div>
  );
}

function ScoreCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "ok" | "warning" | "critical";
}) {
  const cls =
    tone === "ok"
      ? "border-success-600/30 bg-success-50/50"
      : tone === "warning"
        ? "border-warning-500/40 bg-warning-50/50"
        : "border-danger-500/40 bg-danger-50/50";
  const txt =
    tone === "ok"
      ? "text-success-600"
      : tone === "warning"
        ? "text-warning-600"
        : "text-danger-600";
  return (
    <div
      className={`rounded-xl border ${cls} px-3 py-3`}
      style={{ borderLeftWidth: 4, borderLeftColor: "#563bff" }}
    >
      <p className={`font-display text-2xl font-bold tabular-nums ${txt}`}>
        {value}
      </p>
      <p className="mt-0.5 text-[0.6rem] uppercase tracking-wider text-ink-500 leading-tight">
        {label}
      </p>
    </div>
  );
}

function CountCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "warning" | "critical";
}) {
  const cls =
    tone === "warning"
      ? "border-warning-500/30 bg-warning-50/50"
      : "border-danger-500/30 bg-danger-50/50";
  const txt = tone === "warning" ? "text-warning-600" : "text-danger-600";
  return (
    <div className={`rounded-xl border ${cls} px-3 py-3`}>
      <p className={`font-display text-2xl font-bold tabular-nums ${txt}`}>
        {value}
      </p>
      <p
        className={`mt-0.5 text-[0.6rem] uppercase tracking-wider font-semibold leading-tight ${txt}`}
      >
        {label}
      </p>
    </div>
  );
}

function SeverityDot({ s }: { s: Severity }) {
  const tone =
    s === "critical"
      ? "bg-danger-500"
      : s === "warning"
        ? "bg-warning-500"
        : "bg-success-500";
  return <span className={`h-2 w-2 rounded-full ${tone}`} />;
}

function BrowserChrome({ host }: { host: string }) {
  return (
    <div className="hs-mockup-bar flex items-center gap-2 rounded-t-2xl px-4 py-3 border-b border-surface-200">
      <span className="h-2.5 w-2.5 rounded-full bg-accent-500" />
      <span className="h-2.5 w-2.5 rounded-full bg-warning-500/80" />
      <span className="h-2.5 w-2.5 rounded-full bg-success-500" />
      <span className="ml-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs text-ink-500 border border-surface-200">
        <LockGlyph />
        {host}
      </span>
    </div>
  );
}

function LockGlyph() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      aria-hidden
      className="text-ink-300"
    >
      <rect
        x="2.5"
        y="5.5"
        width="7"
        height="5"
        rx="1.2"
        stroke="currentColor"
        strokeWidth="1.2"
        fill="none"
      />
      <path
        d="M4 5.5V4a2 2 0 014 0v1.5"
        stroke="currentColor"
        strokeWidth="1.2"
        fill="none"
      />
    </svg>
  );
}
