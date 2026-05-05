/** Row shapes returned by the admin API endpoints. */

export type PartnerRow = {
  id: string;
  userId: string;
  partnerCode: string;
  companyName: string;
  contactName: string;
  website: string | null;
  audience: string | null;
  country: string | null;
  monthlyVisitors: number | null;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  approvedAt: string | null;
  email: string;
  clickCount: number;
  salesCount: number;
  commissionCents: number;
};

export type ConversionRow = {
  id: string;
  externalOrderId: string;
  amountCents: number;
  commissionCents: number;
  currency: string;
  status: "pending" | "validated" | "cancelled";
  createdAt: string;
  validatedAt: string | null;
  partnerCompany: string;
  partnerCode: string;
  linkLabel: string | null;
  linkShortCode: string | null;
  subId: string | null;
};
