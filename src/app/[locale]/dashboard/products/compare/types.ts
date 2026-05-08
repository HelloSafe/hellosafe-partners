/**
 * Loose typing of the HelloSafe `display-offers` payload — we only read
 * the fields we display. The upstream shape can extend without breaking
 * this.
 */
export type DisplayOffer = {
  id: number;
  name: string;
  insurer?: { id: number; name: string; logo?: { url?: string | null } };
  offerSettingCurrency?: string;
  priceData?: {
    priceInCent: number | null;
    currency: string | null;
    partnerProductInfo?: {
      formuleLabel?: string;
      allInfoFromPartnerApi?: {
        garanties?: Array<{
          icone?: string;
          label?: string;
          code_garantie?: string;
          valeur?: string;
        }>;
      };
    };
  };
  yesList?: Array<{ text?: string; label?: string }>;
  noList?: Array<{ text?: string; label?: string }>;
  ipid?: { url?: string | null } | null;
  cgv?: { url?: string | null } | null;
  partner?: string;
};

export type GuaranteeFilter =
  | "liability"
  | "delay"
  | "baggage"
  | "sports";

export const GUARANTEE_FILTER_REGEX: Record<GuaranteeFilter, RegExp> = {
  liability: /resp(?:onsabilit[eé])?(?:[\s_-]+civile)?|liability|civile/i,
  delay: /retard|delay/i,
  baggage: /bagage|baggage|luggage/i,
  sports: /sport|extr[eê]me|ski|aventure/i,
};
