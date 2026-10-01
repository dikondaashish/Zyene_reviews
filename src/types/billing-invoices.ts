import { z } from "zod";

export const stripeInvoiceUrlSchema = z.url().refine((value) => {
    try {
        const url = new URL(value);
        return url.protocol === "https:" && !url.username && !url.password &&
            (url.hostname === "stripe.com" || url.hostname.endsWith(".stripe.com"));
    } catch {
        return false;
    }
});

export const billingInvoiceSchema = z.object({
    id: z.string(),
    number: z.string().nullable(),
    createdAt: z.iso.datetime(),
    amount: z.string(),
    isFreeTrial: z.boolean().default(false),
    status: z.enum(["draft", "open", "paid", "uncollectible", "void"]),
    pdfUrl: stripeInvoiceUrlSchema.nullable(),
    hostedUrl: stripeInvoiceUrlSchema.nullable(),
    receiptUrl: stripeInvoiceUrlSchema.nullable().default(null),
    paymentUrl: stripeInvoiceUrlSchema.nullable().default(null),
});

export const billingInvoicesPageSchema = z.object({
    organizationId: z.string(),
    invoices: z.array(billingInvoiceSchema),
    nextCursor: z.string().nullable(),
});

export const billingInvoicesResponseSchema = z.object({
    success: z.literal(true),
    data: billingInvoicesPageSchema,
});

export type BillingInvoice = z.infer<typeof billingInvoiceSchema>;
export type BillingInvoicesPage = z.infer<typeof billingInvoicesPageSchema>;
