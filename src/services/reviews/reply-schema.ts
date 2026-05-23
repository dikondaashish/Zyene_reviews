import { z } from "zod";

export const reviewReplySchema = z.object({
    text: z.string().min(1, "Reply text is required").max(4096),
});
