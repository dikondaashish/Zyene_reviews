import { z } from "zod";

export const patchListingSchema = z.object({
    businessId: z.string().uuid(),
    title: z.string().trim().min(1).max(200).optional(),
    websiteUri: z.string().trim().max(500).optional(),
    primaryPhone: z.string().trim().max(30).optional(),
    description: z.string().max(2000).optional(),
}).superRefine((value, ctx) => {
    const hasField =
        value.title !== undefined ||
        value.websiteUri !== undefined ||
        value.primaryPhone !== undefined ||
        value.description !== undefined;

    if (!hasField) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "No updatable fields provided",
        });
    }
});
