import type { GapAnalysisOutput } from "@/lib/coach/coverage-types";

export type DurationBucket = "short" | "medium" | "long" | "year";

export type AgeBucket = "under_25" | "25_50" | "50_70" | "over_70";

export type CompanionGroup = "alone" | "partner" | "kids" | "friends";

export type CoverageItem =
  | "visa_premier"
  | "mastercard_gold"
  | "barclays"
  | "none_card"
  | "mutuelle_yes"
  | "mutuelle_no"
  | "ss_fr"
  | "ss_uk";

export type SpecialItem =
  | "winter"
  | "extreme"
  | "cruise"
  | "cancel"
  | "none";

export type WidgetAnswers = {
  destination: string;
  duration: DurationBucket;
  age: AgeBucket;
  companions: CompanionGroup[];
  coverage: CoverageItem[];
  specials: SpecialItem[];
};

export type WidgetTheme = {
  color: string;
  mode: "light" | "dark" | "auto";
};

export type AnalyzePayload = {
  partner: string;
  lang: "fr" | "en";
  answers: WidgetAnswers;
};

export type AnalyzeResponse = {
  shareId: string;
  output: GapAnalysisOutput;
  ctaUrl: string;
};
