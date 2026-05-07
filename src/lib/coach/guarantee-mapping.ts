/**
 * Maps Supabase insurance_guarantee column values → GuaranteeKey
 * used by the Coach gap-engine.
 */
import type { GuaranteeKey } from "./coverage-types";

export type GuaranteeMap = Partial<Record<string, GuaranteeKey>>;

/** France (card_guarantee_details_fr) */
export const FR_GUARANTEE_MAP: GuaranteeMap = {
  frais_medicaux_etranger: "medical_expenses",
  rapatriement: "repatriation",
  modification_annulation_voyage: "trip_cancellation",
  perte_vol_dommage_bagages: "baggage",
  responsabilite_civile_etranger: "personal_liability",
  retard_transport: "trip_delay",
  dommage_vehicule_location: "rental_car_excess",
  responsabilite_civile_ski: "winter_sports",
};

/** Canada (card_guarantee_details_ca) */
export const CA_GUARANTEE_MAP: GuaranteeMap = {
  hospital_fees_abroad: "medical_expenses",
  rapatriation_assistance: "repatriation",
  cancel_trip: "trip_cancellation",
  luggage_lost: "baggage",
  transport_delay: "trip_delay",
  car_rental_insurance: "rental_car_excess",
};
