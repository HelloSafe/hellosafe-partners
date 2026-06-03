/** Zod schemas for the postback module. */

import { z } from "zod";

/** A monetary amount as number or numeric string — must be finite and >= 0. */
const MoneyInput = z
  .union([z.number(), z.string()])
  .refine(
    (v) => {
      const n = typeof v === "string" ? parseFloat(v) : v;
      return Number.isFinite(n) && n >= 0;
    },
    { message: "INVALID_AMOUNT" },
  );

/** Payload posted by HelloSafe when a partner-attributed sale lands. */
export const PostbackPayloadSchema = z.object({
  /** "<partnerCode>-<shortCode>" as produced by /r redirect cookie. */
  ref: z.string().min(1),
  externalOrderId: z.string().min(1),
  amount: MoneyInput.optional(),
  commission: MoneyInput.optional(),
  currency: z
    .string()
    .regex(/^[A-Za-z]{3}$/, { message: "INVALID_CURRENCY" })
    .optional(),
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
