"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { flagUrl, listCountries } from "@/lib/countries";
import type { TripFormState } from "./TripForm";
import {
  type DisplayOffer,
  type GuaranteeFilter,
  GUARANTEE_FILTER_REGEX,
} from "./types";
import { OfferCard } from "./OfferCard";
import { ShareModal } from "./ShareModal";
import { computeScore } from "./scoring";

type SortKey = "price" | "coverage";

export function OffersResults({
  trip,
  offers,
  includeCancellation,
  onToggleCancellation,
  onEditTrip,
  isRefetching,
}: {
  trip: TripFormState;
  offers: DisplayOffer[];
  includeCancellation: boolean;
  onToggleCancellation: (v: boolean) => void;
  onEditTrip: () => void;
  isRefetching: boolean;
}) {
  const t = useTranslations("dashboard.products.results");
  const tProducts = useTranslations("dashboard.products");
  const [sort, setSort] = useState<SortKey>("price");
  const [filters, setFilters] = useState<Set<GuaranteeFilter>>(new Set());
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [shareTarget, setShareTarget] = useState<DisplayOffer | "all" | null>(
    null,
  );

  // Compute score per offer once
  const decorated = useMemo(
    () => offers.map((o) => ({ offer: o, score: computeScore(o) })),
    [offers],
  );

  // Apply guarantee filters
  const filtered = useMemo(() => {
    if (filters.size === 0) return decorated;
    return decorated.filter(({ offer }) => {
      const garanties =
        offer.priceData?.partnerProductInfo?.allInfoFromPartnerApi?.garanties ?? [];
      return Array.from(filters).every((f) => {
        const re = GUARANTEE_FILTER_REGEX[f];
        return garanties.some((g) =>
          re.test(`${g.code_garantie ?? ""} ${g.label ?? ""}`),
        );
      });
    });
  }, [decorated, filters]);

  // Sort
  const sorted = useMemo(() => {
    const copy = [...filtered];
    if (sort === "price") {
      copy.sort(
        (a, b) =>
          (a.offer.priceData?.priceInCent ?? Infinity) -
          (b.offer.priceData?.priceInCent ?? Infinity),
      );
    } else {
      copy.sort((a, b) => b.score - a.score);
    }
    return copy;
  }, [filtered, sort]);

  // Best price + top coverage in the *filtered* set (so badges follow filters)
  const cheapestId = useMemo(() => {
    const valid = filtered.filter((d) => d.offer.priceData?.priceInCent != null);
    if (!valid.length) return null;
    return valid.reduce((a, b) =>
      (a.offer.priceData!.priceInCent ?? Infinity) <
      (b.offer.priceData!.priceInCent ?? Infinity)
        ? a
        : b,
    ).offer.id;
  }, [filtered]);

  const topCoverageId = useMemo(() => {
    if (!filtered.length) return null;
    return filtered.reduce((a, b) => (a.score >= b.score ? a : b)).offer.id;
  }, [filtered]);

  const toggleExpanded = (id: number) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleFilter = (f: GuaranteeFilter) =>
    setFilters((prev) => {
      const next = new Set(prev);
      if (next.has(f)) next.delete(f);
      else next.add(f);
      return next;
    });

  return (
    <div>
      {/* ─── Sticky top: trip recap ─────────────────────────────────────── */}
      <TripRecap trip={trip} onEdit={onEditTrip} />

      {/* ─── 2-col layout ───────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Sidebar */}
        <aside className="lg:sticky lg:top-[88px] self-start space-y-5">
          <FiltersPanel
            includeCancellation={includeCancellation}
            onToggleCancellation={onToggleCancellation}
            filters={filters}
            onToggleFilter={toggleFilter}
          />
        </aside>

        {/* Main */}
        <main>
          <Toolbar
            offerCount={sorted.length}
            sort={sort}
            onSortChange={setSort}
            isLoading={isRefetching}
          />

          {sorted.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-surface-300 bg-white p-10 text-center text-sm text-ink-500">
              {t("noResults")}
            </div>
          ) : (
            <div className="space-y-4">
              {sorted.map(({ offer, score }, idx) => (
                <OfferCard
                  key={offer.id}
                  offer={offer}
                  score={score}
                  rank={idx + 1}
                  isCheapest={offer.id === cheapestId}
                  isTopCoverage={offer.id === topCoverageId}
                  expanded={expanded.has(offer.id)}
                  onToggleExpand={() => toggleExpanded(offer.id)}
                  onShare={() => setShareTarget(offer)}
                />
              ))}
            </div>
          )}

          <div className="mt-6">
            <Link
              href="/dashboard/products"
              className="text-sm text-ink-500 hover:text-ink-900"
            >
              ← {tProducts("title")}
            </Link>
          </div>
        </main>
      </div>

      {shareTarget && (
        <ShareModal
          trip={trip}
          offerId={shareTarget === "all" ? null : shareTarget.id}
          offerName={
            shareTarget === "all" ? null : shareTarget.name
          }
          onClose={() => setShareTarget(null)}
        />
      )}
    </div>
  );
}

// ─── Trip recap header (sticky) ──────────────────────────────────────────────

