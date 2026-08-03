import { z } from "zod";

export const createPlaceActionSchema = z.object({
    businessId: z.string().uuid(),
    placeActionType: z.string().min(1).max(120),
    uri: z
        .string()
        .trim()
        .url()
        .max(500)
        .refine((value) => ["http:", "https:"].includes(new URL(value).protocol), {
            message: "Link must use HTTP or HTTPS",
        }),
    isPreferred: z.boolean().optional(),
});

export const deletePlaceActionSchema = z.object({
    linkId: z.string().uuid(),
});
