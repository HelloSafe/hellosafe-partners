/**
 * Zod schemas for the inputs of the coach module's HTTP layer.
 * Route handlers call these to validate the request body / params before
 * passing to service.ts.
 */

import { z } from "zod";
import type { CoverageData, WizardInputs } from "./coverage-types";

// We don't yet validate the inner CoverageData / WizardInputs shape with
// Zod (they are large nested objects). For now we trust the TS type at
// the boundary but keep the API stable so we can tighten later.
const coverageData = z.custom<CoverageData>((v) => v !== null && typeof v === "object");
const wizardInputs = z.custom<WizardInputs>(
  (v) =>
    v !== null &&
    typeof v === "object" &&
    typeof (v as WizardInputs).client?.label === "string",
);

// ---------- analyses ----------

export const RunAnalysisInputSchema = z.object({
  inputs: wizardInputs,
  locale: z.enum(["fr", "en"]).optional(),
});
export type RunAnalysisInput = z.infer<typeof RunAnalysisInputSchema>;

// ---------- contracts ----------

export const CreateContractSchema = z.object({
  name: z.string().trim().min(1),
  issuer: z.string().trim().optional().nullable(),
  notes: z.string().optional().nullable(),
  active: z.boolean().optional(),
  data: coverageData,
});
export type CreateContractInput = z.infer<typeof CreateContractSchema>;

export const UpdateContractSchema = z.object({
  name: z.string().trim().min(1).optional(),
  issuer: z.string().trim().optional().nullable(),
  notes: z.string().optional().nullable(),
  active: z.boolean().optional(),
  data: coverageData.optional(),
});
export type UpdateContractInput = z.infer<typeof UpdateContractSchema>;

export const ExtractContractSchema = z.object({
  text: z.string().max(50_000),
});
export type ExtractContractInput = z.infer<typeof ExtractContractSchema>;

// ---------- baseline ----------

export const BaselineQuerySchema = z.object({
  locale: z.enum(["fr", "en"]).default("fr"),
});
