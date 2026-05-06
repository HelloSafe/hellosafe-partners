"use client";

import { useEffect, useState } from "react";
import { STRINGS } from "./strings";
import type {
  AgeBucket,
  AnalyzeResponse,
  CompanionGroup,
  CoverageItem,
  DurationBucket,
  SpecialItem,
} from "./types";

type Lang = "fr" | "en";

const POPULAR_FR = [
  "Bali",
  "Canada",
  "Thaïlande",
  "Maroc",
  "États-Unis",
  "Japon",
  "Espagne",
  "Mexique",
];
const POPULAR_EN = [
  "Bali",
  "Canada",
  "Thailand",
  "Morocco",
  "United States",
  "Japan",
  "Spain",
  "Mexico",
];

// ---------- Welcome ----------
export function WelcomeStep({
  partner,
  lang,
  onStart,
}: {
  partner: { code: string; companyName: string | null };
  lang: Lang;
  onStart: () => void;
}) {
  const t = STRINGS[lang].welcome;
  return (
    <div className="w-welcome">
      <div className="w-welcome__hero">🛡️</div>
      <p className="w-h-eyebrow" style={{ marginBottom: 8 }}>
        {t.eyebrow}
      </p>
      <h1 className="w-welcome__title">{t.title}</h1>
      <p className="w-welcome__sub">{t.subtitle}</p>
      <button type="button" className="w-welcome__cta" onClick={onStart}>
        {t.cta} →
      </button>
      <p className="w-welcome__privacy">🔒 {t.privacy}</p>
      {partner.companyName && (
        <div className="w-welcome__brand">
          {t.poweredBy} <strong>{partner.companyName}</strong>
        </div>
      )}
    </div>
  );
}

