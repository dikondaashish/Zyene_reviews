import { z } from "zod";

export const createPlaceActionSchema = z.object({
    businessId: z.string().uuid(),
    placeActionType: z.string().min(1).max(120),
    uri: z.string().trim().url().max(500),
    isPreferred: z.boolean().optional(),
});

export const deletePlaceActionSchema = z.object({
    linkId: z.string().uuid(),
});