function TripRecap({
  trip,
  onEdit,
}: {
  trip: TripFormState;
  onEdit: () => void;
}) {
  const t = useTranslations("dashboard.products.results");
  const countries = useMemo(() => listCountries("fr"), []);
  const byCode = useMemo(
    () => new Map(countries.map((c) => [c.code, c])),
    [countries],
  );

  const fmtDate = (iso: string) =>
    new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "short",
    }).format(new Date(iso));

  const totalAge =
    trip.travellers.length === 1
      ? `${trip.travellers.length} pers. (${trip.travellers[0].age})`
      : `${trip.travellers.length} pers.`;

  return (
    <div className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-surface-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-3 py-3">
          {/* Destinations */}
          <div className="flex items-center gap-2">
            {trip.arrivalCountries.slice(0, 3).map((code) => (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                key={code}
                src={flagUrl(code)}
                alt={byCode.get(code)?.name ?? code}
                className="h-5 w-auto rounded-sm border border-surface-200"
              />
            ))}
            {trip.arrivalCountries.length > 3 && (
              <span className="text-xs text-ink-500">
                +{trip.arrivalCountries.length - 3}
              </span>
            )}
            <span className="text-sm font-semibold text-ink-900 truncate max-w-[200px]">
              {trip.arrivalCountries
                .map((c) => byCode.get(c)?.name ?? c)
                .join(", ")}
            </span>
          </div>

          <span className="text-ink-300">·</span>

          <span className="text-sm text-ink-700 whitespace-nowrap">
            {fmtDate(trip.startDate)} → {fmtDate(trip.endDate)}
          </span>

          <span className="text-ink-300">·</span>

          <span className="text-sm text-ink-700 whitespace-nowrap">
            {totalAge}
          </span>

          <button
            type="button"
            onClick={onEdit}
            className="ml-auto h-8 px-3 inline-flex items-center rounded-lg border border-surface-300 bg-white text-xs font-semibold text-ink-700 hover:border-brand-300 hover:text-brand-700 transition-colors"
          >
            ✎ {t("modifyTrip")}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Filters sidebar ─────────────────────────────────────────────────────────

function FiltersPanel({
  includeCancellation,
  onToggleCancellation,
  filters,
  onToggleFilter,
}: {
  includeCancellation: boolean;
  onToggleCancellation: (v: boolean) => void;
  filters: Set<GuaranteeFilter>;
  onToggleFilter: (f: GuaranteeFilter) => void;
}) {
  const t = useTranslations("dashboard.products.results");

  const guaranteeOptions: Array<{ key: GuaranteeFilter; label: string }> = [
    { key: "liability", label: t("guaranteeLiability") },
    { key: "delay", label: t("guaranteeDelay") },
    { key: "baggage", label: t("guaranteeBaggage") },
    { key: "sports", label: t("guaranteeSports") },
  ];

  return (
    <>
      <section className="rounded-xl border border-surface-200 bg-white p-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-ink-500 mb-3">
          {t("personalize")}
        </h3>
        <ToggleRow
          label={t("guaranteeCancellation")}
          on={includeCancellation}
          onChange={onToggleCancellation}
        />
      </section>

      <section className="rounded-xl border border-surface-200 bg-white p-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-ink-500 mb-3">
          {t("filtersTitle")}
        </h3>
        <p className="text-[11px] text-ink-500 mb-3">{t("filterRequired")}</p>
        <div className="space-y-2">
          {guaranteeOptions.map((opt) => (
            <ToggleRow
              key={opt.key}
              label={opt.label}
              on={filters.has(opt.key)}
              onChange={() => onToggleFilter(opt.key)}
              compact
            />
          ))}
        </div>
      </section>
    </>
  );
}

function ToggleRow({
  label,
  on,
  onChange,
  compact,
}: {
  label: string;
  on: boolean;
  onChange: (v: boolean) => void;
  compact?: boolean;
}) {
  return (
    <label
      className={`flex items-center gap-2 cursor-pointer ${compact ? "py-0.5" : ""}`}
    >
      <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={() => onChange(!on)}
        className={`relative h-5 w-9 rounded-full transition-colors ${
          on ? "bg-brand-500" : "bg-surface-300"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
            on ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
      </button>
      <span className="text-sm text-ink-900 select-none">{label}</span>
    </label>
  );
}

// ─── Toolbar ─────────────────────────────────────────────────────────────────

function Toolbar({
  offerCount,
  sort,
  onSortChange,
  isLoading,
}: {
  offerCount: number;
  sort: SortKey;
  onSortChange: (s: SortKey) => void;
  isLoading: boolean;
}) {
  const t = useTranslations("dashboard.products.results");
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
      <h2 className="text-lg font-bold text-ink-900">
        {isLoading ? "…" : t("offersFound", { count: offerCount })}
      </h2>
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">
          {t("sortBy")}
        </span>
        <div className="inline-flex rounded-lg border border-surface-300 bg-white p-1">
          {(["price", "coverage"] as SortKey[]).map((s) => (
            <button
              key={s}
              onClick={() => onSortChange(s)}
              className={`px-3 h-8 rounded-md text-sm font-medium transition-colors ${
                sort === s
                  ? "bg-brand-50 text-brand-700"
                  : "text-ink-700 hover:bg-surface-100"
              }`}
            >
              {s === "price" ? t("sortPrice") : t("sortCoverage")}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
