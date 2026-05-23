import { z } from "zod";

export const contactModeSchema = z.enum(["hidden", "optional", "required"]);

export const privateFeedbackSchema = z
    .object({
        review_request_id: z.string().uuid().optional().nullable(),
        business_id: z.string().uuid().optional().nullable(),
        rating: z.number().int().min(1).max(5),
        content: z.string().max(5000).optional().default(""),
        customer_email: z.string().max(255).optional().nullable(),
        customer_phone: z.string().max(32).optional().nullable(),
        selected_staff: z.array(z.string()).optional().nullable(),
    })
    .refine(
        (data) => Boolean(data.review_request_id || data.business_id),
        { message: "Either review_request_id or business_id is required" }
    );

export function normalizeContactMode(value: unknown, fallback: "hidden" | "optional" | "required") {
    const p = contactModeSchema.safeParse(value);
    return p.success ? p.data : fallback;
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidPhoneDigits(p: string) {
    const digits = p.replace(/\D/g, "");
    return digits.length >= 7 && digits.length <= 15 && /^[\d+][\d\s().-]{6,31}$/.test(p.trim());
}
