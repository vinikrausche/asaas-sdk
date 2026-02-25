import { z } from "zod";

// DTO alinhado ao request do endpoint POST /v3/customers.
export const createCustomerInputSchema = z.object({
  name: z.string().min(1),
  cpfCnpj: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().min(1).optional(),
  mobilePhone: z.string().min(1).optional(),
  address: z.string().min(1).optional(),
  addressNumber: z.string().min(1).optional(),
  complement: z.string().max(255).optional(),
  province: z.string().min(1).optional(),
  postalCode: z.string().min(1).optional(),
  externalReference: z.string().min(1).optional(),
  notificationDisabled: z.boolean().optional(),
  additionalEmails: z.string().min(1).optional(),
  municipalInscription: z.string().min(1).optional(),
  stateInscription: z.string().min(1).optional(),
  observations: z.string().min(1).optional(),
  groupName: z.string().min(1).optional(),
  company: z.string().min(1).optional(),
  foreignCustomer: z.boolean().optional()
});

export const customerPersonTypeSchema = z.enum(["JURIDICA", "FISICA"]);

// Schema de resposta para criacao de cliente.
export const createCustomerOutputSchema = z
  .object({
    object: z.string(),
    id: z.string(),
    dateCreated: z.string(),
    name: z.string(),
    email: z.string().nullable().optional(),
    phone: z.string().nullable().optional(),
    mobilePhone: z.string().nullable().optional(),
    address: z.string().nullable().optional(),
    addressNumber: z.string().nullable().optional(),
    complement: z.string().nullable().optional(),
    province: z.string().nullable().optional(),
    city: z.number().int().nullable().optional(),
    cityName: z.string().nullable().optional(),
    state: z.string().nullable().optional(),
    country: z.string().nullable().optional(),
    postalCode: z.string().nullable().optional(),
    cpfCnpj: z.string(),
    personType: customerPersonTypeSchema.optional(),
    deleted: z.boolean().optional(),
    additionalEmails: z.string().nullable().optional(),
    externalReference: z.string().nullable().optional(),
    notificationDisabled: z.boolean().optional(),
    observations: z.string().nullable().optional(),
    foreignCustomer: z.boolean().optional()
  })
  .passthrough();

export type CreateCustomerInputDto = z.infer<typeof createCustomerInputSchema>;
export type CreateCustomerOutputDto = z.infer<typeof createCustomerOutputSchema>;
export type CustomerPersonType = z.infer<typeof customerPersonTypeSchema>;

export function parseCreateCustomerInput(input: unknown): CreateCustomerInputDto {
  return createCustomerInputSchema.parse(input);
}

export function parseCreateCustomerOutput(output: unknown): CreateCustomerOutputDto {
  return createCustomerOutputSchema.parse(output);
}
