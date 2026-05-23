import type { ReactNode } from "react";
import * as z from "zod";

export type CustomerSearchRow = {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    phone: string | null;
};

export function displayCustomerName(c: CustomerSearchRow): string {
    const n = [c.first_name, c.last_name].filter(Boolean).join(" ").trim();
    return n || c.email || c.phone || "Contact";
}

export const formSchema = z
    .object({
        customerName: z.string().max(200).optional().or(z.literal("")),
        customerPhone: z.string().max(40).optional().or(z.literal("")),
        customerEmail: z.string().max(255).optional().or(z.literal("")),
        channel: z.enum(["sms", "email", "both"]),
        scheduleEnabled: z.boolean(),
        scheduleAt: z.string().optional().or(z.literal("")),
    })
    .superRefine((data, ctx) => {
        const digits = (data.customerPhone || "").replace(/\D/g, "");
        const em = (data.customerEmail || "").trim();

        if (data.channel === "sms") {
            if (digits.length < 10) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Enter a valid phone number (at least 10 digits) for SMS.",
                    path: ["customerPhone"],
                });
            }
        } else if (data.channel === "email") {
            if (!z.string().email().safeParse(em).success) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Enter a valid email address for Email.",
                    path: ["customerEmail"],
                });
            }
        } else if (data.channel === "both") {
            if (digits.length < 10) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Both requires a valid phone number (at least 10 digits).",
                    path: ["customerPhone"],
                });
            }
            if (!z.string().email().safeParse(em).success) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Both requires a valid email address.",
                    path: ["customerEmail"],
                });
            }
        }
        if (data.scheduleEnabled) {
            const raw = (data.scheduleAt || "").trim();
            if (!raw) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Pick a date and time to schedule.",
                    path: ["scheduleAt"],
                });
                return;
            }
            const t = new Date(raw).getTime();
            if (Number.isNaN(t)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Invalid schedule date.",
                    path: ["scheduleAt"],
                });
                return;
            }
            if (t < Date.now() + 60_000) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Schedule time must be at least one minute from now.",
                    path: ["scheduleAt"],
                });
            }
        }
    });

export type FormValues = z.infer<typeof formSchema>;

export interface SendRequestDialogProps {
    businessId: string;
    businessSlug?: string;
    businessName?: string;
    initialCustomer?: { name: string; phone: string; email?: string };
    autoOpen?: boolean;
    /** Custom trigger (e.g. customer profile). Omit to use the default “Send Review Request” button. */
    trigger?: ReactNode;
}
