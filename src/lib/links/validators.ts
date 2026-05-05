/**
 * Zod schemas for the links HTTP boundary.
 */

import { z } from "zod";
import { DESTINATIONS, type DestinationKey } from "./destinations";

export const CreateLinkSchema = z.object({
  destination: z
    .string()
    .refine(
      (v): v is DestinationKey =>
        (DESTINATIONS as readonly string[]).includes(v),
      { message: "INVALID_DESTINATION" },
    ),
  label: z.string().trim().optional(),
  language: z.enum(["fr", "en"]).optional(),
  campaign: z.string().trim().optional(),
  subId: z.string().trim().optional(),
});
export type CreateLinkInput = z.infer<typeof CreateLinkSchema>;
