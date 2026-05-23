import { z } from "zod";

export const updateProfileSchema = z.object({
    full_name: z.string().max(200),
});
