"use client";

import { useEffect, useMemo, useState } from "react";
import { STRINGS } from "./strings";
import type {
  AgeBucket,
  AnalyzeResponse,
  CompanionGroup,
  CoverageItem,
  DurationBucket,
  SpecialItem,
  WidgetAnswers,
  WidgetTheme,
} from "./types";
import {
  WelcomeStep,
  Q1Destination,
  Q2Duration,
  Q3Travelers,
  Q4Coverage,
  Q5Specials,
  AnalyzingStep,
  ResultStep,
} from "./steps";

type Props = {
  partner: { code: string; companyName: string | null };
  lang: "fr" | "en";
  theme: WidgetTheme;
  source: string | null;
};

const STEPS = ["welcome", "q1", "q2", "q3", "q4", "q5", "analyzing", "result"] as const;
type Step = (typeof STEPS)[number];

export function CoachWidget({ partner, lang, theme, source }: Props) {
  const t = STRINGS[lang];
  const [step, setStep] = useState<Step>("welcome");
  const [animDir, setAnimDir] = useState<"forward" | "back">("forward");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);

  const [answers, setAnswers] = useState<WidgetAnswers>({
    destination: "",
    duration: "medium",
    age: "25_50",
    companions: ["alone"],
    coverage: lang === "en" ? ["ss_uk"] : ["ss_fr"],
    specials: [],
  });

  const stepIndex = STEPS.indexOf(step);
  const isQuestion = stepIndex >= 1 && stepIndex <= 5;
  const totalQuestions = 5;
  const currentQuestion = isQuestion ? stepIndex : 0;

  const canNext = useMemo(() => {
    if (step === "q1") return answers.destination.trim().length >= 2;
    return true;
  }, [step, answers.destination]);

  const goNext = () => {
    setError(null);
    setAnimDir("forward");
    const next = STEPS[stepIndex + 1];
    if (next) setStep(next);
  };
  const goBack = () => {
    setError(null);
    setAnimDir("back");
    const prev = STEPS[stepIndex - 1];
    if (prev && prev !== "analyzing") setStep(prev);
  };
  const goRestart = () => {
    setError(null);
    setResult(null);
    setAnimDir("back");
    setStep("welcome");
  };

  // When entering "analyzing", call the API.
  useEffect(() => {
    if (step !== "analyzing") return;
    let cancelled = false;
    const startedAt = Date.now();
    fetch("/api/widget/coach/analyze", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ partner: partner.code, lang, answers, source }),
    })
      .then(async (res) => {
        const elapsed = Date.now() - startedAt;
        // Hold the analyzing animation for at least 1.4s so it feels intentional.
        if (elapsed < 1400) await new Promise((r) => setTimeout(r, 1400 - elapsed));
        if (cancelled) return;
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          setError(body.error ?? "Une erreur est survenue.");
          setAnimDir("back");
          setStep("q5");
          return;
        }
        const data = (await res.json()) as AnalyzeResponse;
        setResult(data);
        setAnimDir("forward");
        setStep("result");
      })
      .catch(() => {
        if (cancelled) return;
        setError("Impossible de contacter le serveur.");
        setAnimDir("back");
        setStep("q5");
      });
    return () => {
      cancelled = true;
    };
  }, [step, partner.code, lang, answers, source]);

  // Tell the parent iframe (if any) to resize after content changes.
  useEffect(() => {
    const sendHeight = () => {
      try {
        const h = document.documentElement.scrollHeight;
        window.parent?.postMessage(
          { type: "hellosafe:widget:resize", height: h },
          "*",
        );
      } catch {
        /* ignore */
      }
    };
    sendHeight();
    const t = setTimeout(sendHeight, 320);
    return () => clearTimeout(t);
  }, [step, result, error]);

  // Theme-aware accent color (used in CSS vars).
  const styleVars: React.CSSProperties = {
    ["--w-accent" as string]: theme.color,
  };

  return (
    <div
      data-step={step}
      data-mode={theme.mode}
      style={styleVars}
      className="w-coach"
    >
      <style>{WIDGET_CSS}</style>

      {isQuestion && (
        <div className="w-progress" aria-hidden="true">
          <div
            className="w-progress__bar"
            style={{ width: `${(currentQuestion / totalQuestions) * 100}%` }}
          />
        </div>
      )}

      <div className="w-stage">
        <div
          key={step}
          className={`w-slide ${animDir === "forward" ? "w-slide--in-right" : "w-slide--in-left"}`}
        >
          {step === "welcome" && (
            <WelcomeStep partner={partner} lang={lang} onStart={goNext} />
          )}
          {step === "q1" && (
            <Q1Destination
              lang={lang}
              value={answers.destination}
              onChange={(v) => setAnswers({ ...answers, destination: v })}
            />
          )}
          {step === "q2" && (
            <Q2Duration
              lang={lang}
              value={answers.duration}
              onChange={(v: DurationBucket) =>
                setAnswers({ ...answers, duration: v })
              }
            />
          )}
          {step === "q3" && (
            <Q3Travelers
              lang={lang}
              age={answers.age}
              companions={answers.companions}
              onAge={(v: AgeBucket) => setAnswers({ ...answers, age: v })}
              onCompanions={(v: CompanionGroup[]) =>
                setAnswers({ ...answers, companions: v })
              }
            />
          )}
          {step === "q4" && (
            <Q4Coverage
              lang={lang}
              value={answers.coverage}
              onChange={(v: CoverageItem[]) =>
                setAnswers({ ...answers, coverage: v })
              }
            />
          )}
          {step === "q5" && (
            <Q5Specials
              lang={lang}
              value={answers.specials}
              onChange={(v: SpecialItem[]) =>
                setAnswers({ ...answers, specials: v })
              }
            />
          )}
          {step === "analyzing" && <AnalyzingStep lang={lang} />}
          {step === "result" && result && (
            <ResultStep
              lang={lang}
              result={result}
              partner={partner}
              onRestart={goRestart}
            />
          )}
        </div>
      </div>

      {error && (
        <div className="w-error" role="alert">
          {error}
        </div>
      )}

      {(isQuestion || step === "welcome") && step !== "welcome" && (
        <nav className="w-nav">
          <button
            type="button"
            onClick={goBack}
            className="w-btn w-btn--ghost"
            disabled={stepIndex <= 1}
          >
            ← {t.nav.back}
          </button>
          <button
            type="button"
            onClick={() => {
              if (step === "q5") {
                setAnimDir("forward");
                setStep("analyzing");
              } else {
                goNext();
              }
            }}
            disabled={!canNext}
            className="w-btn w-btn--primary"
          >
            {step === "q5" ? t.nav.finish : t.nav.next} →
          </button>
        </nav>
      )}

      <div className="w-footer">{t.common.poweredBy}</div>
    </div>
  );
}

