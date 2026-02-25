import { z } from "zod";

export const subscriptionBillingTypeSchema = z.enum(["UNDEFINED", "BOLETO", "CREDIT_CARD", "PIX"]);
export const subscriptionCycleSchema = z.enum([
  "WEEKLY",
  "BIWEEKLY",
  "MONTHLY",
  "BIMONTHLY",
  "QUARTERLY",
  "SEMIANNUALLY",
  "YEARLY"
]);
export const subscriptionDiscountTypeSchema = z.enum(["FIXED", "PERCENTAGE"]);
export const subscriptionFineTypeSchema = z.enum(["FIXED", "PERCENTAGE"]);

export const subscriptionSaveDiscountSchema = z.object({
  value: z.number(),
  dueDateLimitDays: z.number().int(),
  type: subscriptionDiscountTypeSchema
});

export const subscriptionSaveInterestSchema = z.object({
  value: z.number()
});

export const subscriptionSaveFineSchema = z.object({
  value: z.number(),
  type: subscriptionFineTypeSchema
});

export const subscriptionSaveSplitSchema = z.object({
  walletId: z.string().min(1),
  fixedValue: z.number().optional(),
  percentualValue: z.number().optional(),
  externalReference: z.string().min(1).optional(),
  description: z.string().min(1).optional()
});

export const subscriptionSaveCallbackSchema = z.object({
  successUrl: z.string().max(255),
  autoRedirect: z.boolean().optional()
});

// DTO alinhado ao request do endpoint POST /v3/subscriptions.
export const createSubscriptionInputSchema = z.object({
  customer: z.string().min(1),
  billingType: subscriptionBillingTypeSchema,
  value: z.number(),
  nextDueDate: z.string().min(1),
  cycle: subscriptionCycleSchema,
  discount: subscriptionSaveDiscountSchema.optional(),
  interest: subscriptionSaveInterestSchema.optional(),
  fine: subscriptionSaveFineSchema.optional(),
  description: z.string().max(500).optional(),
  endDate: z.string().min(1).optional(),
  maxPayments: z.number().int().optional(),
  externalReference: z.string().min(1).optional(),
  split: z.array(subscriptionSaveSplitSchema).optional(),
  callback: subscriptionSaveCallbackSchema.optional()
});

export const subscriptionResponseBillingTypeSchema = z.enum([
  "UNDEFINED",
  "BOLETO",
  "CREDIT_CARD",
  "DEBIT_CARD",
  "TRANSFER",
  "DEPOSIT",
  "PIX"
]);
export const subscriptionStatusSchema = z.enum(["ACTIVE", "EXPIRED", "INACTIVE"]);
export const subscriptionSplitStatusSchema = z.enum(["ACTIVE", "DISABLED"]);
export const subscriptionSplitDisabledReasonSchema = z.enum([
  "WALLET_UNABLE_TO_RECEIVE",
  "VALUE_DIVERGENCE"
]);

export const subscriptionResponseDiscountSchema = z.object({
  value: z.number(),
  dueDateLimitDays: z.number().int(),
  type: subscriptionDiscountTypeSchema
});

export const subscriptionResponseFineSchema = z.object({
  value: z.number()
});

export const subscriptionResponseInterestSchema = z.object({
  value: z.number()
});

export const subscriptionResponseSplitSchema = z.object({
  walletId: z.string(),
  fixedValue: z.number().optional(),
  percentualValue: z.number().nullable().optional(),
  externalReference: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  status: subscriptionSplitStatusSchema.optional(),
  disabledReason: subscriptionSplitDisabledReasonSchema.optional()
});

// Schema de resposta para criacao de assinatura.
export const createSubscriptionOutputSchema = z
  .object({
    object: z.string(),
    id: z.string(),
    dateCreated: z.string(),
    customer: z.string(),
    paymentLink: z.string().nullable().optional(),
    billingType: subscriptionResponseBillingTypeSchema,
    cycle: subscriptionCycleSchema,
    value: z.number(),
    nextDueDate: z.string(),
    endDate: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    status: subscriptionStatusSchema,
    discount: subscriptionResponseDiscountSchema.nullable().optional(),
    fine: subscriptionResponseFineSchema.nullable().optional(),
    interest: subscriptionResponseInterestSchema.nullable().optional(),
    deleted: z.boolean().optional(),
    maxPayments: z.number().int().nullable().optional(),
    externalReference: z.string().nullable().optional(),
    checkoutSession: z.string().nullable().optional(),
    split: z.array(subscriptionResponseSplitSchema).nullable().optional()
  })
  .passthrough();

export type CreateSubscriptionInputDto = z.infer<typeof createSubscriptionInputSchema>;
export type CreateSubscriptionOutputDto = z.infer<typeof createSubscriptionOutputSchema>;
export type SubscriptionBillingType = z.infer<typeof subscriptionBillingTypeSchema>;
export type SubscriptionCycle = z.infer<typeof subscriptionCycleSchema>;
export type SubscriptionStatus = z.infer<typeof subscriptionStatusSchema>;

export function parseCreateSubscriptionInput(input: unknown): CreateSubscriptionInputDto {
  return createSubscriptionInputSchema.parse(input);
}

export function parseCreateSubscriptionOutput(output: unknown): CreateSubscriptionOutputDto {
  return createSubscriptionOutputSchema.parse(output);
}
