/** Zod schemas for the postback module. */

import { z } from "zod";

/** Payload posted by HelloSafe when a partner-attributed sale lands. */
export const PostbackPayloadSchema = z.object({
  /** "<partnerCode>-<shortCode>" as produced by /r redirect cookie. */
  ref: z.string().min(1),
  externalOrderId: z.string().min(1),
  amount: z.union([z.number(), z.string()]).optional(),
  commission: z.union([z.number(), z.string()]).optional(),
  currency: z.string().optional(),
  status: z.enum(["pending", "validated", "cancelled"]).optional(),
  subId: z.string().optional(),
});
export type PostbackPayload = z.infer<typeof PostbackPayloadSchema>;

/** Admin helper: simulate a conversion for a given link's shortCode. */
export const SimulateConversionSchema = z.object({
  shortCode: z.string().min(1),
  amount: z.number().optional(),
  commission: z.number().optional(),
  status: z.enum(["pending", "validated", "cancelled"]).optional(),
});
export type SimulateConversionInput = z.infer<typeof SimulateConversionSchema>;