const WIDGET_CSS = `
.w-coach {
  --w-accent: #563bff;
  --w-bg: #ffffff;
  --w-bg-subtle: #f7f5ff;
  --w-fg: #0e0a25;
  --w-fg-muted: #5e576f;
  --w-border: #e7e3f5;
  --w-danger: #c4321e;
  --w-success: #18854f;
  --w-warning: #b86a00;
  font-family: "Switzer", system-ui, -apple-system, "Segoe UI", Helvetica, Arial, sans-serif;
  color: var(--w-fg);
  background: var(--w-bg);
  border-radius: 18px;
  border: 1px solid var(--w-border);
  box-shadow: 0 1px 0 rgba(20, 11, 122, .04), 0 24px 60px -30px rgba(20, 11, 122, .15);
  padding: 22px;
  max-width: 760px;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
  font-size: 15px;
  line-height: 1.45;
  overflow: hidden;
  position: relative;
}
.w-coach[data-mode="dark"] {
  --w-bg: #100a2a;
  --w-bg-subtle: #1a1340;
  --w-fg: #f5f3ff;
  --w-fg-muted: #b3acce;
  --w-border: #2a2055;
}
@media (prefers-color-scheme: dark) {
  .w-coach[data-mode="auto"] {
    --w-bg: #100a2a;
    --w-bg-subtle: #1a1340;
    --w-fg: #f5f3ff;
    --w-fg-muted: #b3acce;
    --w-border: #2a2055;
  }
}
* { box-sizing: border-box; }
.w-coach * { box-sizing: border-box; }

.w-progress {
  height: 4px;
  background: var(--w-bg-subtle);
  border-radius: 999px;
  overflow: hidden;
  margin-bottom: 18px;
}
.w-progress__bar {
  height: 100%;
  background: var(--w-accent);
  border-radius: 999px;
  transition: width 320ms cubic-bezier(.2,.8,.2,1);
}
.w-stage { min-height: 320px; }
.w-slide { animation: 320ms cubic-bezier(.2,.8,.2,1) both; }
.w-slide--in-right { animation-name: slideInRight; }
.w-slide--in-left { animation-name: slideInLeft; }
@keyframes slideInRight {
  from { opacity: 0; transform: translate3d(28px, 0, 0); }
  to   { opacity: 1; transform: translate3d(0, 0, 0); }
}
@keyframes slideInLeft {
  from { opacity: 0; transform: translate3d(-28px, 0, 0); }
  to   { opacity: 1; transform: translate3d(0, 0, 0); }
}

.w-h-eyebrow {
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .14em;
  text-transform: uppercase;
  color: var(--w-accent);
  margin-bottom: 12px;
}
.w-h-title {
  font-family: "Mont", "Switzer", system-ui, sans-serif;
  font-size: clamp(1.6rem, 4vw, 2.1rem);
  line-height: 1.1;
  font-weight: 800;
  letter-spacing: -0.02em;
  margin: 0 0 10px;
  color: var(--w-fg);
}
.w-h-sub {
  color: var(--w-fg-muted);
  margin: 0 0 22px;
  font-size: 15px;
}

.w-input {
  width: 100%;
  height: 52px;
  border-radius: 12px;
  border: 2px solid var(--w-border);
  padding: 0 16px;
  font-size: 16px;
  font-family: inherit;
  background: var(--w-bg);
  color: var(--w-fg);
  transition: border-color 160ms ease;
}
.w-input:focus {
  outline: none;
  border-color: var(--w-accent);
}

.w-grid {
  display: grid;
  gap: 10px;
}
.w-grid--2 { grid-template-columns: repeat(2, 1fr); }
.w-grid--auto { grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); }

.w-chip {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  border-radius: 14px;
  border: 2px solid var(--w-border);
  background: var(--w-bg);
  cursor: pointer;
  user-select: none;
  text-align: left;
  font-family: inherit;
  font-size: 15px;
  font-weight: 600;
  color: var(--w-fg);
  transition: all 160ms ease;
}
.w-chip:hover { border-color: var(--w-accent); }
.w-chip[data-selected="true"] {
  border-color: var(--w-accent);
  background: color-mix(in srgb, var(--w-accent) 8%, var(--w-bg));
  color: var(--w-fg);
}
.w-chip__bullet {
  width: 18px;
  height: 18px;
  border-radius: 999px;
  border: 2px solid var(--w-border);
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.w-chip[data-selected="true"] .w-chip__bullet {
  border-color: var(--w-accent);
  background: var(--w-accent);
}
.w-chip[data-selected="true"] .w-chip__bullet::after {
  content: "";
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #fff;
}

.w-tile {
  border: 2px solid var(--w-border);
  border-radius: 16px;
  padding: 18px;
  cursor: pointer;
  background: var(--w-bg);
  text-align: left;
  font-family: inherit;
  transition: all 180ms cubic-bezier(.2,.8,.2,1);
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.w-tile:hover {
  border-color: var(--w-accent);
  transform: translateY(-2px);
  box-shadow: 0 8px 18px -8px rgba(20, 11, 122, .15);
}
.w-tile[data-selected="true"] {
  border-color: var(--w-accent);
  background: color-mix(in srgb, var(--w-accent) 8%, var(--w-bg));
}
.w-tile__icon { font-size: 28px; line-height: 1; }
.w-tile__title { font-weight: 700; font-size: 15px; color: var(--w-fg); }
.w-tile__sub { color: var(--w-fg-muted); font-size: 13px; }

.w-pop {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}
.w-pop__btn {
  height: 36px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid var(--w-border);
  background: var(--w-bg-subtle);
  color: var(--w-fg);
  cursor: pointer;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  transition: all 160ms ease;
}
.w-pop__btn:hover { border-color: var(--w-accent); color: var(--w-accent); }

.w-nav {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-top: 22px;
  padding-top: 16px;
  border-top: 1px solid var(--w-border);
}
.w-btn {
  height: 48px;
  padding: 0 22px;
  border-radius: 14px;
  font-family: inherit;
  font-size: 15px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: all 160ms ease;
}
.w-btn:disabled { opacity: .35; cursor: not-allowed; }
.w-btn--primary {
  background: var(--w-accent);
  color: #fff;
}
.w-btn--primary:not(:disabled):hover {
  filter: brightness(.92);
  transform: translateY(-1px);
}
.w-btn--ghost {
  background: transparent;
  color: var(--w-fg-muted);
}
.w-btn--ghost:not(:disabled):hover { color: var(--w-fg); }

.w-error {
  margin-top: 14px;
  padding: 12px 14px;
  border-radius: 12px;
  background: #fdecea;
  color: var(--w-danger);
  font-size: 14px;
}
.w-coach[data-mode="dark"] .w-error,
.w-coach[data-mode="auto"] .w-error { background: rgba(196, 50, 30, .12); }

.w-footer {
  margin-top: 14px;
  text-align: center;
  font-size: 12px;
  color: var(--w-fg-muted);
}

/* Welcome */
.w-welcome { text-align: center; padding: 18px 6px; }
.w-welcome__hero {
  width: 88px; height: 88px;
  margin: 0 auto 18px;
  border-radius: 24px;
  background: linear-gradient(135deg, var(--w-accent), color-mix(in srgb, var(--w-accent) 60%, #ffffff));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 38px;
  box-shadow: 0 12px 30px -6px color-mix(in srgb, var(--w-accent) 50%, transparent);
}
.w-welcome__title {
  font-family: "Mont", "Switzer", system-ui, sans-serif;
  font-size: clamp(1.7rem, 4.5vw, 2.4rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.05;
  margin: 0 0 14px;
}
.w-welcome__sub { color: var(--w-fg-muted); margin: 0 0 24px; }
.w-welcome__cta {
  height: 54px;
  padding: 0 32px;
  border-radius: 999px;
  border: none;
  background: var(--w-fg);
  color: var(--w-bg);
  font-family: inherit;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  transition: transform 160ms ease;
}
.w-welcome__cta:hover { transform: translateY(-2px); }
.w-welcome__privacy {
  margin-top: 14px;
  font-size: 12px;
  color: var(--w-fg-muted);
}
.w-welcome__brand {
  margin-top: 18px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: .12em;
  color: var(--w-fg-muted);
  font-weight: 700;
}
.w-welcome__brand strong { color: var(--w-fg); }

/* Analyzing */
.w-analyzing { padding: 30px 8px; text-align: center; }
.w-analyzing__spinner {
  width: 64px; height: 64px;
  margin: 0 auto 22px;
  border-radius: 999px;
  border: 4px solid var(--w-bg-subtle);
  border-top-color: var(--w-accent);
  animation: spin 900ms linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.w-analyzing__title { font-size: 18px; font-weight: 700; margin: 0 0 18px; }
.w-analyzing__line {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 12px;
  border-radius: 10px;
  background: var(--w-bg-subtle);
  font-size: 14px;
  margin: 6px 0;
  animation: fadeUp 600ms cubic-bezier(.2,.8,.2,1) both;
}
.w-analyzing__line:nth-child(1) { animation-delay: 80ms; }
.w-analyzing__line:nth-child(2) { animation-delay: 380ms; }
.w-analyzing__line:nth-child(3) { animation-delay: 760ms; }
@keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
.w-analyzing__check {
  flex-shrink: 0;
  width: 18px; height: 18px;
  border-radius: 999px;
  background: var(--w-success);
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: bold;
}

/* Result */
.w-result__head { text-align: center; padding: 6px 0 18px; }
.w-result__score {
  width: 132px; height: 132px;
  margin: 0 auto 14px;
  border-radius: 50%;
  background: conic-gradient(var(--w-score-color) calc(var(--w-score) * 1%), var(--w-bg-subtle) 0);
  display: grid;
  place-items: center;
  position: relative;
}
.w-result__score::before {
  content: "";
  position: absolute;
  inset: 8px;
  border-radius: 50%;
  background: var(--w-bg);
}
.w-result__score-num {
  position: relative;
  font-family: "Mont", system-ui, sans-serif;
  font-size: 38px;
  font-weight: 800;
  color: var(--w-fg);
  line-height: 1;
}
.w-result__score-num small {
  font-size: 14px;
  color: var(--w-fg-muted);
  margin-left: 2px;
  font-weight: 600;
}
.w-result__verdict {
  font-family: "Mont", system-ui, sans-serif;
  font-size: 1.45rem;
  font-weight: 800;
  margin: 0 0 4px;
  letter-spacing: -0.01em;
}
.w-result__counts {
  font-size: 14px;
  color: var(--w-fg-muted);
  display: flex;
  gap: 14px;
  justify-content: center;
}
.w-result__counts strong { color: var(--w-fg); }

.w-row {
  border: 1px solid var(--w-border);
  border-radius: 14px;
  padding: 16px;
  margin-top: 12px;
  background: var(--w-bg);
}
.w-row__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 8px;
}
.w-row__title {
  font-weight: 700;
  font-size: 15px;
  color: var(--w-fg);
}
.w-tag {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .04em;
  padding: 3px 8px;
  border-radius: 999px;
}
.w-tag--critical { background: rgba(196, 50, 30, .1); color: var(--w-danger); }
.w-tag--warning  { background: rgba(184, 106, 0, .1); color: var(--w-warning); }
.w-tag--info     { background: rgba(24, 133, 79, .1); color: var(--w-success); }
.w-row__body { color: var(--w-fg-muted); font-size: 14px; }
.w-row__current,
.w-row__answer {
  margin-top: 6px;
  padding-left: 10px;
  border-left: 2px solid var(--w-border);
}
.w-row__answer { border-left-color: var(--w-accent); color: var(--w-fg); }

.w-cta-card {
  margin-top: 20px;
  padding: 20px;
  border-radius: 16px;
  background: linear-gradient(135deg, var(--w-accent), color-mix(in srgb, var(--w-accent) 65%, #000));
  color: #fff;
  text-align: left;
}
.w-cta-card__eyebrow {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .14em;
  text-transform: uppercase;
  opacity: .8;
  margin-bottom: 4px;
}
.w-cta-card__title {
  font-family: "Mont", system-ui, sans-serif;
  font-size: 1.25rem;
  font-weight: 800;
  margin: 0 0 10px;
  letter-spacing: -0.01em;
}
.w-cta-card__price {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin: 8px 0 14px;
}
.w-cta-card__price-num { font-size: 34px; font-weight: 800; line-height: 1; font-family: "Mont", sans-serif; }
.w-cta-card__price-sub { font-size: 14px; opacity: .85; }
.w-cta-card__bullets { list-style: none; padding: 0; margin: 0 0 16px; font-size: 14px; }
.w-cta-card__bullets li { padding: 4px 0 4px 20px; position: relative; }
.w-cta-card__bullets li::before {
  content: "✓";
  position: absolute;
  left: 0;
  font-weight: bold;
}
.w-cta-card__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 52px;
  border-radius: 14px;
  background: #ffffff;
  color: #0e0a25;
  font-weight: 800;
  font-size: 15px;
  text-decoration: none;
  transition: transform 160ms ease;
}
.w-cta-card__btn:hover { transform: translateY(-2px); }

.w-restart {
  margin-top: 14px;
  text-align: center;
}
.w-restart button {
  background: transparent;
  border: none;
  color: var(--w-fg-muted);
  font-family: inherit;
  font-size: 13px;
  cursor: pointer;
  text-decoration: underline;
}

@media (max-width: 460px) {
  .w-coach { padding: 16px; border-radius: 14px; }
  .w-grid--2 { grid-template-columns: 1fr; }
  .w-result__score { width: 116px; height: 116px; }
}
`;
