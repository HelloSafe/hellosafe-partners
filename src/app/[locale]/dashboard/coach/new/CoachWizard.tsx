"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import type {
  AgeRange,
  Companion,
  CompanionKind,
  DepartureCountry,
  TripActivity,
  TripPurpose,
  WizardInputs,
} from "@/lib/coverage-types";
import {
  AGE_RANGE_LABEL_EN,
  AGE_RANGE_LABEL_FR,
  COMPANION_LABEL_EN,
  COMPANION_LABEL_FR,
} from "@/lib/coverage-types";

type Baseline = {
  cards: { id: string; name: string; issuer: string | null; locale: string }[];
  mutuelles: { id: string; name: string; locale: string }[];
  socialSecurity: { id: string; name: string; locale: string }[];
  partnerContracts: { id: string; name: string; issuer: string | null }[];
};

const AGE_RANGES: AgeRange[] = [
  "18_25",
  "26_35",
  "36_50",
  "51_65",
  "66_75",
  "over_75",
  "under_18",
];

const COMPANION_KINDS: CompanionKind[] = [
  "spouse_legal",
  "concubin",
  "child_under_25",
  "child_over_25",
  "parent",
  "friend",
];

export function CoachWizard() {
  const locale = useLocale();
  const isEn = locale === "en";
  const ageLabels = isEn ? AGE_RANGE_LABEL_EN : AGE_RANGE_LABEL_FR;
  const compLabels = isEn ? COMPANION_LABEL_EN : COMPANION_LABEL_FR;
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [baseline, setBaseline] = useState<Baseline | null>(null);

  const [data, setData] = useState<WizardInputs>({
    client: {
      label: "",
      ageRange: "36_50",
      companions: [],
      departureCountry: isEn ? "UK" : "FR",
    },
    trip: {
      destination: "",
      destinationLabel: "",
      startDate: nextMonthISO(0),
      endDate: nextMonthISO(7),
      purpose: "leisure",
      activities: [],
      estimatedTripValueEur: 3000,
    },
    coverage: {
      cardId: null,
      mutuelleId: null,
      socialSecurityId: null,
      partnerContractId: null,
    },
  });

  // Refresh baseline when departureCountry changes (drives locale of the catalog).
  useEffect(() => {
    const baselineLocale =
      data.client.departureCountry === "UK" ? "en" : "fr";
    fetch(`/api/coach/baseline?locale=${baselineLocale}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d: Baseline) => {
        setBaseline(d);
        // Auto-pick the social security of the departure country.
        const ssId = d.socialSecurity[0]?.id ?? null;
        const ctrId = d.partnerContracts[0]?.id ?? null;
        setData((prev) => ({
          ...prev,
          coverage: {
            ...prev.coverage,
            socialSecurityId: ssId,
            // Only auto-fill the partner contract if user hasn't picked yet.
            partnerContractId:
              prev.coverage.partnerContractId ?? ctrId ?? null,
          },
        }));
      });
  }, [data.client.departureCountry]);

  const canNext = useMemo(() => {
    if (step === 1) return data.client.label.trim().length > 0;
    if (step === 2) {
      return (
        data.trip.destinationLabel.trim().length > 0 &&
        data.trip.startDate &&
        data.trip.endDate
      );
    }
    if (step === 3) return true;
    return false;
  }, [step, data]);

  const submit = async () => {
    setErr(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/coach/analyses", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ inputs: data, locale }),
      });
      const out = await res.json();
      if (!res.ok) {
        setErr(out.error ?? "Erreur");
        setSubmitting(false);
        return;
      }
      router.push(`/dashboard/coach/${out.id}` as never);
    } catch (e) {
      setErr("Erreur de connexion au serveur.");
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      <Header step={step} isEn={isEn} />

      {step === 1 && (
        <Step1Traveler
          data={data}
          setData={setData}
          ageLabels={ageLabels}
          compLabels={compLabels}
          isEn={isEn}
        />
      )}
      {step === 2 && (
        <Step2Trip data={data} setData={setData} isEn={isEn} />
      )}
      {step === 3 && (
        <Step3Coverage
          data={data}
          setData={setData}
          baseline={baseline}
          isEn={isEn}
        />
      )}
      {step === 4 && (
        <Step4Review
          data={data}
          baseline={baseline}
          ageLabels={ageLabels}
          compLabels={compLabels}
          isEn={isEn}
        />
      )}

      {err && (
        <div className="rounded-xl bg-danger-50 text-danger-600 px-4 py-3 text-sm">
          {err}
        </div>
      )}

      <div className="flex items-center justify-between gap-3 pt-4 border-t border-surface-200">
        <button
          type="button"
          disabled={step === 1 || submitting}
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          className="h-11 px-5 rounded-xl border border-surface-300 text-sm font-semibold disabled:opacity-30"
        >
          ← {isEn ? "Back" : "Retour"}
        </button>
        {step < 4 && (
          <button
            type="button"
            disabled={!canNext}
            onClick={() => setStep((s) => s + 1)}
            className="h-11 px-6 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 disabled:opacity-50 transition-colors"
          >
            {isEn ? "Continue" : "Continuer"} →
          </button>
        )}
        {step === 4 && (
          <button
            type="button"
            disabled={submitting}
            onClick={submit}
            className="h-11 px-6 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 disabled:opacity-50 transition-colors"
          >
            {submitting
              ? isEn
                ? "Computing…"
                : "Analyse en cours…"
              : isEn
              ? "Generate analysis →"
              : "Générer l'analyse →"}
          </button>
        )}
      </div>
    </div>
  );
}

function nextMonthISO(daysOffset: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + 30 + daysOffset);
  return d.toISOString().slice(0, 10);
}

function Header({ step, isEn }: { step: number; isEn: boolean }) {
  const labels = isEn
    ? ["Traveler", "Trip", "Coverage", "Review"]
    : ["Voyageur", "Voyage", "Couvertures", "Récapitulatif"];
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">
        {isEn ? "New analysis" : "Nouvelle analyse"} · {step}/4
      </p>
      <h1 className="mt-2 text-2xl lg:text-3xl font-bold tracking-tight">
        {labels[step - 1]}
      </h1>
      <ol className="mt-5 flex items-center gap-2">
        {labels.map((l, i) => (
          <li
            key={l}
            className={`flex-1 h-1 rounded-full ${
              i + 1 <= step ? "bg-brand-500" : "bg-surface-200"
            }`}
          />
        ))}
      </ol>
    </div>
  );
}

function Step1Traveler({
  data,
  setData,
  ageLabels,
  compLabels,
  isEn,
}: {
  data: WizardInputs;
  setData: (s: WizardInputs) => void;
  ageLabels: Record<AgeRange, string>;
  compLabels: Record<CompanionKind, string>;
  isEn: boolean;
}) {
  const toggleCompanion = (kind: CompanionKind) => {
    const exists = data.client.companions.find((c) => c.kind === kind);
    let next: Companion[];
    if (exists) {
      next = data.client.companions.filter((c) => c.kind !== kind);
    } else {
      next = [...data.client.companions, { kind, count: 1 }];
    }
    setData({ ...data, client: { ...data.client, companions: next } });
  };

  return (
    <div className="rounded-2xl border border-surface-200 bg-white p-7 lg:p-9 space-y-7">
      <Field
        label={isEn ? "Client reference" : "Référence dossier client"}
        hint={
          isEn
            ? "Free text, only visible inside your dashboard. e.g. \"Mr Smith — Bali May\"."
            : "Texte libre, visible uniquement dans votre dashboard. Ex : « M. Martin — Bali mai »."
        }
      >
        <input
          autoFocus
          value={data.client.label}
          onChange={(e) =>
            setData({ ...data, client: { ...data.client, label: e.target.value } })
          }
          placeholder={isEn ? "e.g. Mr Smith — Bali May" : "Ex : Mme Martin — Bali mai"}
          className={inputCls}
        />
      </Field>

      <Field label={isEn ? "Age range" : "Tranche d'âge du voyageur"}>
        <div className="flex flex-wrap gap-2">
          {AGE_RANGES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() =>
                setData({
                  ...data,
                  client: { ...data.client, ageRange: r },
                })
              }
              className={`rounded-lg border px-3 h-9 text-sm font-medium transition-colors ${
                data.client.ageRange === r
                  ? "border-brand-500 bg-brand-50 text-brand-700"
                  : "border-surface-300 text-ink-700 hover:border-brand-300"
              }`}
            >
              {ageLabels[r]}
            </button>
          ))}
        </div>
      </Field>

      <Field
        label={isEn ? "Departure country" : "Pays de départ"}
        hint={
          isEn
            ? "Drives the social security baseline (UK NHS or FR Sécu)."
            : "Détermine la base sécurité sociale (Sécu FR ou NHS UK)."
        }
      >
        <div className="flex gap-2">
          {(["FR", "UK"] as DepartureCountry[]).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() =>
                setData({
                  ...data,
                  client: { ...data.client, departureCountry: c },
                })
              }
              className={`rounded-lg border px-4 h-10 text-sm font-semibold transition-colors ${
                data.client.departureCountry === c
                  ? "border-brand-500 bg-brand-50 text-brand-700"
                  : "border-surface-300 text-ink-700 hover:border-brand-300"
              }`}
            >
              {c === "FR" ? "🇫🇷 France" : "🇬🇧 United Kingdom"}
            </button>
          ))}
        </div>
      </Field>

      <Field
        label={isEn ? "Traveling with…" : "Voyage avec…"}
        hint={
          isEn
            ? "Tap each kind of companion. The Coach will flag who isn't covered by the card insurance."
            : "Cochez chaque type d'accompagnant. Le Coach signalera qui n'est pas couvert par la carte."
        }
      >
        <div className="flex flex-wrap gap-2">
          {COMPANION_KINDS.map((k) => {
            const checked = data.client.companions.find((c) => c.kind === k);
            return (
              <button
                key={k}
                type="button"
                onClick={() => toggleCompanion(k)}
                className={`rounded-lg border px-3 h-10 text-sm font-medium transition-colors ${
                  checked
                    ? "border-brand-500 bg-brand-50 text-brand-700"
                    : "border-surface-300 text-ink-700 hover:border-brand-300"
                }`}
              >
                {checked ? "✓ " : ""}
                {compLabels[k]}
              </button>
            );
          })}
        </div>
      </Field>
    </div>
  );
}

function Step2Trip({
  data,
  setData,
  isEn,
}: {
  data: WizardInputs;
  setData: (s: WizardInputs) => void;
  isEn: boolean;
}) {
  const purposes: TripPurpose[] = [
    "leisure",
    "business",
    "study",
    "expat",
    "visa_required",
    "cruise",
  ];
  const purposeLabel = (p: TripPurpose) =>
    isEn
      ? {
          leisure: "Leisure",
          business: "Business",
          study: "Study",
          expat: "Expat / long stay",
          visa_required: "Visa-required",
          cruise: "Cruise",
        }[p]
      : {
          leisure: "Loisirs",
          business: "Professionnel",
          study: "Études",
          expat: "Expatriation",
          visa_required: "Visa requis",
          cruise: "Croisière",
        }[p];

  const activities: TripActivity[] = [
    "winter_sports",
    "diving",
    "trekking",
    "extreme_sports",
    "motorbike",
  ];
  const actLabel = (a: TripActivity) =>
    isEn
      ? {
          winter_sports: "Skiing / winter sports",
          diving: "Diving",
          trekking: "Trekking / hiking",
          extreme_sports: "Extreme sports",
          motorbike: "Motorbike",
          none: "None",
        }[a]
      : {
          winter_sports: "Ski / sports d'hiver",
          diving: "Plongée",
          trekking: "Trek / randonnée",
          extreme_sports: "Sports extrêmes",
          motorbike: "Moto",
          none: "Aucune",
        }[a];

  return (
    <div className="rounded-2xl border border-surface-200 bg-white p-7 lg:p-9 space-y-7">
      <Field
        label={isEn ? "Destination" : "Destination"}
        hint={
          isEn
            ? "Country and (if helpful) city or region. Mention US/Canada or Asia explicitly when relevant."
            : "Pays et (si pertinent) ville ou région. Précisez USA/Canada ou Asie quand c'est pertinent."
        }
      >
        <input
          value={data.trip.destinationLabel}
          onChange={(e) =>
            setData({
              ...data,
              trip: {
                ...data.trip,
                destinationLabel: e.target.value,
                destination: e.target.value,
              },
            })
          }
          placeholder={
            isEn ? "e.g. Indonesia (Bali)" : "Ex : Indonésie (Bali)"
          }
          className={inputCls}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={isEn ? "Start date" : "Date de départ"}>
          <input
            type="date"
            value={data.trip.startDate}
            onChange={(e) =>
              setData({
                ...data,
                trip: { ...data.trip, startDate: e.target.value },
              })
            }
            className={inputCls}
          />
        </Field>
        <Field label={isEn ? "End date" : "Date de retour"}>
          <input
            type="date"
            value={data.trip.endDate}
            onChange={(e) =>
              setData({
                ...data,
                trip: { ...data.trip, endDate: e.target.value },
              })
            }
            className={inputCls}
          />
        </Field>
      </div>

      <Field
        label={
          isEn
            ? "Estimated trip value (per person, in €)"
            : "Valeur estimée du voyage (par personne, en €)"
        }
        hint={
          isEn
            ? "Used to size the cancellation cap recommendation."
            : "Sert à dimensionner la recommandation d'annulation."
        }
      >
        <input
          type="number"
          min={0}
          step={100}
          value={data.trip.estimatedTripValueEur}
          onChange={(e) =>
            setData({
              ...data,
              trip: {
                ...data.trip,
                estimatedTripValueEur: Number(e.target.value) || 0,
              },
            })
          }
          className={inputCls}
        />
      </Field>

      <Field label={isEn ? "Trip purpose" : "Type de voyage"}>
        <div className="flex flex-wrap gap-2">
          {purposes.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() =>
                setData({ ...data, trip: { ...data.trip, purpose: p } })
              }
              className={`rounded-lg border px-3 h-9 text-sm font-medium transition-colors ${
                data.trip.purpose === p
                  ? "border-brand-500 bg-brand-50 text-brand-700"
                  : "border-surface-300 text-ink-700 hover:border-brand-300"
              }`}
            >
              {purposeLabel(p)}
            </button>
          ))}
        </div>
      </Field>

      <Field label={isEn ? "Risk activities" : "Activités à risque"}>
        <div className="flex flex-wrap gap-2">
          {activities.map((a) => {
            const on = data.trip.activities.includes(a);
            return (
              <button
                key={a}
                type="button"
                onClick={() => {
                  const next = on
                    ? data.trip.activities.filter((x) => x !== a)
                    : [...data.trip.activities, a];
                  setData({ ...data, trip: { ...data.trip, activities: next } });
                }}
                className={`rounded-lg border px-3 h-9 text-sm font-medium transition-colors ${
                  on
                    ? "border-brand-500 bg-brand-50 text-brand-700"
                    : "border-surface-300 text-ink-700 hover:border-brand-300"
                }`}
              >
                {on ? "✓ " : ""}
                {actLabel(a)}
              </button>
            );
          })}
        </div>
      </Field>
    </div>
  );
}

function Step3Coverage({
  data,
  setData,
  baseline,
  isEn,
}: {
  data: WizardInputs;
  setData: (s: WizardInputs) => void;
  baseline: Baseline | null;
  isEn: boolean;
}) {
  if (!baseline) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-6 w-6 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
      </div>
    );
  }
  return (
    <div className="rounded-2xl border border-surface-200 bg-white p-7 lg:p-9 space-y-7">
      <Field
        label={isEn ? "Bank card" : "Carte bancaire"}
        hint={
          isEn
            ? "Pick the closest match. We'll add more cards over time."
            : "Sélectionnez la plus proche. La bibliothèque s'enrichira."
        }
      >
        <SelectChips
          options={[
            { id: "", label: isEn ? "No card / unsure" : "Pas de carte / je ne sais pas" },
            ...baseline.cards.map((c) => ({ id: c.id, label: c.name })),
          ]}
          value={data.coverage.cardId ?? ""}
          onChange={(v) =>
            setData({
              ...data,
              coverage: { ...data.coverage, cardId: v || null },
            })
          }
        />
      </Field>

      <Field
        label={isEn ? "Top-up health insurance (mutuelle)" : "Mutuelle santé"}
      >
        <SelectChips
          options={[
            { id: "", label: isEn ? "None" : "Aucune" },
            ...baseline.mutuelles.map((c) => ({ id: c.id, label: c.name })),
          ]}
          value={data.coverage.mutuelleId ?? ""}
          onChange={(v) =>
            setData({
              ...data,
              coverage: { ...data.coverage, mutuelleId: v || null },
            })
          }
        />
      </Field>

      <Field
        label={
          isEn
            ? `Home country social security (${data.client.departureCountry === "FR" ? "Sécu FR" : "NHS / GHIC"})`
            : `Sécurité sociale du pays de départ (${data.client.departureCountry === "FR" ? "Sécu FR" : "NHS / GHIC"})`
        }
        hint={
          isEn
            ? "Auto-selected based on departure country."
            : "Sélectionnée automatiquement selon le pays de départ."
        }
      >
        <SelectChips
          options={[
            { id: "", label: isEn ? "Skip" : "Ignorer" },
            ...baseline.socialSecurity.map((c) => ({ id: c.id, label: c.name })),
          ]}
          value={data.coverage.socialSecurityId ?? ""}
          onChange={(v) =>
            setData({
              ...data,
              coverage: { ...data.coverage, socialSecurityId: v || null },
            })
          }
        />
      </Field>

      <Field
        label={isEn ? "Your agency contract" : "Votre contrat agence"}
        hint={
          isEn
            ? "Manage your contracts in My contracts. Pre-loaded: Club Med."
            : "Gérez vos contrats depuis Mes contrats. Pré-chargé : Club Med."
        }
      >
        <SelectChips
          options={[
            { id: "", label: isEn ? "No agency contract" : "Pas de contrat agence" },
            ...baseline.partnerContracts.map((c) => ({
              id: c.id,
              label: c.name,
            })),
          ]}
          value={data.coverage.partnerContractId ?? ""}
          onChange={(v) =>
            setData({
              ...data,
              coverage: { ...data.coverage, partnerContractId: v || null },
            })
          }
        />
      </Field>
    </div>
  );
}

function Step4Review({
  data,
  baseline,
  ageLabels,
  compLabels,
  isEn,
}: {
  data: WizardInputs;
  baseline: Baseline | null;
  ageLabels: Record<AgeRange, string>;
  compLabels: Record<CompanionKind, string>;
  isEn: boolean;
}) {
  const lookup = (id: string | null, list: { id: string; name: string }[]) =>
    id ? list.find((c) => c.id === id)?.name : null;
  return (
    <div className="rounded-2xl border border-surface-200 bg-white p-7 lg:p-9 space-y-6">
      <p className="text-sm text-ink-500">
        {isEn
          ? "Quick review before we run the analysis."
          : "Vérification rapide avant de lancer l'analyse."}
      </p>
      <ReviewBlock
        title={isEn ? "Traveler" : "Voyageur"}
        rows={[
          [isEn ? "Reference" : "Référence", data.client.label],
          [isEn ? "Age range" : "Tranche d'âge", ageLabels[data.client.ageRange]],
          [isEn ? "Departure" : "Départ", data.client.departureCountry],
          [
            isEn ? "Companions" : "Accompagnants",
            data.client.companions.length === 0
              ? isEn
                ? "Solo"
                : "Seul"
              : data.client.companions.map((c) => compLabels[c.kind]).join(", "),
          ],
        ]}
      />
      <ReviewBlock
        title={isEn ? "Trip" : "Voyage"}
        rows={[
          [isEn ? "Destination" : "Destination", data.trip.destinationLabel],
          [
            isEn ? "Dates" : "Dates",
            `${data.trip.startDate} → ${data.trip.endDate}`,
          ],
          [
            isEn ? "Trip value" : "Valeur",
            data.trip.estimatedTripValueEur > 0
              ? `${data.trip.estimatedTripValueEur} €`
              : "—",
          ],
          [
            isEn ? "Activities" : "Activités",
            data.trip.activities.length === 0
              ? "—"
              : data.trip.activities.join(", "),
          ],
        ]}
      />
      <ReviewBlock
        title={isEn ? "Coverage stack" : "Couvertures"}
        rows={[
          [
            isEn ? "Card" : "Carte",
            lookup(data.coverage.cardId, baseline?.cards ?? []) ?? "—",
          ],
          [
            isEn ? "Mutuelle" : "Mutuelle",
            lookup(data.coverage.mutuelleId, baseline?.mutuelles ?? []) ?? "—",
          ],
          [
            isEn ? "Social security" : "Sécu",
            lookup(
              data.coverage.socialSecurityId,
              baseline?.socialSecurity ?? [],
            ) ?? "—",
          ],
          [
            isEn ? "Agency contract" : "Contrat agence",
            lookup(
              data.coverage.partnerContractId,
              baseline?.partnerContracts ?? [],
            ) ?? "—",
          ],
        ]}
      />
    </div>
  );
}

function ReviewBlock({
  title,
  rows,
}: {
  title: string;
  rows: [string, string][];
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wider text-ink-500">
        {title}
      </p>
      <dl className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-2">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-baseline justify-between gap-3 border-b border-surface-200 pb-1.5">
            <dt className="text-sm text-ink-500">{k}</dt>
            <dd className="text-sm font-medium text-ink-900 text-right truncate">
              {v}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function SelectChips({
  options,
  value,
  onChange,
}: {
  options: { id: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.id || "none"}
          type="button"
          onClick={() => onChange(o.id)}
          className={`rounded-lg border px-3 h-9 text-sm font-medium transition-colors ${
            value === o.id
              ? "border-brand-500 bg-brand-50 text-brand-700"
              : "border-surface-300 text-ink-700 hover:border-brand-300"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

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
      <span className="block text-sm font-semibold text-ink-900 mb-1">
        {label}
      </span>
      {hint && (
        <span className="block text-xs text-ink-500 mb-2 leading-relaxed">
          {hint}
        </span>
      )}
      {children}
    </label>
  );
}

const inputCls =
  "w-full rounded-lg border border-surface-300 bg-white px-3.5 h-11 text-[0.95rem] text-ink-900 focus-ring transition-colors focus:border-brand-500";