// ---------- Q1: Destination ----------
export function Q1Destination({
  lang,
  value,
  onChange,
}: {
  lang: Lang;
  value: string;
  onChange: (v: string) => void;
}) {
  const t = STRINGS[lang].q1;
  const popular = lang === "en" ? POPULAR_EN : POPULAR_FR;
  return (
    <div>
      <p className="w-h-eyebrow">
        {STRINGS[lang].progress.step} 1 {STRINGS[lang].progress.of} 5
      </p>
      <h2 className="w-h-title">{t.title}</h2>
      <p className="w-h-sub">{t.subtitle}</p>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t.placeholder}
        className="w-input"
        autoFocus
      />
      <div style={{ marginTop: 16 }}>
        <p
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "var(--w-fg-muted)",
            textTransform: "uppercase",
            letterSpacing: ".08em",
          }}
        >
          {t.popular}
        </p>
        <div className="w-pop">
          {popular.map((d) => (
            <button
              key={d}
              type="button"
              className="w-pop__btn"
              onClick={() => onChange(d)}
            >
              {d}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------- Q2: Duration ----------
export function Q2Duration({
  lang,
  value,
  onChange,
}: {
  lang: Lang;
  value: DurationBucket;
  onChange: (v: DurationBucket) => void;
}) {
  const t = STRINGS[lang].q2;
  const opts: { key: DurationBucket; icon: string; label: string }[] = [
    { key: "short", icon: "🚶", label: t.shortLabel },
    { key: "medium", icon: "🌴", label: t.mediumLabel },
    { key: "long", icon: "🌍", label: t.longLabel },
    { key: "year", icon: "✈️", label: t.yearLabel },
  ];
  return (
    <div>
      <p className="w-h-eyebrow">
        {STRINGS[lang].progress.step} 2 {STRINGS[lang].progress.of} 5
      </p>
      <h2 className="w-h-title">{t.title}</h2>
      <p className="w-h-sub">{t.subtitle}</p>
      <div className="w-grid w-grid--2">
        {opts.map((o) => (
          <button
            key={o.key}
            type="button"
            className="w-tile"
            data-selected={value === o.key}
            onClick={() => onChange(o.key)}
          >
            <span className="w-tile__icon">{o.icon}</span>
            <span className="w-tile__title">{o.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------- Q3: Travelers ----------
export function Q3Travelers({
  lang,
  age,
  companions,
  onAge,
  onCompanions,
}: {
  lang: Lang;
  age: AgeBucket;
  companions: CompanionGroup[];
  onAge: (v: AgeBucket) => void;
  onCompanions: (v: CompanionGroup[]) => void;
}) {
  const t = STRINGS[lang].q3;
  const compOpts: { key: CompanionGroup; icon: string; label: string }[] = [
    { key: "alone", icon: "🧍", label: t.alone },
    { key: "partner", icon: "💑", label: t.partner },
    { key: "kids", icon: "👶", label: t.kids },
    { key: "friends", icon: "👯", label: t.friends },
  ];
  const ageOpts: { key: AgeBucket; label: string }[] = [
    { key: "under_25", label: lang === "en" ? "Under 25" : "Moins de 25" },
    { key: "25_50", label: "25 – 50" },
    { key: "50_70", label: "50 – 70" },
    { key: "over_70", label: lang === "en" ? "Over 70" : "Plus de 70" },
  ];

  const toggleCompanion = (k: CompanionGroup) => {
    if (k === "alone") {
      onCompanions(["alone"]);
      return;
    }
    const without = companions.filter((c) => c !== "alone");
    if (without.includes(k)) {
      const next = without.filter((c) => c !== k);
      onCompanions(next.length === 0 ? ["alone"] : next);
    } else {
      onCompanions([...without, k]);
    }
  };

  return (
    <div>
      <p className="w-h-eyebrow">
        {STRINGS[lang].progress.step} 3 {STRINGS[lang].progress.of} 5
      </p>
      <h2 className="w-h-title">{t.title}</h2>
      <p className="w-h-sub">{t.subtitle}</p>
      <div className="w-grid w-grid--2">
        {compOpts.map((o) => (
          <button
            key={o.key}
            type="button"
            className="w-tile"
            data-selected={companions.includes(o.key)}
            onClick={() => toggleCompanion(o.key)}
          >
            <span className="w-tile__icon">{o.icon}</span>
            <span className="w-tile__title">{o.label}</span>
          </button>
        ))}
      </div>
      <div style={{ marginTop: 22 }}>
        <p
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "var(--w-fg-muted)",
            textTransform: "uppercase",
            letterSpacing: ".08em",
            marginBottom: 8,
          }}
        >
          {t.ageTitle}
        </p>
        <div className="w-pop">
          {ageOpts.map((o) => (
            <button
              key={o.key}
              type="button"
              className="w-pop__btn"
              data-selected={age === o.key}
              onClick={() => onAge(o.key)}
              style={
                age === o.key
                  ? {
                      borderColor: "var(--w-accent)",
                      color: "var(--w-accent)",
                      background: "color-mix(in srgb, var(--w-accent) 10%, transparent)",
                    }
                  : undefined
              }
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------- Q4: Coverage ----------
export function Q4Coverage({
  lang,
  value,
  onChange,
}: {
  lang: Lang;
  value: CoverageItem[];
  onChange: (v: CoverageItem[]) => void;
}) {
  const t = STRINGS[lang].q4;
  const cards: { key: CoverageItem; label: string }[] = [
    { key: "visa_premier", label: t.visa_premier },
    { key: "mastercard_gold", label: t.mastercard_gold },
    { key: "barclays", label: t.barclays },
    { key: "none_card", label: t.none_card },
  ];
  const others: { key: CoverageItem; label: string }[] = [
    { key: lang === "en" ? "ss_uk" : "ss_fr", label: lang === "en" ? t.ss_uk : t.ss_fr },
    { key: "mutuelle_yes", label: t.mutuelle_yes },
  ];

  const togglePick = (k: CoverageItem, group: "card" | "other") => {
    if (group === "card") {
      // Card group is exclusive among cards.
      const cardKeys: CoverageItem[] = ["visa_premier", "mastercard_gold", "barclays", "none_card"];
      const without = value.filter((v) => !cardKeys.includes(v));
      onChange([...without, k]);
    } else {
      // "other" toggles individually.
      if (value.includes(k)) {
        onChange(value.filter((v) => v !== k));
      } else {
        onChange([...value, k]);
      }
    }
  };

  return (
    <div>
      <p className="w-h-eyebrow">
        {STRINGS[lang].progress.step} 4 {STRINGS[lang].progress.of} 5
      </p>
      <h2 className="w-h-title">{t.title}</h2>
      <p className="w-h-sub">{t.subtitle}</p>
      <div className="w-grid w-grid--2">
        {cards.map((c) => (
          <button
            key={c.key}
            type="button"
            className="w-chip"
            data-selected={value.includes(c.key)}
            onClick={() => togglePick(c.key, "card")}
          >
            <span className="w-chip__bullet" />
            <span>{c.label}</span>
          </button>
        ))}
      </div>
      <div className="w-grid w-grid--2" style={{ marginTop: 10 }}>
        {others.map((c) => (
          <button
            key={c.key}
            type="button"
            className="w-chip"
            data-selected={value.includes(c.key)}
            onClick={() => togglePick(c.key, "other")}
          >
            <span className="w-chip__bullet" />
            <span>{c.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------- Q5: Specials ----------
export function Q5Specials({
  lang,
  value,
  onChange,
}: {
  lang: Lang;
  value: SpecialItem[];
  onChange: (v: SpecialItem[]) => void;
}) {
  const t = STRINGS[lang].q5;
  const opts: { key: SpecialItem; icon: string; label: string }[] = [
    { key: "winter", icon: "🎿", label: t.winter },
    { key: "extreme", icon: "🤿", label: t.extreme },
    { key: "cruise", icon: "🚢", label: t.cruise },
    { key: "cancel", icon: "🛑", label: t.cancel },
  ];

  const toggle = (k: SpecialItem) => {
    const without = value.filter((v): v is Exclude<SpecialItem, "none"> => v !== "none");
    if (without.some((v) => v === k)) {
      onChange(without.filter((v) => v !== k));
    } else {
      onChange([...without, k]);
    }
  };
  const setNone = () => onChange(["none"]);

  return (
    <div>
      <p className="w-h-eyebrow">
        {STRINGS[lang].progress.step} 5 {STRINGS[lang].progress.of} 5
      </p>
      <h2 className="w-h-title">{t.title}</h2>
      <p className="w-h-sub">{t.subtitle}</p>
      <div className="w-grid w-grid--2">
        {opts.map((o) => (
          <button
            key={o.key}
            type="button"
            className="w-tile"
            data-selected={value.includes(o.key)}
            onClick={() => toggle(o.key)}
          >
            <span className="w-tile__icon">{o.icon}</span>
            <span className="w-tile__title">{o.label}</span>
          </button>
        ))}
      </div>
      <button
        type="button"
        className="w-chip"
        data-selected={value.includes("none")}
        onClick={setNone}
        style={{ width: "100%", marginTop: 12 }}
      >
        <span className="w-chip__bullet" />
        <span>{t.none}</span>
      </button>
    </div>
  );
}

// ---------- Analyzing ----------
export function AnalyzingStep({ lang }: { lang: Lang }) {
  const t = STRINGS[lang].analyzing;
  return (
    <div className="w-analyzing">
      <div className="w-analyzing__spinner" />
      <p className="w-analyzing__title">{t.title}</p>
      {t.lines.map((line) => (
        <div key={line} className="w-analyzing__line">
          <span className="w-analyzing__check">✓</span>
          <span>{line}</span>
        </div>
      ))}
    </div>
  );
}

// ---------- Result ----------
export function ResultStep({
  lang,
  result,
  partner,
  onRestart,
}: {
  lang: Lang;
  result: AnalyzeResponse;
  partner: { code: string; companyName: string | null };
  onRestart: () => void;
}) {
  void partner;
  const t = STRINGS[lang].result;
  const sevT = STRINGS[lang].severity;
  const score = result.output.summary.coverageScore;
  const animatedScore = useCountUp(score, 1100);

  const color =
    score >= 80
      ? "var(--w-success)"
      : score >= 60
      ? "var(--w-warning)"
      : "var(--w-danger)";
  const verdict =
    score >= 80
      ? t.excellent
      : score >= 60
      ? t.good
      : score >= 35
      ? t.partial
      : t.insufficient;

  const reco = result.output.helloSafeRecommendation;
  const fmt = new Intl.NumberFormat(lang === "en" ? "en-US" : "fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  });

  // Show only rows with gaps, ordered critical → warning → info.
  const rowsToShow = [...result.output.rows]
    .filter((r) => r.gap)
    .sort((a, b) => {
      const order: Record<string, number> = { critical: 0, warning: 1, info: 2 };
      return (order[a.gap?.severity ?? "info"] ?? 3) - (order[b.gap?.severity ?? "info"] ?? 3);
    })
    .slice(0, 4);

  return (
    <div>
      <div className="w-result__head">
        <div
          className="w-result__score"
          style={
            {
              ["--w-score" as string]: animatedScore,
              ["--w-score-color" as string]: color,
            } as React.CSSProperties
          }
        >
          <span className="w-result__score-num">
            {animatedScore}
            <small>/100</small>
          </span>
        </div>
        <h2 className="w-result__verdict" style={{ color }}>
          {verdict}
        </h2>
        <div className="w-result__counts">
          <span>
            <strong>{result.output.summary.criticalGaps}</strong> {t.criticalGaps}
          </span>
          <span>
            <strong>{result.output.summary.warningGaps}</strong> {t.warningGaps}
          </span>
        </div>
      </div>

      {rowsToShow.length > 0 && (
        <div>
          {rowsToShow.map((row) => (
            <div key={row.guarantee} className="w-row">
              <div className="w-row__head">
                <span className="w-row__title">{row.guaranteeLabel}</span>
                <span
                  className={`w-tag w-tag--${row.gap?.severity ?? "info"}`}
                >
                  {sevT[row.gap?.severity ?? "info"]}
                </span>
              </div>
              <div className="w-row__body">
                {row.gap && <p style={{ margin: 0 }}>{row.gap.title}</p>}
                <div className="w-row__current">
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: "var(--w-fg-muted)" }}>
                    {t.whatYouHave}
                  </span>
                  <div>{row.current.summary}</div>
                </div>
                {row.gap && (
                  <div className="w-row__answer">
                    <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: "var(--w-accent)" }}>
                      {t.hellosafeAnswer}
                    </span>
                    <div>{row.gap.helloSafeAnswer}</div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="w-cta-card">
        <p className="w-cta-card__eyebrow">{t.ctaTitle}</p>
        <h3 className="w-cta-card__title">{reco.name}</h3>
        <div className="w-cta-card__price">
          <span className="w-cta-card__price-num">
            {fmt.format(reco.pricePerDayCents / 100)}
          </span>
          <span className="w-cta-card__price-sub">{t.perDay}</span>
        </div>
        <ul className="w-cta-card__bullets">
          {reco.bullets.slice(0, 4).map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
        <a
          href={result.ctaUrl}
          target="_top"
          rel="noopener"
          className="w-cta-card__btn"
        >
          {t.cta}
        </a>
      </div>

      <div className="w-restart">
        <button type="button" onClick={onRestart}>
          ↺ {t.restart}
        </button>
      </div>
    </div>
  );
}

function useCountUp(target: number, durationMs: number) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setV(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);
  return v;
}
