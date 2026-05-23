import { z } from "zod";

export const sendRequestSchema = z
    .object({
        customerName: z.string().max(200).optional().nullable(),
        customerPhone: z.string().max(40).optional().nullable(),
        customerEmail: z.string().max(255).optional().nullable(),
        channel: z.enum(["sms", "email", "both"]),
        businessId: z.string().uuid(),
        scheduledFor: z.string().optional().nullable(),
    })
    .superRefine((data, ctx) => {
        const ch = data.channel.toLowerCase();
        const digits = (data.customerPhone || "").replace(/\D/g, "");
        const em = (data.customerEmail || "").trim();

        if (ch === "sms") {
            if (digits.length < 10) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Valid customer phone is required for SMS (at least 10 digits).",
                    path: ["customerPhone"],
                });
            }
        } else if (ch === "email") {
            if (!em || !z.string().email().safeParse(em).success) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Valid customer email is required for Email.",
                    path: ["customerEmail"],
                });
            }
        } else if (ch === "both") {
            if (digits.length < 10) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Phone number is required when sending both SMS and email (at least 10 digits).",
                    path: ["customerPhone"],
                });
            }
            if (!em || !z.string().email().safeParse(em).success) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Email is required when sending both SMS and email.",
                    path: ["customerEmail"],
                });
            }
        }
    });
