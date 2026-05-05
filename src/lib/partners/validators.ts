/** Zod schemas at the HTTP boundary for partner profile / status updates. */

import { z } from "zod";
import { VALID_PERSONAS } from "./types";

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

/** Admin operation: change partner approval status. */
export const AdminStatusSchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]),
});
export type AdminStatusInput = z.infer<typeof AdminStatusSchema>;

/** Self-service: onboarding wizard. All fields optional; a partial update. */
export const OnboardingSchema = z.object({
  persona: z.enum(VALID_PERSONAS).optional(),
  agencyName: z.string().optional(),
  agencyLogoUrl: z.string().nullable().optional(),
  agencyBrandColor: z
    .string()
    .regex(HEX_COLOR, { message: "INVALID_COLOR" })
    .optional(),
  agencyTagline: z.string().nullable().optional(),
  /** When true, marks the partner as having completed onboarding. */
  complete: z.boolean().optional(),
});
export type OnboardingInput = z.infer<typeof OnboardingSchema>;

/** Self-service: white-label branding for the coach output. */
export const BrandingSchema = z.object({
  agencyName: z.string().optional(),
  agencyLogoUrl: z.string().nullable().optional(),
  agencyBrandColor: z.string().optional(), // soft validation in service
  agencyTagline: z.string().nullable().optional(),
});
export type BrandingInput = z.infer<typeof BrandingSchema>;
