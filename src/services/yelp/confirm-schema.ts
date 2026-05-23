import { z } from "zod";

export const yelpConfirmSchema = z.object({
    yelpBusinessId: z.string().min(1).max(200),
    businessId: z.string().uuid(),
});
