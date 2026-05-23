import { z } from "zod";

export const bulkActionSchema = z.object({
    ids: z.array(z.string().uuid()).min(1).max(500),
    businessId: z.string().uuid(),
    action: z.enum(["delete", "tag", "request"]),
    data: z.object({
        tags: z.array(z.string().max(80)).max(20).optional(),
        mode: z.enum(["add", "remove"]).optional(),
    }).optional(),
});
