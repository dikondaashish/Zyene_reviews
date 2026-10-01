import { z } from "zod";

const portalResponseSchema = z.object({
    success: z.literal(true),
    data: z.object({
        url: z.string().url().refine((value) => {
            const url = new URL(value);
            return url.protocol === "https:" && url.hostname === "billing.stripe.com"
                && !url.username && !url.password;
        }),
    }),
});

export function parsePortalResponse(payload: unknown): string {
    const parsed = portalResponseSchema.safeParse(payload);
    if (!parsed.success) throw new Error("The billing portal link is unavailable. Please try again.");
    return parsed.data.data.url;
}
